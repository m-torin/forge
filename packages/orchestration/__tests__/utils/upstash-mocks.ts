import { vi } from 'vitest';

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

// Mock Redis Client
export const createMockRedisClient = () => {
  const storage = new Map<string, string>();

  return {
    decr: vi.fn().mockImplementation(async (key: string) => {
      const current = parseInt(storage.get(key) || '0');
      const newValue = current - 1;
      storage.set(key, newValue.toString());
      return newValue;
    }),
    del: vi.fn().mockImplementation(async (key: string) => {
      const existed = storage.has(key);
      storage.delete(key);
      return existed ? 1 : 0;
    }),
    exists: vi.fn().mockImplementation(async (key: string) => {
      return storage.has(key) ? 1 : 0;
    }),
    expire: vi.fn().mockResolvedValue(1),
    get: vi.fn().mockImplementation(async (key: string) => {
      const value = storage.get(key);
      return value || null;
    }),
    hget: vi.fn().mockResolvedValue(null),
    hgetall: vi.fn().mockResolvedValue({}),
    hset: vi.fn().mockResolvedValue(1),
    incr: vi.fn().mockImplementation(async (key: string) => {
      const current = parseInt(storage.get(key) || '0');
      const newValue = current + 1;
      storage.set(key, newValue.toString());
      return newValue;
    }),
    keys: vi.fn().mockImplementation(async (pattern: string) => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return Array.from(storage.keys()).filter((key: any) => regex.test(key));
    }),
    llen: vi.fn().mockResolvedValue(0),
    lpush: vi.fn().mockResolvedValue(1),
    ping: vi.fn().mockResolvedValue('PONG'),
    rpop: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockImplementation(async (key: string, value: string, options?: any) => {
      storage.set(key, value);
      return 'OK';
    }),
    ttl: vi.fn().mockResolvedValue(3600),

    _clear: () => storage.clear(),
    // Helper to access internal storage for testing
    _getStorage: () => storage,
  };
};

// Mock Upstash Workflow serve function
export const createMockWorkflowServe = () => {
  return vi.fn().mockImplementation((handler: Function) => {
    // Return Next.js route handler object
    return {
      GET: async () => {
        return Response.json({ status: 'ok' }, { status: 200 });
      },
      POST: async (request: any) => {
        const body = await request.json();
        const context = {
          cancel: vi.fn(),
          requestPayload: body,
          run: vi.fn().mockImplementation(async (id: string, fn: Function) => {
            return await fn();
          }),
          sleep: vi
            .fn()
            .mockImplementation(
              (ms: number) => new Promise((resolve: any) => setTimeout(resolve, ms)),
            ),
          waitUntil: vi.fn(),
        };

        await handler(context);
        return Response.json({ success: true }, { status: 200 });
      },
    };
  });
};

// Mock workflow execution context
export const createMockWorkflowContext = (payload: any = {}) => ({
  cancel: vi.fn().mockResolvedValue(true),
  env: {
    QSTASH_TOKEN: 'test-token',
    UPSTASH_REDIS_REST_TOKEN: 'test-redis-token',
    UPSTASH_REDIS_REST_URL: 'https://test-redis.upstash.io',
  },
  requestPayload: payload,
  run: vi.fn().mockImplementation(async (name: string, fn: Function) => {
    try {
      return await fn();
    } catch (error: any) {
      throw error;
    }
  }),
  sleep: vi
    .fn()
    .mockImplementation((ms: number) => new Promise((resolve: any) => setTimeout(resolve, ms))),
  waitUntil: vi.fn(),
});

// Setup global mocks for Upstash packages
export const setupUpstashMocks = () => {
  const mockQStash = createMockQStashClient();
  const mockRedis = createMockRedisClient();
  const mockServe = createMockWorkflowServe();

  // Mock @upstash/qstash
  vi.doMock('@upstash/qstash', () => ({
    Client: vi.fn().mockImplementation(() => mockQStash),
    Receiver: vi.fn(() => ({
      verify: vi.fn().mockResolvedValue(true),
    })),
  }));

  // Mock @upstash/redis
  vi.doMock('@upstash/redis', () => ({
    Redis: vi.fn().mockImplementation(() => mockRedis),
  }));

  // Mock @upstash/workflow
  vi.doMock('@upstash/workflow/nextjs', () => ({
    serve: mockServe,
  }));

  vi.doMock('@upstash/workflow', () => ({
    Client: vi.fn(() => ({
      cancel: vi.fn(),
      getResult: vi.fn(),
      run: vi.fn(),
    })),
    serve: mockServe,
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
      dependsOn: ['step-1'],
    },
  ],
  version: '1.0.0',
  ...overrides,
});

// Create test execution
export const createTestExecution = (overrides: any = {}) => ({
  id: 'exec_123',
  input: { test: 'data' },
  metadata: {
    trigger: {
      type: 'manual' as const,
      payload: { test: 'data' },
      timestamp: new Date(),
    },
  },
  startedAt: new Date(),
  status: 'pending' as const,
  steps: [
    {
      attempts: 0,
      status: 'pending' as const,
      stepId: 'step-1',
    },
    {
      attempts: 0,
      status: 'pending' as const,
      stepId: 'step-2',
    },
  ],
  workflowId: 'test-workflow',
  ...overrides,
});
