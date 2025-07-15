/**
 * Client-side notifications exports (non-Next.js)
 *
 * This file provides client-side notifications functionality for non-Next.js environments.
 * For Next.js applications, use '@repo/notifications/client/next' instead.
 */

// Export client-side components
export { NotificationsProvider } from '../components/provider';
export { NotificationsTrigger } from '../components/trigger';

// Export Mantine notifications
export * from '../mantine-notifications';
