'use client';

import { KnockFeedProvider, KnockProvider } from '@knocklabs/react';

import { safeEnv } from '../env';

import { ReactNode } from 'react';

const knockApiKey = safeEnv().NEXT_PUBLIC_KNOCK_API_KEY;
const knockFeedChannelId = safeEnv().NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;

/**
 * Props for the NotificationsProvider component
 * @param children - Child components to wrap
 * @param userId - User ID for notifications
 */
interface NotificationsProviderProps extends Record<string, any> {
  children: ReactNode;
  userId: string;
}

/**
 * Notifications provider that wraps children with Knock providers
 * Automatically configures Knock with API key and feed channel from environment
 * @param children - Child components to render
 * @param userId - User ID for notifications
 * @returns Wrapped children or unwrapped children if not configured
 */
export const NotificationsProvider = ({ children, userId }: NotificationsProviderProps) => {
  if (!knockApiKey || !knockFeedChannelId) {
    return children;
  }

  return (
    <KnockProvider apiKey={knockApiKey} userId={userId}>
      <KnockFeedProvider feedId={knockFeedChannelId}>{children}</KnockFeedProvider>
    </KnockProvider>
  );
};
