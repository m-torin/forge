import "@repo/testing/src/vitest/core/setup";
import { vi } from "vitest";

// Define types for mocks
type Procedure = Record<string, any>;

// Mock environment variables
process.env.UPSTASH_REDIS_REST_URL = "https://test-upstash-redis-url.com";
process.env.UPSTASH_REDIS_REST_TOKEN = "test-upstash-redis-token";

// Mock @upstash/redis
vi.mock("@upstash/redis", () => {
  const mockRedis = vi.fn().mockImplementation(() => ({
    del: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    get: vi.fn().mockResolvedValue(null),
    incr: vi.fn().mockResolvedValue(1),
    pipeline: vi.fn().mockReturnValue({
      del: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([]),
      expire: vi.fn().mockReturnThis(),
      get: vi.fn().mockReturnThis(),
      incr: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    }),
    set: vi.fn().mockResolvedValue("OK"),
  }));

  return { Redis: mockRedis };
});

// Mock @upstash/ratelimit
vi.mock("@upstash/ratelimit", () => {
  const mockRatelimit = vi
    .fn()
    .mockImplementation(
      ({
        limiter,
        prefix,
        redis,
      }: {
        redis: any;
        limiter: any;
        prefix: string;
      }) => ({
        blockUntilReady: vi.fn().mockResolvedValue(undefined),
        limit: vi.fn().mockResolvedValue({
          limit: 10,
          pending: Promise.resolve(),
          remaining: 9,
          reset: Date.now() + 10000,
          success: true,
        }),
      }),
    ) as Procedure;

  mockRatelimit.slidingWindow = vi
    .fn()
    .mockImplementation((maxRequests: number, window: number) => ({
      maxRequests,
      window,
    }));

  mockRatelimit.fixedWindow = vi
    .fn()
    .mockImplementation((maxRequests: number, window: number) => ({
      maxRequests,
      window,
    }));

  mockRatelimit.tokenBucket = vi
    .fn()
    .mockImplementation(
      (maxTokens: number, refillRate: number, interval: number) => ({
        interval,
        maxTokens,
        refillRate,
      }),
    );

  return {
    Ratelimit: mockRatelimit,
  };
});

// Mock @t3-oss/env-nextjs
vi.mock("@t3-oss/env-nextjs", () => ({
  createEnv: vi
    .fn()
    .mockImplementation(
      ({
        runtimeEnv,
        server,
      }: {
        server: Record<string, any>;
        runtimeEnv: Record<string, any>;
      }) => {
        const env: Record<string, any> = {};
        Object.keys(server).forEach((key) => {
          env[key] = runtimeEnv[key];
        });
        return () => env;
      },
    ),
}));

// Mock @repo/testing
vi.mock("@repo/testing", () => ({
  vitest: vi,
}));
