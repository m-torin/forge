// Test environment setup to avoid server-only import issues
import { afterEach, beforeEach, vi } from 'vitest';

// Set test environment variables
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('VITEST', 'true');
vi.stubEnv('QSTASH_TOKEN', 'test-qstash-token');
vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://test-redis.upstash.io');
vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test-redis-token');

// Mock server-only modules
vi.mock('@repo/database/redis/server', () => ({
  redis: {
    ping: () => Promise.resolve('PONG'),
    set: () => Promise.resolve('OK'),
    get: () => Promise.resolve(null),
    del: () => Promise.resolve(1),
    keys: () => Promise.resolve([]),
    zadd: () => Promise.resolve(1),
    zrange: () => Promise.resolve([]),
    zremrangebyrank: () => Promise.resolve(0),
    pipeline: () => ({
      get: () => ({ exec: () => Promise.resolve([]) }),
    }),
    scan: () => Promise.resolve(['0', []]),
    exists: () => Promise.resolve(0),
    hget: () => Promise.resolve(null),
    hgetall: () => Promise.resolve({}),
    hset: () => Promise.resolve(1),
    incr: () => Promise.resolve(1),
    decr: () => Promise.resolve(0),
    llen: () => Promise.resolve(0),
    lpush: () => Promise.resolve(1),
    rpop: () => Promise.resolve(null),
    ttl: () => Promise.resolve(3600),
    expire: () => Promise.resolve(1),
  },
  RedisOperations: {
    // Add any RedisOperations methods if needed
  },
}));

// Mock observability to avoid server-only issues
vi.mock('@repo/observability', () => ({
  createServerObservability: () =>
    Promise.resolve({
      logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
    }),
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Global test setup
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});
