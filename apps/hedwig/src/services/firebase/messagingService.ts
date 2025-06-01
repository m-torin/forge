import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported,
  type MessagePayload,
  type Messaging,
  onMessage,
} from 'firebase/messaging';
// React hooks
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { app } from '../../config/firebase';
import { SentryService } from '../sentryService';

import { FirebaseAuthService } from './authService';
import { FirebaseFirestoreService } from './firestoreService';

export interface PushNotification {
  badge?: number;
  body?: string;
  data?: Record<string, any>;
  image?: string;
  sound?: string;
  title?: string;
}

export interface NotificationToken {
  createdAt: Date;
  deviceId: string;
  platform: 'ios' | 'android' | 'web';
  token: string;
  updatedAt: Date;
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
  }),
});

export class FirebaseMessagingService {
  private static messaging: Messaging | null = null;
  private static notificationListener: any = null;
  private static responseListener: any = null;
  private static fcmToken: string | null = null;

  /**
   * Initialize messaging service
   */
  static async initialize(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web FCM initialization
        const supported = await isSupported();
        if (supported) {
          this.messaging = getMessaging(app);
          await this.initializeWebMessaging();
        }
      } else {
        // Mobile push notifications with Expo
        await this.initializeMobileNotifications();
      }
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-messaging-init');
      console.error('Failed to initialize messaging:', error);
    }
  }

  /**
   * Initialize web messaging
   */
  private static async initializeWebMessaging(): Promise<void> {
    if (!this.messaging) return;

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Get FCM token
        const token = await getToken(this.messaging, {
          vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY,
        });
        
        if (token) {
          this.fcmToken = token;
          await this.saveTokenToDatabase(token);
        }

        // Listen for foreground messages
        onMessage(this.messaging, (payload) => {
          this.handleForegroundMessage(payload);
        });
      }
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-messaging-web-init');
      throw error;
    }
  }

  /**
   * Initialize mobile notifications
   */
  private static async initializeMobileNotifications(): Promise<void> {
    try {
      // Check if device is physical
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Push notification permissions not granted');
        return;
      }

      // Get Expo push token
      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      
      if (token) {
        this.fcmToken = token;
        await this.saveTokenToDatabase(token);
      }

      // Set up notification listeners
      this.notificationListener = Notifications.addNotificationReceivedListener(
        this.handleNotificationReceived
      );

      this.responseListener = Notifications.addNotificationResponseReceivedListener(
        this.handleNotificationResponse
      );
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-messaging-mobile-init');
      throw error;
    }
  }

  /**
   * Get FCM token
   */
  static async getToken(): Promise<string | null> {
    try {
      if (this.fcmToken) {
        return this.fcmToken;
      }

      if (Platform.OS === 'web' && this.messaging) {
        const token = await getToken(this.messaging, {
          vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY,
        });
        this.fcmToken = token;
        return token;
      } else if (Device.isDevice) {
        const { data: token } = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        this.fcmToken = token;
        return token;
      }

      return null;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-messaging-get-token');
      return null;
    }
  }

  /**
   * Delete token
   */
  static async deleteToken(): Promise<void> {
    try {
      if (Platform.OS === 'web' && this.messaging) {
        await deleteToken(this.messaging);
      }
      
      // Remove from database
      if (this.fcmToken) {
        await this.removeTokenFromDatabase(this.fcmToken);
      }
      
      this.fcmToken = null;
      await AsyncStorage.removeItem('fcmToken');
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-messaging-delete-token');
      throw error;
    }
  }

  /**
   * Send local notification
   */
  static async sendLocalNotification(notification: PushNotification): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          badge: notification.badge,
          body: notification.body,
          data: notification.data,
          sound: notification.sound || true,
          title: notification.title,
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-messaging-local');
      throw error;
    }
  }

  /**
   * Schedule notification
   */
  static async scheduleNotification(
    notification: PushNotification,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          badge: notification.badge,
          body: notification.body,
          data: notification.data,
          sound: notification.sound || true,
          title: notification.title,
        },
        trigger,
      });
      
      return id;
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-messaging-schedule');
      throw error;
    }
  }

  /**
   * Cancel scheduled notification
   */
  static async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-messaging-cancel');
      throw error;
    }
  }

  /**
   * Get all scheduled notifications
   */
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      SentryService.trackNetworkError(error as Error, 'firebase-messaging-get-scheduled');
      return [];
    }
  }

  /**
   * Set badge count (iOS)
   */
  static async setBadgeCount(count: number): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await Notifications.setBadgeCountAsync(count);
      }
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  /**
   * Clear all notifications
   */
  static async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await this.setBadgeCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  /**
   * Handle foreground message (Web)
   */
  private static handleForegroundMessage(payload: MessagePayload): void {
    console.log('Foreground message received:', payload);
    
    // Show local notification
    if (payload.notification) {
      this.sendLocalNotification({
        body: payload.notification.body,
        data: payload.data,
        image: payload.notification.image,
        title: payload.notification.title,
      });
    }
  }

  /**
   * Handle notification received (Mobile)
   */
  private static handleNotificationReceived(
    notification: Notifications.Notification
  ): void {
    console.log('Notification received:', notification);
    
    // Track in analytics
    SentryService.addBreadcrumb({
      category: 'notification',
      data: {
        body: notification.request.content.body,
        title: notification.request.content.title,
      },
      level: 'info',
      message: 'Notification received',
    });
  }

  /**
   * Handle notification response (Mobile)
   */
  private static handleNotificationResponse(
    response: Notifications.NotificationResponse
  ): void {
    console.log('Notification tapped:', response);
    
    const data = response.notification.request.content.data;
    
    // Handle different notification types
    if (data?.type === 'product') {
      // Navigate to product
      // You would implement navigation here
    } else if (data?.type === 'scan') {
      // Navigate to scanner
      // You would implement navigation here
    }
    
    // Track interaction
    SentryService.addBreadcrumb({
      category: 'notification',
      data: {
        actionIdentifier: response.actionIdentifier,
        ...data,
      },
      level: 'info',
      message: 'Notification interaction',
    });
  }

  /**
   * Save token to database
   */
  private static async saveTokenToDatabase(token: string): Promise<void> {
    try {
      const userId = FirebaseAuthService.getCurrentUser()?.uid;
      if (!userId) return;

      const deviceId = Device.osInternalBuildId || 'unknown';
      
      const tokenData: NotificationToken = {
        createdAt: new Date(),
        deviceId,
        platform: Platform.OS as any,
        token,
        updatedAt: new Date(),
      };

      // Save to Firestore
      await FirebaseFirestoreService.setDocument(
        'users',
        userId,
        {
          notificationTokens: {
            [deviceId]: tokenData,
          },
        },
        true // Merge
      );

      // Save locally
      await AsyncStorage.setItem('fcmToken', token);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  /**
   * Remove token from database
   */
  private static async removeTokenFromDatabase(token: string): Promise<void> {
    try {
      const userId = FirebaseAuthService.getCurrentUser()?.uid;
      if (!userId) return;

      const deviceId = Device.osInternalBuildId || 'unknown';
      
      // Remove from Firestore
      await FirebaseFirestoreService.updateDocument('users', userId, {
        [`notificationTokens.${deviceId}`]: FirebaseFirestoreService.deleteField(),
      });
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  /**
   * Clean up
   */
  static cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }

  /**
   * Request permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } else {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
      }
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  /**
   * Check permissions
   */
  static async checkPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return Notification.permission === 'granted';
      } else {
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted';
      }
    } catch (error) {
      console.error('Failed to check permissions:', error);
      return false;
    }
  }
}

export function useNotificationPermissions() {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    FirebaseMessagingService.checkPermissions()
      .then(setHasPermission)
      .finally(() => setLoading(false));
  }, []);

  const requestPermission = async () => {
    setLoading(true);
    const granted = await FirebaseMessagingService.requestPermissions();
    setHasPermission(granted);
    setLoading(false);
    return granted;
  };

  return { hasPermission, loading, requestPermission };
}

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  useEffect(() => {
    // Get token
    FirebaseMessagingService.getToken().then(setToken);

    // Set up listeners
    const notificationListener = Notifications.addNotificationReceivedListener(
      setNotification
    );

    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        setNotification(response.notification);
      }
    );

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return { notification, token };
}