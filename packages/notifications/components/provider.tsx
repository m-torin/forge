'use client';

import { KnockFeedProvider, KnockProvider } from '@knocklabs/react';

import { keys } from '../keys';

import { ReactNode } from 'react';

const knockApiKey = keys().NEXT_PUBLIC_KNOCK_API_KEY;
const knockFeedChannelId = keys().NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;

interface NotificationsProviderProps extends Record<string, any> {
  children: ReactNode;
  userId: string;
}

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
