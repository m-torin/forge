import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

export interface NotificationData {
  body: string;
  categoryIdentifier?: string;
  data?: any;
  title: string;
}

export class NotificationService {
  static async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permission not granted for push notifications');
      return null;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with actual project ID
      });
      
      console.log('Push token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  static async scheduleLocalNotification(
    notification: NotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        body: notification.body,
        categoryIdentifier: notification.categoryIdentifier,
        data: notification.data || {},
        sound: 'default',
        title: notification.title,
      },
      trigger: trigger || null, // null = immediate
    });

    console.log('Scheduled notification:', identifier);
    return identifier;
  }

  static async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  static async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  // Notification categories for different types of alerts
  static async setupNotificationCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync('scan-success', [
      {
        identifier: 'view-details',
        buttonTitle: 'View Details',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dismiss',
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('scan-error', [
      {
        identifier: 'retry',
        buttonTitle: 'Retry',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dismiss',
        options: { opensAppToForeground: false },
      },
    ]);
  }

  // Convenience methods for common notifications
  static async notifyScanSuccess(productName: string, barcode: string): Promise<string> {
    return this.scheduleLocalNotification({
      body: `Found: ${productName}`,
      categoryIdentifier: 'scan-success',
      data: { type: 'scan-success', barcode, productName },
      title: '✅ Scan Successful',
    });
  }

  static async notifyScanError(error: string): Promise<string> {
    return this.scheduleLocalNotification({
      body: error,
      categoryIdentifier: 'scan-error',
      data: { type: 'scan-error', error },
      title: '❌ Scan Failed',
    });
  }

  static async notifyProductUpdate(productName: string, changes: string[]): Promise<string> {
    return this.scheduleLocalNotification({
      body: `${productName}: ${changes.join(', ')}`,
      data: { type: 'product-update', changes, productName },
      title: '📦 Product Updated',
    });
  }

  static async notifySystemAlert(message: string): Promise<string> {
    return this.scheduleLocalNotification({
      body: message,
      data: { type: 'system-alert', message },
      title: '🔧 System Alert',
    });
  }
}