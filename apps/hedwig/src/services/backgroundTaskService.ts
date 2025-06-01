import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
// React hooks
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { FirebaseAnalyticsService, FirebaseRealtimeDbService } from './firebase';
import { ProductLookupService } from './productLookupService';
import { SentryService } from './sentryService';

const BACKGROUND_FETCH_TASK = 'background-fetch-product-updates';
const BACKGROUND_SYNC_TASK = 'background-sync-offline-data';

export interface BackgroundTaskConfig {
  enableOfflineSync?: boolean;
  enableProductUpdates?: boolean;
  updateInterval?: number; // minutes
}

export class BackgroundTaskService {
  private static isRegistered = false;
  private static config: BackgroundTaskConfig = {
    enableOfflineSync: true,
    enableProductUpdates: true,
    updateInterval: 15, // 15 minutes
  };

  /**
   * Initialize background tasks
   */
  static async initialize(config?: BackgroundTaskConfig): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Background tasks not supported on web');
      return;
    }

    if (config) {
      this.config = { ...this.config, ...config };
    }

    try {
      // Define tasks
      this.defineBackgroundTasks();

      // Register tasks
      if (this.config.enableProductUpdates) {
        await this.registerProductUpdateTask();
      }

      if (this.config.enableOfflineSync) {
        await this.registerOfflineSyncTask();
      }

      console.log('Background tasks initialized');
    } catch (_error) {
      SentryService.captureException(_error as Error);
      console.error('Failed to initialize background tasks:', _error);
    }
  }

  /**
   * Define background tasks
   */
  private static defineBackgroundTasks(): void {
    // Product update task
    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
      try {
        console.log('Running background product update task');
        
        // Get recently scanned products
        const recentBarcodes = await this.getRecentlyScannedBarcodes();
        
        // Update product information
        let updatedCount = 0;
        for (const barcode of recentBarcodes) {
          try {
            const product = await ProductLookupService.lookupProduct(barcode);
            if (product) {
              updatedCount++;
            }
          } catch (_error) {
            console.error(`Failed to update product ${barcode}:`, _error);
          }
        }

        // Log analytics
        FirebaseAnalyticsService.logEvent('feature_used', {
          feature_name: 'background_product_update',
          feature_category: 'background_task',
        });

        console.log(`Updated ${updatedCount} products in background`);
        
        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (_error) {
        SentryService.captureException(_error as Error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });

    // Offline sync task
    TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
      try {
        console.log('Running background offline sync task');
        
        // Sync offline data
        const pendingData = await this.getPendingOfflineData();
        
        if (pendingData.length > 0) {
          // Sync to Firebase
          for (const item of pendingData) {
            try {
              await FirebaseRealtimeDbService.write(item.path, item.data);
              await this.removePendingItem(item.id);
            } catch (_error) {
              console.error('Failed to sync item:', _error);
            }
          }
        }

        console.log(`Synced ${pendingData.length} offline items`);
        
        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (_error) {
        SentryService.captureException(_error as Error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });
  }

  /**
   * Register product update task
   */
  private static async registerProductUpdateTask(): Promise<void> {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: this.config.updateInterval! * 60, // Convert to seconds
        startOnBoot: true,
        stopOnTerminate: false,
      });
      
      console.log('Product update task registered');
    } catch (_error) {
      console.error('Failed to register product update task:', _error);
    }
  }

  /**
   * Register offline sync task
   */
  private static async registerOfflineSyncTask(): Promise<void> {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 30 * 60, // 30 minutes
        startOnBoot: true,
        stopOnTerminate: false,
      });
      
      console.log('Offline sync task registered');
    } catch (_error) {
      console.error('Failed to register offline sync task:', _error);
    }
  }

  /**
   * Unregister all tasks
   */
  static async unregisterAllTasks(): Promise<void> {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
      console.log('All background tasks unregistered');
    } catch (_error) {
      console.error('Failed to unregister tasks:', _error);
    }
  }

  /**
   * Check if task is registered
   */
  static async isTaskRegistered(taskName: string): Promise<boolean> {
    try {
      const tasks = await TaskManager.getRegisteredTasksAsync();
      return tasks.some(task => task.taskName === taskName);
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get background fetch status
   */
  static async getBackgroundFetchStatus(): Promise<BackgroundFetch.BackgroundFetchStatus | null> {
    try {
      return await BackgroundFetch.getStatusAsync();
    } catch (_error) {
      return null;
    }
  }

  /**
   * Get recently scanned barcodes
   */
  private static async getRecentlyScannedBarcodes(): Promise<string[]> {
    try {
      const history = await AsyncStorage.getItem('scan_history');
      if (!history) return [];
      
      const scans = JSON.parse(history) as { timestamp: string; barcode: string }[];
      const recent = scans.filter((scan) => {
        const scanTime = new Date(scan.timestamp).getTime();
        const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return scanTime > dayAgo;
      });
      
      return recent.map((scan) => scan.barcode);
    } catch (_error) {
      return [];
    }
  }

  /**
   * Get pending offline data
   */
  private static async getPendingOfflineData(): Promise<unknown[]> {
    try {
      const pending = await AsyncStorage.getItem('offline_queue');
      return pending ? JSON.parse(pending) : [];
    } catch (_error) {
      return [];
    }
  }

  /**
   * Remove pending item
   */
  private static async removePendingItem(itemId: string): Promise<void> {
    try {
      const pending = await this.getPendingOfflineData();
      const updated = pending.filter(item => item.id !== itemId);
      await AsyncStorage.setItem('offline_queue', JSON.stringify(updated));
    } catch (_error) {
      console.error('Failed to remove pending item:', _error);
    }
  }

  /**
   * Queue data for offline sync
   */
  static async queueForSync(path: string, data: unknown): Promise<void> {
    try {
      const pending = await this.getPendingOfflineData();
      pending.push({
        id: `${Date.now()}_${Math.random()}`,
        data,
        path,
        timestamp: new Date().toISOString(),
      });
      await AsyncStorage.setItem('offline_queue', JSON.stringify(pending));
    } catch (_error) {
      console.error('Failed to queue for sync:', _error);
    }
  }

  /**
   * Manually trigger background fetch
   */
  static async triggerBackgroundFetch(): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        await BackgroundFetch.fetchAsync(BACKGROUND_FETCH_TASK);
      } catch (_error) {
        console.error('Failed to trigger background fetch:', _error);
      }
    }
  }
}

export function useBackgroundTasks() {
  const [status, setStatus] = useState<BackgroundFetch.BackgroundFetchStatus | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Check status
    BackgroundTaskService.getBackgroundFetchStatus().then(setStatus);
    
    // Check registration
    Promise.all([
      BackgroundTaskService.isTaskRegistered(BACKGROUND_FETCH_TASK),
      BackgroundTaskService.isTaskRegistered(BACKGROUND_SYNC_TASK),
    ]).then(([productTask, syncTask]) => {
      setIsRegistered(productTask || syncTask);
    });
  }, []);

  const queueForSync = async (path: string, data: unknown) => {
    await BackgroundTaskService.queueForSync(path, data);
  };

  const triggerSync = async () => {
    await BackgroundTaskService.triggerBackgroundFetch();
  };

  return {
    isRegistered,
    queueForSync,
    status,
    triggerSync,
  };
}