import { vi } from 'vitest';
import { createVitestCompatibleRedisClient } from './redis';

// Mock QStash Client
export const createMockQStashClient = () => ({
  dlq: {
    deleteMessage: vi.fn().mockResolvedValue(true),
    listMessages: vi.fn().mockResolvedValue([]),
  },
  events: vi.fn().mockResolvedValue([]),
  messages: {
    cancel: vi.fn().mockResolvedValue(true),
    delete: vi.fn().mockResolvedValue(true),
    get: vi.fn().mockResolvedValue({
      url: 'http://localhost:3001/api/webhook',
      body: '{"test": "data"}',
      createdAt: Date.now(),
      messageId: 'msg_123',
    }),
  },
  publishJSON: vi.fn().mockResolvedValue({
    messageId: 'msg_' + Math.random().toString(36).substring(7),
  }),
  schedules: {
    create: vi.fn().mockImplementation(() => {
      const scheduleId = 'schedule_' + Math.random().toString(36).substring(7);
      return Promise.resolve({ scheduleId });
    }),
    delete: vi.fn().mockResolvedValue(true),
    get: vi.fn().mockResolvedValue({
      cron: '0 9 * * 1',
      destination: 'http://localhost:3001/api/webhook',
      scheduleId: 'schedule_123',
    }),
    list: vi.fn().mockResolvedValue([]),
  },
});

// Mock QStash Receiver
export const createMockQStashReceiver = () => ({
  verify: vi.fn().mockResolvedValue(true),
});

// Setup QStash mocks for module mocking
export const setupQStashMocks = () => {
  const mockClient = createMockQStashClient();
  const mockReceiver = createMockQStashReceiver();

  // Mock @upstash/qstash
  vi.doMock('@upstash/qstash', () => ({
    Client: vi.fn().mockImplementation(() => mockClient),
    Receiver: vi.fn().mockImplementation(() => mockReceiver),
  }));

  return {
    client: mockClient,
    receiver: mockReceiver,
  };
};

// Reset QStash mocks
export const resetQStashMocks = (mocks: ReturnType<typeof setupQStashMocks>) => {
  vi.clearAllMocks();

  // Reset mock implementations to restore default behavior
  Object.values(mocks.client.messages).forEach(mock => {
    if (vi.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  Object.values(mocks.client.schedules).forEach(mock => {
    if (vi.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  Object.values(mocks.client.dlq).forEach(mock => {
    if (vi.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
};

// Create test message data
export const createTestMessage = (overrides: any = {}) => ({
  messageId: 'msg_' + Math.random().toString(36).substring(7),
  url: 'http://localhost:3001/api/webhook',
  body: JSON.stringify({ test: 'data' }),
  createdAt: Date.now(),
  scheduledAt: Date.now() + 60000, // 1 minute from now
  ...overrides,
});

// Create test schedule data
export const createTestSchedule = (overrides: any = {}) => ({
  scheduleId: 'schedule_' + Math.random().toString(36).substring(7),
  cron: '0 9 * * 1', // Every Monday at 9 AM
  destination: 'http://localhost:3001/api/webhook',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scheduled: true }),
  createdAt: Date.now(),
  ...overrides,
});

// Enhanced provider creation for different scenarios
export const createQStashProviderScenarios = () => {
  const baseMocks = setupQStashMocks();

  return {
    // Standard successful provider
    successful: {
      ...baseMocks.client,
      publishJSON: vi.fn().mockResolvedValue({ messageId: 'success_msg' }),
    },

    // Provider that fails operations
    failing: {
      ...baseMocks.client,
      publishJSON: vi.fn().mockRejectedValue(new Error('QStash operation failed')),
    },

    // Provider with network issues
    networkError: {
      ...baseMocks.client,
      publishJSON: vi.fn().mockRejectedValue(new Error('Network error')),
    },

    // Provider with rate limiting
    rateLimited: {
      ...baseMocks.client,
      publishJSON: vi.fn().mockRejectedValue(new Error('Rate limit exceeded')),
    },

    // Provider for testing scheduling
    scheduling: {
      ...baseMocks.client,
      schedules: {
        ...baseMocks.client.schedules,
        create: vi.fn().mockResolvedValue({ scheduleId: 'schedule_success' }),
        delete: vi.fn().mockResolvedValue(true),
        list: vi.fn().mockResolvedValue([createTestSchedule()]),
      },
    },

    // Clean up function
    cleanup: () => resetQStashMocks(baseMocks),
  };
};

// Mock instances
export const mockQStashClient = createMockQStashClient();
export const mockQStashReceiver = createMockQStashReceiver();

// Vitest mocks
export const mockUpstashQStash = {
  Client: vi.fn().mockImplementation(() => mockQStashClient),
  Receiver: vi.fn().mockImplementation(() => mockQStashReceiver),
};

// Helper functions for test setup
export const setupQStashEnvironment = (): void => {
  process.env.QSTASH_TOKEN = 'test-qstash-token';
  process.env.QSTASH_CURRENT_SIGNING_KEY = 'test-signing-key';
  process.env.QSTASH_NEXT_SIGNING_KEY = 'test-next-signing-key';
};

export const cleanupQStashEnvironment = (): void => {
  delete process.env.QSTASH_TOKEN;
  delete process.env.QSTASH_CURRENT_SIGNING_KEY;
  delete process.env.QSTASH_NEXT_SIGNING_KEY;
};

// Combined setup function for both QStash and Redis mocks (vitest-compatible)
export const setupCombinedUpstashMocks = () => {
  const qstashMocks = setupQStashMocks();
  const redisMocks = createVitestCompatibleRedisClient();

  return {
    qstash: qstashMocks.client,
    redis: redisMocks,
    receiver: qstashMocks.receiver,
  };
};

// Combined reset function
export const resetCombinedUpstashMocks = (mocks: ReturnType<typeof setupCombinedUpstashMocks>) => {
  // Reset QStash mocks
  resetQStashMocks({ client: mocks.qstash, receiver: mocks.receiver });

  // Reset Redis mocks
  if (mocks.redis._clear) {
    mocks.redis._clear();
  }
};

// Mock the @upstash/qstash module for automatic Vitest usage
vi.mock('@upstash/qstash', () => ({
  Client: vi.fn().mockImplementation(() => createMockQStashClient()),
  Receiver: vi.fn().mockImplementation(() => createMockQStashReceiver()),
}));
