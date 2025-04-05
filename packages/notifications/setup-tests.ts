import "@repo/testing/src/vitest/core/setup";

import React from "react";
import { vi } from "vitest";

// Mock environment variables
process.env.KNOCK_SECRET_API_KEY = "test-knock-secret-api-key";
process.env.NEXT_PUBLIC_KNOCK_API_KEY = "test-knock-public-api-key";
process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = "test-knock-feed-channel-id";

// Mock @knocklabs/node
vi.mock("@knocklabs/node", () => ({
  Knock: vi.fn().mockImplementation(() => ({
    feeds: {
      getBadgeCount: vi.fn().mockResolvedValue({ unread: 0, unseen: 0 }),
      getMessages: vi.fn().mockResolvedValue({ entries: [], page_info: {} }),
      getUnreadCount: vi.fn().mockResolvedValue({ unread: 0 }),
      getUnseenCount: vi.fn().mockResolvedValue({ unseen: 0 }),
      markFeedRead: vi.fn().mockResolvedValue({}),
      markFeedSeen: vi.fn().mockResolvedValue({}),
      markMessagesRead: vi.fn().mockResolvedValue({}),
      markMessagesSeen: vi.fn().mockResolvedValue({}),
      markMessagesUnread: vi.fn().mockResolvedValue({}),
      markMessagesUnseen: vi.fn().mockResolvedValue({}),
    },
    messages: {
      batchUpdate: vi.fn().mockResolvedValue({}),
      get: vi.fn().mockResolvedValue({}),
      list: vi.fn().mockResolvedValue({ entries: [], page_info: {} }),
    },
    objects: {
      bulkSet: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue({}),
    },
    users: {
      identify: vi.fn().mockResolvedValue({}),
      bulkIdentify: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      get: vi.fn().mockResolvedValue({}),
      merge: vi.fn().mockResolvedValue({}),
    },
    workflows: {
      cancel: vi.fn().mockResolvedValue({}),
      get: vi.fn().mockResolvedValue({}),
      messages: {
        get: vi.fn().mockResolvedValue({}),
        list: vi.fn().mockResolvedValue([]),
      },
      trigger: vi.fn().mockResolvedValue({}),
    },
  })),
}));

// Mock @knocklabs/react
vi.mock("@knocklabs/react", () => ({
  KnockFeedProvider: vi.fn().mockImplementation(({ children }) => children),
  KnockProvider: vi.fn().mockImplementation(({ children }) => children),
  NotificationFeedPopover: vi.fn().mockImplementation(() =>
    React.createElement("div", {
      "data-testid": "notification-feed-popover",
    }),
  ),
  NotificationIconButton: vi.fn().mockImplementation((props) =>
    React.createElement("button", {
      "data-testid": "notification-icon-button",
      onClick: props.onClick,
      ref: props.ref,
    }),
  ),
  useKnock: vi.fn().mockReturnValue({
    isAuthenticated: true,
    knock: {
      authenticate: vi.fn(),
      logOut: vi.fn(),
    },
    knockClient: {},
    userId: "test-user-id",
  }),
  useKnockFeed: vi.fn().mockReturnValue({
    feedClient: {
      markAllAsRead: vi.fn(),
      markAllAsSeen: vi.fn(),
      markAsRead: vi.fn(),
      markAsSeen: vi.fn(),
      off: vi.fn(),
      on: vi.fn(),
    },
    feedItems: [],
    hasMoreItems: false,
    isConnected: true,
    loading: false,
    loadMoreItems: vi.fn(),
    markAllAsRead: vi.fn(),
    markAllAsSeen: vi.fn(),
    markAsRead: vi.fn(),
    markAsSeen: vi.fn(),
    unreadCount: 0,
    unseenCount: 0,
  }),
}));

// Mock @t3-oss/env-nextjs
vi.mock("@t3-oss/env-nextjs", () => ({
  createEnv: vi
    .fn()
    .mockImplementation(({ client, runtimeEnv, server }: any) => {
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
vi.mock("@knocklabs/react/dist/index.css", () => ({}));
vi.mock("../styles.css", () => ({}));
