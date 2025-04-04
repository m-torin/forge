import { vi } from 'vitest';
import '@repo/testing/src/vitest/core/setup';

// Mock Liveblocks
vi.mock('@liveblocks/react/suspense', () => ({
  ClientSideSuspense: ({
    children,
    fallback,
  }: {
    children: React.ReactNode;
    fallback: React.ReactNode;
  }) => children,
  LiveblocksProvider: ({ children }: { children: React.ReactNode }) => children,
  RoomProvider: ({ children }: { children: React.ReactNode }) => children,
  useMyPresence: vi.fn().mockReturnValue([{ cursor: null }, vi.fn()]),
  useOthers: vi.fn().mockReturnValue([]),
  useRoom: vi.fn().mockReturnValue({
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    getStorage: vi.fn(),
  }),
}));

vi.mock('@liveblocks/node', () => ({
  Liveblocks: vi.fn().mockImplementation(() => ({
    prepareSession: vi.fn().mockImplementation((userId) => ({
      FULL_ACCESS: 'full',
      allow: vi.fn(),
      authorize: vi.fn().mockResolvedValue({
        status: 200,
        body: JSON.stringify({ userId }),
      }),
    })),
  })),
}));

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock environment variables
process.env.LIVEBLOCKS_SECRET = 'sk_test_liveblocks_secret';
