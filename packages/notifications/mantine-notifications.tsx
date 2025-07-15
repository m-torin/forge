'use client';

import { notifications as mantineNotifications, NotificationData } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';

// Default notification configuration
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

// Notification presets
export const notify = {
  clean: mantineNotifications.clean,

  cleanQueue: mantineNotifications.cleanQueue,

  // Direct access to Mantine notifications for custom usage
  custom: mantineNotifications.show,

  error: (message: string, options?: Partial<NotificationData>) =>
    mantineNotifications.show({
      ...defaultConfig,
      color: 'red',
      icon: <IconX size={20} />,
      message,
      ...options,
    }),

  hide: mantineNotifications.hide,
  info: (message: string, options?: Partial<NotificationData>) =>
    mantineNotifications.show({
      ...defaultConfig,
      color: 'blue',
      icon: <IconInfoCircle size={20} />,
      message,
      ...options,
    }),
  success: (message: string, options?: Partial<NotificationData>) =>
    mantineNotifications.show({
      ...defaultConfig,
      color: 'green',
      icon: <IconCheck size={20} />,
      message,
      ...options,
    }),
  update: mantineNotifications.update,
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
