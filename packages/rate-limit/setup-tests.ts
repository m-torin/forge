import '@repo/testing/src/vitest/core/setup';
import { vi } from 'vitest';

// Mock environment variables
process.env.UPSTASH_REDIS_REST_URL = 'https://test-upstash-redis-url.com';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-upstash-redis-token';

// Mock @upstash/redis
vi.mock('@upstash/redis', () => {
  const mockRedis = vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    pipeline: vi.fn().mockReturnValue({
      get: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      del: vi.fn().mockReturnThis(),
      incr: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([]),
    }),
  }));

  return { Redis: mockRedis };
});

// Mock @upstash/ratelimit
vi.mock('@upstash/ratelimit', () => {
  const mockRatelimit = vi
    .fn()
    .mockImplementation(({ redis, limiter, prefix }) => ({
      limit: vi.fn().mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 10000,
        pending: Promise.resolve(),
      }),
      blockUntilReady: vi.fn().mockResolvedValue(undefined),
    }));

  mockRatelimit.slidingWindow = vi
    .fn()
    .mockImplementation((maxRequests, window) => ({
      maxRequests,
      window,
    }));

  mockRatelimit.fixedWindow = vi
    .fn()
    .mockImplementation((maxRequests, window) => ({
      maxRequests,
      window,
    }));

  mockRatelimit.tokenBucket = vi
    .fn()
    .mockImplementation((maxTokens, refillRate, interval) => ({
      maxTokens,
      refillRate,
      interval,
    }));

  return {
    Ratelimit: mockRatelimit,
  };
});

// Mock @t3-oss/env-nextjs
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn().mockImplementation(({ server, runtimeEnv }) => {
    const env = {};
    Object.keys(server).forEach((key) => {
      env[key] = runtimeEnv[key];
    });
    return () => env;
  }),
}));
