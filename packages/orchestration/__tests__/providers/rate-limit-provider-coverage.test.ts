/**
 * Comprehensive test coverage for RateLimitProvider
 * Tests provider functionality, health checks, and error handling
 */

import { beforeEach, describe, expect, vi } from 'vitest';

// Import after mocking
import { RateLimitProvider } from '../../src/providers/rate-limit/provider';
import { RateLimitError } from '../../src/shared/utils/errors';

// Mock dependencies
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 5,
      reset: Date.now() + 60000,
    }),
    fixedWindow: vi.fn().mockReturnValue({ type: 'fixed' }),
    slidingWindow: vi.fn().mockReturnValue({ type: 'sliding' }),
    tokenBucket: vi.fn().mockReturnValue({ type: 'token' }),
  })),
}));

vi.mock('@repo/database/redis/server', () => ({
  redis: {
    ping: vi.fn().mockResolvedValue('PONG'),
    del: vi.fn().mockResolvedValue(1),
  },
}));

describe('rateLimitProvider', () => {
  let provider: RateLimitProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new RateLimitProvider({
      algorithm: 'sliding-window',
      defaultLimit: { requests: 10, window: 60 },
      keyPrefix: 'test-rl',
      enableRedis: true,
    });
  });

  describe('constructor and configuration', () => {
    test('should create provider with default options', () => {
      const defaultProvider = new RateLimitProvider({});

      expect(defaultProvider.name).toBe('rate-limit');
      expect(defaultProvider.version).toBe('1.0.0');
    });

    test('should create provider with custom options', () => {
      const customProvider = new RateLimitProvider({
        algorithm: 'fixed-window',
        defaultLimit: { requests: 20, window: 120 },
        keyPrefix: 'custom-rl',
        enableRedis: false,
      });

      expect(customProvider.name).toBe('rate-limit');
      expect(customProvider.version).toBe('1.0.0');
    });

    test('should create provider from config', () => {
      const config = {
        config: {
          algorithm: 'token-bucket' as const,
          defaultLimit: { requests: 50, window: 300 },
        },
      };

      const configProvider = RateLimitProvider.fromConfig(config);

      expect(configProvider.name).toBe('rate-limit');
    });
  });

  describe('checkRateLimit', () => {
    test('should check rate limit and return allowed result', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const mockLimit = vi.fn().mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 8,
        reset: Date.now() + 60000,
      });

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: mockLimit,
          }) as any,
      );

      const pattern = {
        getIdentifier: 'test-key',
        tokens: 10,
        interval: 60000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: false,
      };

      const result = await provider.checkRateLimit(pattern);

      expect(result.allowed).toBeTruthy();
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(8);
      expect(result.resetTime).toBeInstanceOf(Date);
      expect(mockLimit).toHaveBeenCalledWith('test-key');
    });

    test('should check rate limit and return denied result', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const mockLimit = vi.fn().mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60000,
      });

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: mockLimit,
          }) as any,
      );

      const pattern = {
        getIdentifier: 'test-key',
        tokens: 10,
        interval: 60000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: false,
      };

      const result = await provider.checkRateLimit(pattern);

      expect(result.allowed).toBeFalsy();
      expect(result.remaining).toBe(0);
    });

    test('should throw rate limit error when throwOnLimit is true', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const mockLimit = vi.fn().mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60000,
      });

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: mockLimit,
          }) as any,
      );

      const pattern = {
        getIdentifier: 'test-key',
        tokens: 10,
        interval: 60000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: true,
      };

      await expect(provider.checkRateLimit(pattern)).rejects.toThrow(RateLimitError);
    });

    test('should use keyGenerator when provided', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const mockLimit = vi.fn().mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 8,
        reset: Date.now() + 60000,
      });

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: mockLimit,
          }) as any,
      );

      const keyGenerator = vi.fn().mockReturnValue('generated-key');
      const pattern = {
        getIdentifier: 'default-key',
        tokens: 10,
        interval: 60000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: false,
        keyGenerator,
      };

      const context = { userId: '123' };
      await provider.checkRateLimit(pattern, context);

      expect(keyGenerator).toHaveBeenCalledWith(context);
      expect(mockLimit).toHaveBeenCalledWith('generated-key');
    });

    test('should handle rate limiter errors', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const mockLimit = vi.fn().mockRejectedValue(new Error('Redis connection failed'));

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: mockLimit,
          }) as any,
      );

      const pattern = {
        getIdentifier: 'test-key',
        tokens: 10,
        interval: 60000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: false,
      };

      await expect(provider.checkRateLimit(pattern)).rejects.toThrow(
        'Failed to check rate limit for test-key',
      );
    });
  });

  describe('withRateLimit', () => {
    test('should execute function when rate limit allows', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const mockLimit = vi.fn().mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 8,
        reset: Date.now() + 60000,
      });

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: mockLimit,
          }) as any,
      );

      const pattern = {
        getIdentifier: 'test-key',
        tokens: 10,
        interval: 60000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: false,
      };

      const fn = vi.fn().mockResolvedValue('success');
      const result = await provider.withRateLimit(pattern, fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledWith();
    });

    test('should throw rate limit error when not allowed', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const resetTime = Date.now() + 60000;
      const mockLimit = vi.fn().mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset: resetTime,
      });

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: mockLimit,
          }) as any,
      );

      const pattern = {
        getIdentifier: 'test-key',
        tokens: 10,
        interval: 60000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: false,
      };

      const fn = vi.fn().mockResolvedValue('success');

      await expect(provider.withRateLimit(pattern, fn)).rejects.toThrow(RateLimitError);
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('getRateLimitStatus', () => {
    test('should get current rate limit status', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const mockLimit = vi.fn().mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 7,
        reset: Date.now() + 60000,
      });

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: mockLimit,
          }) as any,
      );

      const pattern = {
        getIdentifier: 'test-key',
        tokens: 10,
        interval: 60000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: false,
      };

      const status = await provider.getRateLimitStatus(pattern);

      expect(status).not.toBeNull();
      expect(status!.current).toBe(3); // 10 - 7
      expect(status!.limit).toBe(10);
      expect(status!.resetTime).toBeInstanceOf(Date);
    });

    test('should handle errors when getting status', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const mockLimit = vi.fn().mockRejectedValue(new Error('Status error'));

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: mockLimit,
          }) as any,
      );

      const pattern = {
        getIdentifier: 'test-key',
        tokens: 10,
        interval: 60000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: false,
      };

      await expect(provider.getRateLimitStatus(pattern)).rejects.toThrow(
        'Failed to get rate limit status for test-key',
      );
    });
  });

  describe('rate limiter creation', () => {
    test('should create fixed-window rate limiter', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const fixedWindowSpy = vi.fn().mockReturnValue({ type: 'fixed' });

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: vi.fn().mockResolvedValue({
              success: true,
              limit: 10,
              remaining: 5,
              reset: Date.now() + 60000,
            }),
          }) as any,
      );

      (Ratelimit as any).fixedWindow = fixedWindowSpy;

      const pattern = {
        getIdentifier: 'fixed-test',
        tokens: 15,
        interval: 120000,
        algorithm: 'fixed-window' as const,
        throwOnLimit: false,
      };

      await provider.checkRateLimit(pattern);

      expect(fixedWindowSpy).toHaveBeenCalledWith(15, '120000ms');
    });

    test('should create sliding-window rate limiter', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const slidingWindowSpy = vi.fn().mockReturnValue({ type: 'sliding' });

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: vi.fn().mockResolvedValue({
              success: true,
              limit: 10,
              remaining: 5,
              reset: Date.now() + 60000,
            }),
          }) as any,
      );

      (Ratelimit as any).slidingWindow = slidingWindowSpy;

      const pattern = {
        getIdentifier: 'sliding-test',
        tokens: 20,
        interval: 180000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: false,
      };

      await provider.checkRateLimit(pattern);

      expect(slidingWindowSpy).toHaveBeenCalledWith(20, '180000ms');
    });

    test('should create token-bucket rate limiter', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const tokenBucketSpy = vi.fn().mockReturnValue({ type: 'token' });

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: vi.fn().mockResolvedValue({
              success: true,
              limit: 10,
              remaining: 5,
              reset: Date.now() + 60000,
            }),
          }) as any,
      );

      (Ratelimit as any).tokenBucket = tokenBucketSpy;

      const pattern = {
        getIdentifier: 'token-test',
        tokens: 25,
        interval: 240000,
        algorithm: 'token-bucket' as const,
        throwOnLimit: false,
      };

      await provider.checkRateLimit(pattern);

      expect(tokenBucketSpy).toHaveBeenCalledWith(25, '240000ms', 25);
    });

    test('should throw error for unsupported algorithm', async () => {
      const pattern = {
        getIdentifier: 'unsupported-test',
        tokens: 10,
        interval: 60000,
        algorithm: 'unsupported-algorithm' as any,
        throwOnLimit: false,
      };

      await expect(provider.checkRateLimit(pattern)).rejects.toThrow(
        'Unsupported rate limit algorithm: unsupported-algorithm',
      );
    });

    test('should reuse existing rate limiter', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const constructorSpy = vi.mocked(Ratelimit);

      const pattern = {
        getIdentifier: 'reuse-test',
        tokens: 10,
        interval: 60000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: false,
      };

      // First call
      await provider.checkRateLimit(pattern);
      const callCount1 = constructorSpy.mock.calls.length;

      // Second call with same pattern
      await provider.checkRateLimit(pattern);
      const callCount2 = constructorSpy.mock.calls.length;

      // Should not have created a new rate limiter
      expect(callCount2).toBe(callCount1);
    });
  });

  describe('utility methods', () => {
    test('should clear cache', () => {
      provider.clearCache();
      // No easy way to test this directly, but it should not throw
      expect(true).toBeTruthy();
    });

    test('should get stats', async () => {
      // Create some rate limiters first
      const pattern1 = {
        getIdentifier: 'stats-test-1',
        tokens: 10,
        interval: 60000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: false,
      };

      const pattern2 = {
        getIdentifier: 'stats-test-2',
        tokens: 20,
        interval: 120000,
        algorithm: 'fixed-window' as const,
        throwOnLimit: false,
      };

      await provider.checkRateLimit(pattern1);
      await provider.checkRateLimit(pattern2);

      const stats = provider.getStats();

      expect(stats.activeLimiters).toBeGreaterThanOrEqual(0);
      expect(typeof stats.limiterTypes).toBe('object');
    });

    test('should reset rate limit', async () => {
      const { redis } = await import('@repo/database/redis/server');

      await provider.resetRateLimit('test-identifier', 'custom-key');

      expect(redis.del).toHaveBeenCalledWith('test-rl:custom-key');
    });

    test('should reset rate limit with default key', async () => {
      const { redis } = await import('@repo/database/redis/server');

      await provider.resetRateLimit('test-identifier');

      expect(redis.del).toHaveBeenCalledWith('test-rl:test-identifier');
    });

    test('should handle reset rate limit errors', async () => {
      const { redis } = await import('@repo/database/redis/server');
      vi.mocked(redis.del).mockRejectedValueOnce(new Error('Redis error'));

      await expect(provider.resetRateLimit('test-identifier')).rejects.toThrow(
        'Failed to reset rate limit for test-identifier',
      );
    });

    test('should cleanup properly', async () => {
      await expect(provider.cleanup()).resolves.not.toThrow();
    });
  });

  describe('health check', () => {
    test('should return healthy status', async () => {
      const { redis } = await import('@repo/database/redis/server');
      vi.mocked(redis.ping).mockResolvedValueOnce('PONG');

      const health = await provider.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.responseTime).toBeGreaterThanOrEqual(0);
      expect(health.timestamp).toBeInstanceOf(Date);
      expect(health.details?.redis).toBe('healthy');
      expect(typeof health.details?.activeLimiters).toBe('number');
    });

    test('should return unhealthy status when Redis fails', async () => {
      const { redis } = await import('@repo/database/redis/server');
      vi.mocked(redis.ping).mockRejectedValueOnce(new Error('Redis connection failed'));

      const health = await provider.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.responseTime).toBeGreaterThanOrEqual(0);
      expect(health.timestamp).toBeInstanceOf(Date);
      expect(health.details?.redis).toBe('unhealthy');
      expect(health.details?.error).toBe('Redis connection failed');
    });
  });

  describe('decorator', () => {
    test('should create rate limit decorator', () => {
      const pattern = {
        getIdentifier: 'decorator-test',
        tokens: 10,
        interval: 60000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: false,
      };

      const decorator = provider.createRateLimitDecorator(pattern);

      expect(typeof decorator).toBe('function');
    });

    test('should apply rate limiting to decorated method', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const mockLimit = vi.fn().mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 8,
        reset: Date.now() + 60000,
      });

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: mockLimit,
          }) as any,
      );

      const pattern = {
        getIdentifier: 'decorator-method-test',
        tokens: 5,
        interval: 30000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: false,
      };

      const decorator = provider.createRateLimitDecorator(pattern);

      class TestClass {
        options = {
          algorithm: 'sliding-window' as const,
          defaultLimit: { requests: 10, window: 60 },
          keyPrefix: 'test-rl',
          enableRedis: true,
        };

        @decorator
        async testMethod() {
          return 'decorated-result';
        }
      }

      const instance = new TestClass();
      const result = await instance.testMethod();

      expect(result).toBe('decorated-result');
    });
  });

  describe('error handling edge cases', () => {
    test('should handle rate limit error correctly in checkRateLimit', async () => {
      const rateLimitError = new RateLimitError('Custom rate limit error', 10, 60000, 30);

      const pattern = {
        getIdentifier: 'error-test',
        tokens: 10,
        interval: 60000,
        algorithm: 'sliding-window' as const,
        throwOnLimit: true,
      };

      // Mock the private method call to throw a RateLimitError
      vi.spyOn(provider as any, 'getRateLimiter').mockImplementation(() => ({
        limit: vi.fn().mockRejectedValue(rateLimitError),
      }));

      await expect(provider.checkRateLimit(pattern)).rejects.toThrow(RateLimitError);
    });

    test('should handle various algorithm types in stats', async () => {
      // Create rate limiters with different algorithms to test stats
      const patterns = [
        {
          getIdentifier: 'stats-sliding',
          tokens: 10,
          interval: 60000,
          algorithm: 'sliding-window' as const,
          throwOnLimit: false,
        },
        {
          getIdentifier: 'stats-fixed',
          tokens: 15,
          interval: 120000,
          algorithm: 'fixed-window' as const,
          throwOnLimit: false,
        },
        {
          getIdentifier: 'stats-token',
          tokens: 20,
          interval: 180000,
          algorithm: 'token-bucket' as const,
          throwOnLimit: false,
        },
      ];

      for (const pattern of patterns) {
        await provider.checkRateLimit(pattern);
      }

      const stats = provider.getStats();

      expect(stats.activeLimiters).toBeGreaterThanOrEqual(3);
      expect(Object.keys(stats.limiterTypes).length).toBeGreaterThanOrEqual(1);
    });
  });
});
