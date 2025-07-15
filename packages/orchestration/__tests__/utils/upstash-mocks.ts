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
  const sortedSets = new Map<string, Array<{ score: number; member: string }>>();

  return {
    decr: vi.fn().mockImplementation(async (key: string) => {
      const current = parseInt(storage.get(key) || '0');
      const newValue = current - 1;
      storage.set(key, newValue.toString());
      return newValue;
    }),
    del: vi.fn().mockImplementation(async (key: string) => {
      const existed = storage.has(key) || sortedSets.has(key);
      storage.delete(key);
      sortedSets.delete(key);
      return existed ? 1 : 0;
    }),
    exists: vi.fn().mockImplementation(async (key: string) => {
      return storage.has(key) || sortedSets.has(key) ? 1 : 0;
    }),
    expire: vi.fn().mockResolvedValue(1),
    get: vi.fn().mockImplementation(async (key: string) => {
      return storage.get(key) || null;
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
      // Escape special regex characters and replace * with .*
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*');
      // eslint-disable-next-line security/detect-non-literal-regexp
      const regex = new RegExp(`^${escapedPattern}$`);
      return Array.from(storage.keys()).filter((key: any) => regex.test(key));
    }),
    llen: vi.fn().mockResolvedValue(0),
    lpush: vi.fn().mockResolvedValue(1),
    ping: vi.fn().mockResolvedValue('PONG'),
    rpop: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockImplementation(async (key: string, value: string, _options?: any) => {
      storage.set(key, value);
      return 'OK';
    }),
    ttl: vi.fn().mockResolvedValue(3600),
    // Sorted set methods
    zadd: vi
      .fn()
      .mockImplementation(
        async (key: string, { score, member }: { score: number; member: string }) => {
          let set = sortedSets.get(key);
          if (!set) {
            set = [];
            sortedSets.set(key, set);
          }
          // Remove if already exists
          set = set.filter(item => item.member !== member);
          set.push({ score, member });
          // Sort by score ascending
          set.sort((a, b) => a.score - b.score);
          sortedSets.set(key, set);
          return 1;
        },
      ),
    zrange: vi
      .fn()
      .mockImplementation(async (key: string, start: number, stop: number, opts?: any) => {
        let set = sortedSets.get(key) || [];
        // If opts.rev, reverse the set
        if (opts && opts.rev) {
          set = [...set].reverse();
        }
        // Redis zrange is inclusive for start and stop
        if (stop < 0) {
          stop = set.length + stop;
        }
        return set.slice(start, stop + 1).map(item => item.member);
      }),
    zremrangebyrank: vi
      .fn()
      .mockImplementation(async (key: string, start: number, stop: number) => {
        let set = sortedSets.get(key) || [];
        if (stop < 0) {
          stop = set.length + stop;
        }
        const removed = set.slice(start, stop + 1);
        set = set.slice(0, start).concat(set.slice(stop + 1));
        sortedSets.set(key, set);
        return removed.length;
      }),
    pipeline: vi.fn().mockImplementation(() => {
      const commands: Array<{ type: string; key: string }> = [];
      const pipelineObj = {
        get: vi.fn().mockImplementation((key: string) => {
          commands.push({ type: 'get', key });
          return pipelineObj;
        }),
        exec: vi.fn().mockImplementation(async () => {
          return commands.map(cmd => {
            const value = storage.get(cmd.key);
            return [null, value || null];
          });
        }),
      };
      return pipelineObj;
    }),
    scan: vi
      .fn()
      .mockImplementation(
        async (cursor: string, { match, count: _count }: { match: string; count: number }) => {
          // Escape special regex characters and replace * with .*
          const escapedPattern = match
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\\\*/g, '.*');
          // eslint-disable-next-line security/detect-non-literal-regexp
          const regex = new RegExp(`^${escapedPattern}$`);
          const keys = Array.from(storage.keys()).filter(key => regex.test(key));
          // For simplicity, return all at once
          return ['0', keys];
        },
      ),
    _clear: () => {
      storage.clear();
      sortedSets.clear();
    },
    // Helper to access internal storage for testing
    _getStorage: () => storage,
    _getSortedSets: () => sortedSets,
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
    return await fn();
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
  // Reset mock implementations to restore default behavior
  mocks.redis.get.mockImplementation(async (key: string) => {
    return mocks.redis._getStorage().get(key) || null;
  });
  mocks.redis.set.mockImplementation(async (key: string, value: string, _options?: any) => {
    mocks.redis._getStorage().set(key, value);
    return 'OK';
  });
  mocks.redis.zadd.mockImplementation(
    async (key: string, { score, member }: { score: number; member: string }) => {
      let set = mocks.redis._getSortedSets().get(key);
      if (!set) {
        set = [];
        mocks.redis._getSortedSets().set(key, set);
      }
      // Remove if already exists
      set = set.filter((item: any) => item.member !== member);
      set.push({ score, member });
      // Sort by score ascending
      set.sort((a: any, b: any) => a.score - b.score);
      mocks.redis._getSortedSets().set(key, set);
      return 1;
    },
  );
  mocks.redis.zrange.mockImplementation(
    async (key: string, start: number, stop: number, opts?: any) => {
      let set = mocks.redis._getSortedSets().get(key) || [];
      // If opts.rev, reverse the set
      if (opts && opts.rev) {
        set = [...set].reverse();
      }
      // Redis zrange is inclusive for start and stop
      if (stop < 0) {
        stop = set.length + stop;
      }
      return set.slice(start, stop + 1).map((item: any) => item.member);
    },
  );
  mocks.redis.pipeline.mockImplementation(() => {
    const commands: Array<{ type: string; key: string }> = [];
    const pipelineObj = {
      get: vi.fn().mockImplementation((key: string) => {
        commands.push({ type: 'get', key });
        return pipelineObj;
      }),
      exec: vi.fn().mockImplementation(async () => {
        return commands.map(cmd => {
          const value = mocks.redis._getStorage().get(cmd.key);
          return [null, value || null];
        });
      }),
    };
    return pipelineObj;
  });
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
