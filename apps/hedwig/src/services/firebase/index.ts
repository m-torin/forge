import { SentryService } from '../sentryService';

import { FirebaseAnalyticsService } from './analyticsService';
import { FirebaseAuthService } from './authService';
import { FirebaseDynamicLinksService } from './dynamicLinksService';
import { FirebaseFirestoreService } from './firestoreService';
import { FirebaseInAppMessagingService } from './inAppMessagingService';
import { FirebaseMessagingService } from './messagingService';
import { FirebasePerformanceService } from './performanceService';
import { FirebaseRealtimeDbService } from './realtimeDbService';
import { FirebaseRemoteConfigService } from './remoteConfigService';
import { FirebaseStorageService } from './storageService';

export class FirebaseServices {
  private static isInitialized = false;

  /**
   * Initialize all Firebase services
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Firebase services already initialized');
      return;
    }

    try {
      console.log('Initializing Firebase services...');

      // Initialize services in order of dependency
      const initPromises = [];

      // Core services (no dependencies)
      initPromises.push(
        FirebaseAuthService.initialize(),
        FirebaseAnalyticsService.initialize(),
        FirebasePerformanceService.initialize()
      );

      // Wait for core services
      await Promise.all(initPromises);

      // Services that may depend on auth
      const secondaryPromises = [
        FirebaseFirestoreService.initialize(),
        FirebaseMessagingService.initialize(),
        FirebaseRemoteConfigService.initialize(),
        FirebaseDynamicLinksService.initialize(),
        FirebaseInAppMessagingService.initialize(),
      ];

      await Promise.all(secondaryPromises);

      // Set up auth state listener
      FirebaseAuthService.addAuthStateListener((user) => {
        if (user) {
          // Update analytics user
          FirebaseAnalyticsService.setUserId(user.uid);
          
          // Get FCM token for authenticated user
          FirebaseMessagingService.getToken();
        } else {
          // Clear user data
          FirebaseAnalyticsService.setUserId(null);
        }
      });

      this.isInitialized = true;
      console.log('Firebase services initialized successfully');

      // Log app open event
      FirebaseAnalyticsService.logAppOpen();
      
      // Complete app startup trace
      FirebasePerformanceService.completeAppStartup();
    } catch (error) {
      SentryService.captureException(error as Error);
      console.error('Failed to initialize Firebase services:', error);
      throw error;
    }
  }

  /**
   * Check if services are initialized
   */
  static isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Clean up all services
   */
  static async cleanup(): Promise<void> {
    try {
      // Clean up services
      FirebaseRealtimeDbService.removeAllListeners();
      FirebaseFirestoreService.removeAllListeners();
      FirebaseMessagingService.cleanup();
      FirebaseDynamicLinksService.cleanup();
      
      // Log session end
      FirebaseAnalyticsService.logSessionEnd();
      
      this.isInitialized = false;
    } catch (error) {
      console.error('Error during Firebase cleanup:', error);
    }
  }
}

// Export all services
export {
  FirebaseAnalyticsService,
  FirebaseAuthService,
  FirebaseDynamicLinksService,
  FirebaseFirestoreService,
  FirebaseInAppMessagingService,
  FirebaseMessagingService,
  FirebasePerformanceService,
  FirebaseRealtimeDbService,
  FirebaseRemoteConfigService,
  FirebaseStorageService,
};

// Export hooks
export { useAuth } from './authService';
export { useRealtimeConnection, useRealtimeData, useRealtimeList } from './realtimeDbService';
export { useFirestoreCollection, useFirestoreDocument } from './firestoreService';
export { useStorageDownload, useStorageUpload } from './storageService';
export { useNotificationPermissions, usePushNotifications } from './messagingService';
export { useAnalytics, useAnalyticsScreen } from './analyticsService';
export { useFeatureFlag, useRemoteConfig, useRemoteConfigAll } from './remoteConfigService';
export { useAutoTrace, usePerformanceTrace } from './performanceService';
export { useDynamicLinks } from './dynamicLinksService';
export { useInAppMessage, useInAppMessaging } from './inAppMessagingService';

// Export types
export type { AuthUser } from './authService';
export type { RealtimeQuery } from './realtimeDbService';
export type { FirestoreDocument, FirestoreQuery } from './firestoreService';
export type { ImageUploadOptions, StorageFile, UploadProgress } from './storageService';
export type { NotificationToken, PushNotification } from './messagingService';
export type { HedwigAnalyticsEvents } from './analyticsService';
export type { HedwigRemoteConfig } from './remoteConfigService';
export type { PerformanceTrace } from './performanceService';
export type { DynamicLinkData, DynamicLinkParams } from './dynamicLinksService';
export type { InAppMessage, MessageDisplay } from './inAppMessagingService';