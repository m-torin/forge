import { vi } from 'vitest';

// Mock QStash Client
export const createMockQStashClient = () => ({
  publishJSON: vi.fn().mockResolvedValue({
    messageId: 'msg_123',
  }),
  schedules: {
    create: vi.fn().mockResolvedValue({
      scheduleId: 'schedule_123',
    }),
    delete: vi.fn().mockResolvedValue(true),
    get: vi.fn().mockResolvedValue({
      scheduleId: 'schedule_123',
      cron: '0 9 * * 1',
      destination: 'http://localhost:3001/api/webhook',
    }),
    list: vi.fn().mockResolvedValue([]),
  },
  messages: {
    get: vi.fn().mockResolvedValue({
      messageId: 'msg_123',
      url: 'http://localhost:3001/api/webhook',
      body: '{"test": "data"}',
      createdAt: Date.now(),
    }),
    cancel: vi.fn().mockResolvedValue(true),
  },
  events: vi.fn().mockResolvedValue([]),
  dlq: {
    listMessages: vi.fn().mockResolvedValue([]),
    deleteMessage: vi.fn().mockResolvedValue(true),
  },
});

// Mock Redis Client
export const createMockRedisClient = () => {
  const storage = new Map<string, string>();

  return {
    set: vi.fn().mockImplementation(async (key: string, value: string, options?: any) => {
      storage.set(key, value);
      return 'OK';
    }),
    get: vi.fn().mockImplementation(async (key: string) => {
      return storage.get(key) || null;
    }),
    del: vi.fn().mockImplementation(async (key: string) => {
      const existed = storage.has(key);
      storage.delete(key);
      return existed ? 1 : 0;
    }),
    keys: vi.fn().mockImplementation(async (pattern: string) => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return Array.from(storage.keys()).filter((key) => regex.test(key));
    }),
    ping: vi.fn().mockResolvedValue('PONG'),
    exists: vi.fn().mockImplementation(async (key: string) => {
      return storage.has(key) ? 1 : 0;
    }),
    expire: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(3600),
    incr: vi.fn().mockImplementation(async (key: string) => {
      const current = parseInt(storage.get(key) || '0');
      const newValue = current + 1;
      storage.set(key, newValue.toString());
      return newValue;
    }),
    decr: vi.fn().mockImplementation(async (key: string) => {
      const current = parseInt(storage.get(key) || '0');
      const newValue = current - 1;
      storage.set(key, newValue.toString());
      return newValue;
    }),
    hset: vi.fn().mockResolvedValue(1),
    hget: vi.fn().mockResolvedValue(null),
    hgetall: vi.fn().mockResolvedValue({}),
    lpush: vi.fn().mockResolvedValue(1),
    rpop: vi.fn().mockResolvedValue(null),
    llen: vi.fn().mockResolvedValue(0),

    // Helper to access internal storage for testing
    _getStorage: () => storage,
    _clear: () => storage.clear(),
  };
};

// Mock Upstash Workflow serve function
export const createMockWorkflowServe = () => {
  return vi.fn().mockImplementation((handler: Function) => {
    return async (request: Request) => {
      const body = await request.json();
      const context = {
        requestPayload: body,
        waitUntil: vi.fn(),
        sleep: vi
          .fn()
          .mockImplementation((ms: number) => new Promise((resolve) => setTimeout(resolve, ms))),
        run: vi.fn(),
        cancel: vi.fn(),
      };

      return handler(context);
    };
  });
};

// Mock workflow execution context
export const createMockWorkflowContext = (payload: any = {}) => ({
  requestPayload: payload,
  waitUntil: vi.fn(),
  sleep: vi
    .fn()
    .mockImplementation((ms: number) => new Promise((resolve) => setTimeout(resolve, ms))),
  run: vi.fn().mockImplementation(async (name: string, fn: Function) => {
    try {
      return await fn();
    } catch (error) {
      throw error;
    }
  }),
  cancel: vi.fn().mockResolvedValue(true),
  env: {
    QSTASH_TOKEN: 'test-token',
    UPSTASH_REDIS_REST_URL: 'https://test-redis.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'test-redis-token',
  },
});

// Setup global mocks for Upstash packages
export const setupUpstashMocks = () => {
  const mockQStash = createMockQStashClient();
  const mockRedis = createMockRedisClient();
  const mockServe = createMockWorkflowServe();

  // Mock @upstash/qstash
  vi.doMock('@upstash/qstash', () => ({
    Client: vi.fn(() => mockQStash),
    Receiver: vi.fn(() => ({
      verify: vi.fn().mockResolvedValue(true),
    })),
  }));

  // Mock @upstash/redis
  vi.doMock('@upstash/redis', () => ({
    Redis: vi.fn(() => mockRedis),
  }));

  // Mock @upstash/workflow
  vi.doMock('@upstash/workflow/nextjs', () => ({
    serve: mockServe,
  }));

  vi.doMock('@upstash/workflow', () => ({
    serve: mockServe,
    Client: vi.fn(() => ({
      run: vi.fn(),
      cancel: vi.fn(),
      getResult: vi.fn(),
    })),
  }));

  return {
    qstash: mockQStash,
    redis: mockRedis,
    serve: mockServe,
  };
};

// Reset all mocks
export const resetUpstashMocks = (mocks: ReturnType<typeof setupUpstashMocks>) => {
  vi.clearAllMocks();
  mocks.redis._clear();
};

// Create test workflow definition
export const createTestWorkflowDefinition = (overrides: any = {}) => ({
  id: 'test-workflow',
  name: 'Test Workflow',
  version: '1.0.0',
  steps: [
    {
      id: 'step-1',
      name: 'First Step',
      action: 'process-data',
    },
    {
      id: 'step-2',
      name: 'Second Step',
      action: 'send-notification',
      dependencies: ['step-1'],
    },
  ],
  retryConfig: {
    maxAttempts: 3,
    delay: 1000,
  },
  ...overrides,
});

// Create test execution
export const createTestExecution = (overrides: any = {}) => ({
  id: 'exec_123',
  workflowId: 'test-workflow',
  status: 'pending' as const,
  startedAt: new Date(),
  input: { test: 'data' },
  steps: [
    {
      stepId: 'step-1',
      status: 'pending' as const,
      attempts: 0,
    },
    {
      stepId: 'step-2',
      status: 'pending' as const,
      attempts: 0,
    },
  ],
  metadata: {
    trigger: {
      type: 'manual' as const,
      payload: { test: 'data' },
      timestamp: new Date(),
    },
  },
  ...overrides,
});
