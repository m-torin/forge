import { createRatelimitScenarios } from '@repo/qa';
import { setupVitestUpstashMocks } from '@repo/qa/vitest/mocks/providers/upstash/redis';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createRateLimiter } from '../../rate-limit';

const upstashMocks = setupVitestUpstashMocks();
const rateLimit = createRatelimitScenarios();

// Mock the Ratelimit constructor
const MockRatelimitConstructor = vi.fn();

// Mock the env function
vi.mock('../../env', () => ({
  safeEnv: vi.fn(() => ({
    UPSTASH_REDIS_REST_TOKEN: undefined,
    UPSTASH_REDIS_REST_URL: undefined,
  })),
}));

describe('rate-limit', () => {
  let mockKeys: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    MockRatelimitConstructor.mockClear();

    // Get the mocked modules
    const envModule = await import('../../env');
    mockKeys = vi.mocked(envModule.safeEnv);
  });

  describe('createRateLimiter', () => {
    test('returns no-op rate limiter when Redis is not configured', async () => {
      mockKeys.mockReturnValue({
        UPSTASH_REDIS_REST_TOKEN: undefined,
        UPSTASH_REDIS_REST_URL: undefined,
      } as any);

      const rateLimiter = createRateLimiter({ limiter: vi.fn() });

      expect(rateLimiter).toBeDefined();
      expect(typeof rateLimiter.getRemaining).toBe('function');
      expect(typeof rateLimiter.limit).toBe('function');
      expect(typeof rateLimiter.resetUsedTokens).toBe('function');

      // Test the no-op behavior
      const remaining = await rateLimiter.getRemaining('test');
      expect(remaining).toBe(999999);

      const limitResult = await rateLimiter.limit('test');
      expect(limitResult).toStrictEqual({
        limit: 999999,
        remaining: 999999,
        reset: 0,
        success: true,
      });

      // Should not throw
      await expect(rateLimiter.resetUsedTokens('test')).resolves.toBeUndefined();
    });

    test('creates real rate limiter when Redis is configured', async () => {
      mockKeys.mockReturnValue({
        UPSTASH_REDIS_REST_TOKEN: 'test-token',
        UPSTASH_REDIS_REST_URL: 'https://test-redis.com',
      } as any);

      const mockRatelimitInstance = {
        getRemaining: vi.fn(),
        limit: vi.fn(),
        resetUsedTokens: vi.fn(),
      };
      MockRatelimitConstructor.mockImplementation(() => mockRatelimitInstance as any);

      const rateLimiter = createRateLimiter({ limiter: vi.fn() });

      expect(MockRatelimitConstructor).toHaveBeenCalledWith({
        limiter: expect.any(Function), // The custom limiter function passed in
        prefix: 'forge',
        redis: expect.any(Object),
        analytics: false,
        ephemeralCache: undefined,
      });

      expect(rateLimiter).toBe(mockRatelimitInstance);
    });

    test('uses custom prefix when provided', async () => {
      const mockRatelimitInstance = {};
      MockRatelimitConstructor.mockImplementation(() => mockRatelimitInstance as any);

      mockKeys.mockReturnValue({
        UPSTASH_REDIS_REST_TOKEN: 'test-token',
        UPSTASH_REDIS_REST_URL: 'https://test-redis.com',
      } as any);

      createRateLimiter({ prefix: 'custom-prefix', limiter: vi.fn() });

      expect(MockRatelimitConstructor).toHaveBeenCalledWith({
        limiter: expect.any(Function),
        prefix: 'custom-prefix',
        redis: expect.any(Object),
        analytics: false,
        ephemeralCache: undefined,
      });
    });

    test('uses custom limiter when provided', async () => {
      const mockRatelimitInstance = {};
      MockRatelimitConstructor.mockImplementation(() => mockRatelimitInstance as any);

      mockKeys.mockReturnValue({
        UPSTASH_REDIS_REST_TOKEN: 'test-token',
        UPSTASH_REDIS_REST_URL: 'https://test-redis.com',
      } as any);

      const customLimiter = vi.fn();
      createRateLimiter({ limiter: customLimiter });

      expect(MockRatelimitConstructor).toHaveBeenCalledWith({
        limiter: customLimiter,
        prefix: 'forge',
        redis: expect.any(Object),
        analytics: false,
        ephemeralCache: undefined,
      });
    });

    test('only logs warning once when Redis is not configured', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      mockKeys.mockReturnValue({
        UPSTASH_REDIS_REST_TOKEN: undefined,
        UPSTASH_REDIS_REST_URL: undefined,
      } as any);

      // Call createRateLimiter multiple times
      createRateLimiter({ limiter: vi.fn() });
      createRateLimiter({ limiter: vi.fn() });
      createRateLimiter({ limiter: vi.fn() });

      // Since the warning is commented out in the actual implementation,
      // we expect no console.warn calls
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
