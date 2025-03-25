import '@repo/testing/src/vitest/core/setup';
import { vi } from 'vitest';
import React from 'react';

// Mock environment variables
process.env.KNOCK_SECRET_API_KEY = 'test-knock-secret-api-key';
process.env.NEXT_PUBLIC_KNOCK_API_KEY = 'test-knock-public-api-key';
process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = 'test-knock-feed-channel-id';

// Mock @knocklabs/node
vi.mock('@knocklabs/node', () => ({
  Knock: vi.fn().mockImplementation(() => ({
    users: {
      identify: vi.fn().mockResolvedValue({}),
      get: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      merge: vi.fn().mockResolvedValue({}),
      bulkIdentify: vi.fn().mockResolvedValue({}),
    },
    workflows: {
      trigger: vi.fn().mockResolvedValue({}),
      cancel: vi.fn().mockResolvedValue({}),
      get: vi.fn().mockResolvedValue({}),
      messages: {
        list: vi.fn().mockResolvedValue([]),
        get: vi.fn().mockResolvedValue({}),
      },
    },
    objects: {
      set: vi.fn().mockResolvedValue({}),
      get: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      bulkSet: vi.fn().mockResolvedValue({}),
    },
    messages: {
      get: vi.fn().mockResolvedValue({}),
      list: vi.fn().mockResolvedValue({ entries: [], page_info: {} }),
      batchUpdate: vi.fn().mockResolvedValue({}),
    },
    feeds: {
      getMessages: vi.fn().mockResolvedValue({ entries: [], page_info: {} }),
      markMessagesSeen: vi.fn().mockResolvedValue({}),
      markMessagesRead: vi.fn().mockResolvedValue({}),
      markMessagesUnseen: vi.fn().mockResolvedValue({}),
      markMessagesUnread: vi.fn().mockResolvedValue({}),
      markFeedSeen: vi.fn().mockResolvedValue({}),
      markFeedRead: vi.fn().mockResolvedValue({}),
      getBadgeCount: vi.fn().mockResolvedValue({ unseen: 0, unread: 0 }),
      getUnreadCount: vi.fn().mockResolvedValue({ unread: 0 }),
      getUnseenCount: vi.fn().mockResolvedValue({ unseen: 0 }),
    },
  })),
}));

// Mock @knocklabs/react
vi.mock('@knocklabs/react', () => ({
  KnockProvider: vi.fn().mockImplementation(({ children }) => children),
  KnockFeedProvider: vi.fn().mockImplementation(({ children }) => children),
  NotificationFeedPopover: vi.fn().mockImplementation(() =>
    React.createElement('div', {
      'data-testid': 'notification-feed-popover',
    }),
  ),
  NotificationIconButton: vi.fn().mockImplementation((props) =>
    React.createElement('button', {
      'data-testid': 'notification-icon-button',
      onClick: props.onClick,
      ref: props.ref,
    }),
  ),
  useKnock: vi.fn().mockReturnValue({
    knock: {
      authenticate: vi.fn(),
      logOut: vi.fn(),
    },
    knockClient: {},
    isAuthenticated: true,
    userId: 'test-user-id',
  }),
  useKnockFeed: vi.fn().mockReturnValue({
    feedClient: {
      markAsSeen: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsSeen: vi.fn(),
      markAllAsRead: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    },
    feedItems: [],
    loading: false,
    hasMoreItems: false,
    loadMoreItems: vi.fn(),
    markAsSeen: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsSeen: vi.fn(),
    markAllAsRead: vi.fn(),
    unreadCount: 0,
    unseenCount: 0,
    isConnected: true,
  }),
}));

// Mock @t3-oss/env-nextjs
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi
    .fn()
    .mockImplementation(({ server, client, runtimeEnv }: any) => {
      const env: Record<string, any> = {};
      Object.keys(server).forEach((key) => {
        env[key] = runtimeEnv[key];
      });
      Object.keys(client).forEach((key) => {
        env[key] = runtimeEnv[key];
      });
      return () => env;
    }),
}));

// Mock CSS imports
vi.mock('@knocklabs/react/dist/index.css', () => ({}));
vi.mock('../styles.css', () => ({}));
