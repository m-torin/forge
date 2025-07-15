'use client';

import { Button } from '#/components/ui/button';
import { useFixedPosition } from '#/hooks/ui/use-layout-manager';
import { NOTIFICATION_TYPES, SPRING, Z_INDEX } from '#/lib/ui-constants';
import { useId } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle, Info, WifiIcon, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

/**
 * Interface for notification data structure
 */
export interface Notification {
  id: string;
  type: keyof typeof NOTIFICATION_TYPES;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  persistent?: boolean;
  icon?: React.ReactNode;
  timestamp: number;
}

/**
 * Context type for notification management
 */
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

/**
 * Hook to access notification context
 * @returns Notification context methods and state
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

/**
 * Provider component for notification system
 * @param children - Child components
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Simple state management for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const uniqueId = useId();
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeNotification = useCallback((id: string) => {
    // Clear timeout if exists
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }

    // Remove from notifications
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp'>): string => {
      const id = `${uniqueId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = Date.now();

      const newNotification: Notification = {
        ...notification,
        id,
        timestamp,
        duration: notification.duration || NOTIFICATION_TYPES[notification.type].duration,
      };

      // Add to notifications with limit of 5
      setNotifications(prev => {
        const updated = [newNotification, ...prev].slice(0, 5);
        return updated;
      });

      // Auto-remove unless persistent
      if (!notification.persistent && newNotification.duration) {
        const timeout = setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);

        timeoutRefs.current.set(id, timeout);
      }

      return id;
    },
    [removeNotification, uniqueId],
  );

  const clearAll = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();

    // Clear all notifications
    setNotifications([]);
  }, []);

  // Cleanup on unmount - capture ref value to avoid stale closure
  useEffect(() => {
    const timeoutsToCleanup = timeoutRefs.current;
    return () => {
      timeoutsToCleanup.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Gets appropriate icon for notification type
 * @param type - Notification type
 * @param customIcon - Custom icon override
 * @returns React icon component
 */
function getNotificationIcon(type: keyof typeof NOTIFICATION_TYPES, customIcon?: React.ReactNode) {
  if (customIcon) return customIcon;

  switch (type) {
    case 'SUCCESS':
      return <CheckCircle className="h-5 w-5" />;
    case 'ERROR':
    case 'CRITICAL':
      return <AlertCircle className="h-5 w-5" />;
    case 'WARNING':
      return <AlertTriangle className="h-5 w-5" />;
    case 'INFO':
    default:
      return <Info className="h-5 w-5" />;
  }
}

/**
 * Gets color scheme for notification type
 * @param type - Notification type
 * @returns Color class names for styling
 */
function getNotificationColors(type: keyof typeof NOTIFICATION_TYPES) {
  const colorMap = {
    INFO: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'text-blue-500',
    },
    SUCCESS: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      icon: 'text-green-500',
    },
    WARNING: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: 'text-yellow-500',
    },
    ERROR: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      icon: 'text-red-500',
    },
    CRITICAL: {
      bg: 'bg-red-100 dark:bg-red-950/40',
      border: 'border-red-300 dark:border-red-700',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-600',
    },
  };

  return colorMap[type];
}

/**
 * Main notification queue component that displays notifications
 */
export function NotificationQueue() {
  const { notifications, removeNotification } = useNotifications();
  const { className: fixedPositionClass } = useFixedPosition(
    'notification-queue',
    'top-right',
    notifications.length > 0,
    2,
  );

  return (
    <div
      className={cx(
        fixedPositionClass,
        'pointer-events-none w-full max-w-sm space-y-2',
        `z-[${Z_INDEX.NOTIFICATION}]`,
      )}
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => {
          const colors = getNotificationColors(notification.type);
          const icon = getNotificationIcon(notification.type, notification.icon);

          return (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{
                ...SPRING.BOUNCY,
                delay: index * 0.05,
              }}
              className={cx(
                'pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg',
                'backdrop-blur-sm transition-all duration-200',
                colors.bg,
                colors.border,
              )}
            >
              {/* Icon */}
              <div className={cx('mt-0.5 flex-shrink-0', colors.icon)}>{icon}</div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h4 className={cx('text-sm font-medium', colors.text)}>{notification.title}</h4>
                {notification.message && (
                  <p className={cx('mt-1 text-sm', colors.text, 'opacity-80')}>
                    {notification.message}
                  </p>
                )}

                {/* Action Button */}
                {notification.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={notification.action.onClick}
                    className="mt-2 h-7 text-xs"
                  >
                    {notification.action.label}
                  </Button>
                )}
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNotification(notification.id)}
                className="h-6 w-6 flex-shrink-0 p-0 opacity-70 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook providing convenient shortcuts for common notification types
 * @returns Object with shortcut methods for different notification types
 */
export function useNotificationShortcuts() {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message?: string, action?: Notification['action']) =>
      addNotification({ type: 'SUCCESS', title, message, action }),

    error: (title: string, message?: string, action?: Notification['action']) =>
      addNotification({ type: 'ERROR', title, message, action }),

    warning: (title: string, message?: string, action?: Notification['action']) =>
      addNotification({ type: 'WARNING', title, message, action }),

    info: (title: string, message?: string, action?: Notification['action']) =>
      addNotification({ type: 'INFO', title, message, action }),

    networkReconnected: () =>
      addNotification({
        type: 'SUCCESS',
        title: 'Back online!',
        message: 'Your connection has been restored.',
        icon: <WifiIcon className="h-5 w-5" />,
        duration: 3000,
      }),

    networkDisconnected: () =>
      addNotification({
        type: 'WARNING',
        title: 'Connection lost',
        message: 'Trying to reconnect...',
        persistent: true,
      }),
  };
}
