import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

import { NotificationService } from './notificationService';

export class UpdateService {
  static async checkForUpdates(): Promise<boolean> {
    try {
      if (!Updates.isEnabled) {
        console.log('Updates are disabled in development');
        return false;
      }

      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        console.log('Update available');
        return true;
      } else {
        console.log('App is up to date');
        return false;
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }

  static async downloadAndApplyUpdate(): Promise<boolean> {
    try {
      if (!Updates.isEnabled) {
        console.log('Updates are disabled in development');
        return false;
      }

      // Show notification that download is starting
      await NotificationService.notifySystemAlert('Downloading app update...');

      const updateResult = await Updates.fetchUpdateAsync();
      
      if (updateResult.isNew) {
        console.log('Update downloaded successfully');
        
        // Notify user that update is ready
        await NotificationService.notifySystemAlert('Update ready! Restart to apply.');
        
        // Show alert to restart
        Alert.alert(
          'Update Ready',
          'A new version of the app has been downloaded. Restart to apply the update?',
          [
            {
              style: 'cancel',
              text: 'Later',
            },
            {
              onPress: () => this.reloadApp(),
              text: 'Restart Now',
            },
          ]
        );
        
        return true;
      } else {
        console.log('No new update available');
        return false;
      }
    } catch (error) {
      console.error('Error downloading update:', error);
      await NotificationService.notifySystemAlert('Update failed. Please try again.');
      return false;
    }
  }

  static async reloadApp(): Promise<void> {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error reloading app:', error);
    }
  }

  static async checkForUpdatesWithUserPrompt(): Promise<void> {
    const hasUpdate = await this.checkForUpdates();
    
    if (hasUpdate) {
      Alert.alert(
        'Update Available',
        'A new version of Hedwig is available. Would you like to download it now?',
        [
          {
            style: 'cancel',
            text: 'Not Now',
          },
          {
            onPress: () => this.downloadAndApplyUpdate(),
            text: 'Download',
          },
        ]
      );
    } else {
      Alert.alert('Up to Date', 'You\'re running the latest version of Hedwig!');
    }
  }

  static getUpdateInfo(): {
    isUpdateAvailable: boolean;
    isUpdatePending: boolean;
    createdAt?: Date;
    manifest?: any;
  } {
    if (!Updates.isEnabled) {
      return {
        isUpdateAvailable: false,
        isUpdatePending: false,
      };
    }

    return {
      createdAt: Updates.createdAt,
      isUpdateAvailable: Updates.isAvailable,
      isUpdatePending: Updates.isPending,
      manifest: Updates.manifest,
    };
  }

  // Automatic update check on app startup
  static async initializeUpdates(): Promise<void> {
    try {
      if (!Updates.isEnabled) {
        console.log('Updates disabled in development mode');
        return;
      }

      // Check for updates on app launch
      const hasUpdate = await this.checkForUpdates();
      
      if (hasUpdate) {
        // Silently download update in background
        await this.downloadAndApplyUpdate();
      }
    } catch (error) {
      console.error('Error initializing updates:', error);
    }
  }
}