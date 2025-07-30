'use client';

import { notifications as mantineNotifications, NotificationData } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';

/**
 * Default notification configuration
 * Applied to all notification types unless overridden
 */
const defaultConfig: Partial<NotificationData> = {
  autoClose: 5000,
  position: 'top-right',
  radius: 'md',
  styles: {
    description: { marginTop: '4px' },
    root: { paddingBottom: '12px', paddingTop: '12px' },
    title: { fontWeight: 600 },
  },
  withCloseButton: true,
};

/**
 * Notification presets with predefined styles and icons
 * Provides convenient methods for common notification types
 */
export const notify = {
  clean: mantineNotifications.clean,

  cleanQueue: mantineNotifications.cleanQueue,

  // Direct access to Mantine notifications for custom usage
  custom: mantineNotifications.show,

  /**
   * Show an error notification with red color and X icon
   * @param message - Error message to display
   * @param options - Additional notification options
   */
  error: (message: string, options?: Partial<NotificationData>) =>
    mantineNotifications.show({
      ...defaultConfig,
      color: 'red',
      icon: <IconX size={20} />,
      message,
      ...options,
    }),

  hide: mantineNotifications.hide,
  /**
   * Show an info notification with blue color and info icon
   * @param message - Info message to display
   * @param options - Additional notification options
   */
  info: (message: string, options?: Partial<NotificationData>) =>
    mantineNotifications.show({
      ...defaultConfig,
      color: 'blue',
      icon: <IconInfoCircle size={20} />,
      message,
      ...options,
    }),
  /**
   * Show a success notification with green color and check icon
   * @param message - Success message to display
   * @param options - Additional notification options
   */
  success: (message: string, options?: Partial<NotificationData>) =>
    mantineNotifications.show({
      ...defaultConfig,
      color: 'green',
      icon: <IconCheck size={20} />,
      message,
      ...options,
    }),
  update: mantineNotifications.update,
  /**
   * Show a warning notification with yellow color and warning icon
   * @param message - Warning message to display
   * @param options - Additional notification options
   */
  warning: (message: string, options?: Partial<NotificationData>) =>
    mantineNotifications.show({
      ...defaultConfig,
      color: 'yellow',
      icon: <IconAlertTriangle size={20} />,
      message,
      ...options,
    }),
};

// Re-export the notifications provider
export { Notifications as NotificationsProvider } from '@mantine/notifications';
