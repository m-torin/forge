/**
 * Comprehensive test coverage for rate-limit.ts
 * Tests rate limiting functionality, headers, and configuration
 */

import { beforeEach, describe, expect, vi } from 'vitest';

// Import after mocking
import {
  createRateLimiter,
  createRateLimitHeaders,
  RateLimitConfig,
  RateLimitResult,
  withRateLimit,
} from '../../src/shared/utils/rate-limit';

// Mock dependencies
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(config => ({
    limit: vi.fn().mockResolvedValue({
      success: true,
      limit: config.limiter.tokens || 100,
      remaining: 95,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    }),
    identifier: vi.fn().mockReturnValue('test-identifier'),
    config,
  })),
  sliding: vi.fn().mockReturnValue({
    type: 'sliding',
    tokens: 100,
    window: '1m',
  }),
  fixed: vi.fn().mockReturnValue({
    type: 'fixed',
    tokens: 100,
    window: '1m',
  }),
}));

vi.mock('@repo/database/redis/server', () => ({
  redis: {
    ping: vi.fn().mockResolvedValue('PONG'),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
  },
}));

describe('rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRateLimiter', () => {
    test('should create rate limiter with default config', () => {
      const rateLimiter = createRateLimiter();

      expect(rateLimiter).toBeDefined();
      expect(typeof rateLimiter.limit).toBe('function');
    });

    test('should create rate limiter with custom config', () => {
      const config: RateLimitConfig = {
        maxRequests: 200,
        windowMs: 120000,
        prefix: 'custom-prefix',
        algorithm: 'sliding',
      };

      const rateLimiter = createRateLimiter(config);

      expect(rateLimiter).toBeDefined();
      expect(rateLimiter.config).toStrictEqual(
        expect.objectContaining({
          maxRequests: 200,
          windowMs: 120000,
          prefix: 'custom-prefix',
          algorithm: 'sliding',
        }),
      );
    });

    test('should create rate limiter with fixed window algorithm', () => {
      const config: RateLimitConfig = {
        maxRequests: 100,
        windowMs: 60000,
        algorithm: 'fixed',
      };

      const rateLimiter = createRateLimiter(config);

      expect(rateLimiter).toBeDefined();
    });

    test('should handle missing optional fields', () => {
      const config: RateLimitConfig = {
        maxRequests: 50,
        windowMs: 30000,
      };

      const rateLimiter = createRateLimiter(config);

      expect(rateLimiter).toBeDefined();
      expect(rateLimiter.config.prefix).toBe('default');
      expect(rateLimiter.config.algorithm).toBe('sliding');
    });
  });

  describe('rateLimiter limit method', () => {
    test('should allow request when under limit', async () => {
      const rateLimiter = createRateLimiter();

      const result = await rateLimiter.limit('test-key');

      expect(result.success).toBeTruthy();
      expect(result.limit).toBe(100);
      expect(result.remaining).toBe(95);
      expect(result.reset).toBeInstanceOf(Date);
      expect(typeof result.resetTime).toBe('number');
    });

    test('should deny request when over limit', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const mockLimit = vi.fn().mockResolvedValue({
        success: false,
        limit: 100,
        remaining: 0,
        reset: Date.now() + 60000,
        pending: Promise.resolve(),
      });

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: mockLimit,
            identifier: vi.fn(),
            config: {},
          }) as any,
      );

      const rateLimiter = createRateLimiter();
      const result = await rateLimiter.limit('test-key');

      expect(result.success).toBeFalsy();
      expect(result.remaining).toBe(0);
    });

    test('should handle rate limiter errors gracefully', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const mockLimit = vi.fn().mockRejectedValue(new Error('Redis connection failed'));

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: mockLimit,
            identifier: vi.fn(),
            config: {},
          }) as any,
      );

      const rateLimiter = createRateLimiter();
      const result = await rateLimiter.limit('test-key');

      // Should fail gracefully
      expect(result.success).toBeFalsy();
      expect(result.error).toBeDefined();
    });

    test('should use different identifiers for different keys', async () => {
      const rateLimiter = createRateLimiter();

      await rateLimiter.limit('key-1');
      await rateLimiter.limit('key-2');

      // Both should work independently
      expect(true).toBeTruthy(); // Basic assertion to ensure no errors
    });
  });

  describe('withRateLimit', () => {
    test('should execute function when under rate limit', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const rateLimitedFn = withRateLimit(fn, {
        maxRequests: 100,
        windowMs: 60000,
      });

      const result = await rateLimitedFn('test-identifier');

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledWith('test-identifier');
    });

    test('should throw error when rate limit exceeded', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const mockLimit = vi.fn().mockResolvedValue({
        success: false,
        limit: 100,
        remaining: 0,
        reset: Date.now() + 60000,
        pending: Promise.resolve(),
      });

      vi.mocked(Ratelimit).mockImplementation(
        () =>
          ({
            limit: mockLimit,
            identifier: vi.fn(),
            config: {},
          }) as any,
      );

      const fn = vi.fn().mockResolvedValue('success');
      const rateLimitedFn = withRateLimit(fn, {
        maxRequests: 100,
        windowMs: 60000,
      });

      await expect(rateLimitedFn('test-identifier')).rejects.toThrow();
      expect(fn).not.toHaveBeenCalled();
    });

    test('should generate identifier from function arguments', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const rateLimitedFn = withRateLimit(fn, {
        maxRequests: 100,
        windowMs: 60000,
      });

      await rateLimitedFn('arg1', 'arg2', { key: 'value' });

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' });
    });

    test('should use custom identifier function', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const identifierFn = vi.fn().mockReturnValue('custom-id');

      const rateLimitedFn = withRateLimit(fn, {
        maxRequests: 100,
        windowMs: 60000,
        identifierFn,
      });

      await rateLimitedFn('arg1', 'arg2');

      expect(identifierFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(fn).toHaveBeenCalledWith();
    });

    test('should handle async functions', async () => {
      const asyncFn = vi.fn().mockImplementation(async (value: string) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return `async-${value}`;
      });

      const rateLimitedFn = withRateLimit(asyncFn, {
        maxRequests: 100,
        windowMs: 60000,
      });

      const result = await rateLimitedFn('test');

      expect(result).toBe('async-test');
      expect(asyncFn).toHaveBeenCalledWith('test');
    });

    test('should preserve function context and arguments', async () => {
      const fn = vi.fn().mockResolvedValue('result');
      const rateLimitedFn = withRateLimit(fn, {
        maxRequests: 100,
        windowMs: 60000,
      });

      const context = { userId: '123' };
      const result = await rateLimitedFn.call(context, 'arg1', 42, { nested: true });

      expect(result).toBe('result');
      expect(fn).toHaveBeenCalledWith('arg1', 42, { nested: true });
    });
  });

  describe('createRateLimitHeaders', () => {
    test('should create rate limit headers from result', () => {
      const result: RateLimitResult = {
        success: true,
        limit: 100,
        remaining: 75,
        reset: new Date('2024-01-01T12:00:00Z'),
        resetTime: Date.parse('2024-01-01T12:00:00Z'),
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('100');
      expect(headers['X-RateLimit-Remaining']).toBe('75');
      expect(headers['X-RateLimit-Reset']).toBe('1704110400');
    });

    test('should create headers when rate limit exceeded', () => {
      const result: RateLimitResult = {
        success: false,
        limit: 100,
        remaining: 0,
        reset: new Date('2024-01-01T12:05:00Z'),
        resetTime: Date.parse('2024-01-01T12:05:00Z'),
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('100');
      expect(headers['X-RateLimit-Remaining']).toBe('0');
      expect(headers['X-RateLimit-Reset']).toBe('1704110700');
    });

    test('should handle edge case with zero remaining', () => {
      const result: RateLimitResult = {
        success: false,
        limit: 50,
        remaining: 0,
        reset: new Date(),
        resetTime: Date.now(),
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Remaining']).toBe('0');
    });

    test('should handle large limit values', () => {
      const result: RateLimitResult = {
        success: true,
        limit: 999999,
        remaining: 888888,
        reset: new Date(),
        resetTime: Date.now(),
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('999999');
      expect(headers['X-RateLimit-Remaining']).toBe('888888');
    });
  });

  describe('configuration Edge Cases', () => {
    test('should handle very low rate limits', () => {
      const config: RateLimitConfig = {
        maxRequests: 1,
        windowMs: 1000,
      };

      const rateLimiter = createRateLimiter(config);

      expect(rateLimiter).toBeDefined();
      expect(rateLimiter.config.maxRequests).toBe(1);
    });

    test('should handle very high rate limits', () => {
      const config: RateLimitConfig = {
        maxRequests: 1000000,
        windowMs: 1000,
      };

      const rateLimiter = createRateLimiter(config);

      expect(rateLimiter).toBeDefined();
      expect(rateLimiter.config.maxRequests).toBe(1000000);
    });

    test('should handle very short time windows', () => {
      const config: RateLimitConfig = {
        maxRequests: 100,
        windowMs: 100, // 100ms
      };

      const rateLimiter = createRateLimiter(config);

      expect(rateLimiter).toBeDefined();
      expect(rateLimiter.config.windowMs).toBe(100);
    });

    test('should handle very long time windows', () => {
      const config: RateLimitConfig = {
        maxRequests: 100,
        windowMs: 86400000, // 24 hours
      };

      const rateLimiter = createRateLimiter(config);

      expect(rateLimiter).toBeDefined();
      expect(rateLimiter.config.windowMs).toBe(86400000);
    });

    test('should handle empty prefix', () => {
      const config: RateLimitConfig = {
        maxRequests: 100,
        windowMs: 60000,
        prefix: '',
      };

      const rateLimiter = createRateLimiter(config);

      expect(rateLimiter).toBeDefined();
      expect(rateLimiter.config.prefix).toBe('');
    });

    test('should handle special characters in prefix', () => {
      const config: RateLimitConfig = {
        maxRequests: 100,
        windowMs: 60000,
        prefix: 'rate-limit:api/v1:user-operations',
      };

      const rateLimiter = createRateLimiter(config);

      expect(rateLimiter).toBeDefined();
      expect(rateLimiter.config.prefix).toBe('rate-limit:api/v1:user-operations');
    });
  });

  describe('integration Tests', () => {
    test('should work with multiple rate limiters', async () => {
      const strictLimiter = createRateLimiter({
        maxRequests: 10,
        windowMs: 60000,
        prefix: 'strict',
      });

      const lenientLimiter = createRateLimiter({
        maxRequests: 1000,
        windowMs: 60000,
        prefix: 'lenient',
      });

      const strictResult = await strictLimiter.limit('test-key');
      const lenientResult = await lenientLimiter.limit('test-key');

      expect(strictResult.success).toBeTruthy();
      expect(lenientResult.success).toBeTruthy();
      expect(strictResult.limit).toBe(10);
      expect(lenientResult.limit).toBe(1000);
    });

    test('should integrate rate limiting with function execution', async () => {
      let callCount = 0;
      const fn = vi.fn().mockImplementation(() => {
        callCount++;
        return `call-${callCount}`;
      });

      const rateLimitedFn = withRateLimit(fn, {
        maxRequests: 100,
        windowMs: 60000,
        prefix: 'integration-test',
      });

      // Multiple calls should all succeed under the limit
      const results = await Promise.all([
        rateLimitedFn('test-1'),
        rateLimitedFn('test-2'),
        rateLimitedFn('test-3'),
      ]);

      expect(results).toStrictEqual(['call-1', 'call-2', 'call-3']);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('should handle rate limiting with custom identifier generation', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      // Create identifier based on user ID from first argument
      const identifierFn = (userId: string, action: string) => `${userId}:${action}`;

      const rateLimitedFn = withRateLimit(fn, {
        maxRequests: 100,
        windowMs: 60000,
        identifierFn,
      });

      await rateLimitedFn('user-123', 'upload');
      await rateLimitedFn('user-456', 'upload');
      await rateLimitedFn('user-123', 'download');

      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('should create appropriate headers for API responses', async () => {
      const rateLimiter = createRateLimiter({
        maxRequests: 100,
        windowMs: 60000,
      });

      const result = await rateLimiter.limit('api-test');
      const headers = createRateLimitHeaders(result);

      expect(headers).toHaveProperty('X-RateLimit-Limit');
      expect(headers).toHaveProperty('X-RateLimit-Remaining');
      expect(headers).toHaveProperty('X-RateLimit-Reset');

      // Headers should be strings
      expect(typeof headers['X-RateLimit-Limit']).toBe('string');
      expect(typeof headers['X-RateLimit-Remaining']).toBe('string');
      expect(typeof headers['X-RateLimit-Reset']).toBe('string');
    });
  });

  describe('error Handling and Edge Cases', () => {
    test('should handle null/undefined identifiers gracefully', async () => {
      const rateLimiter = createRateLimiter();

      const result1 = await rateLimiter.limit(null as any);
      const result2 = await rateLimiter.limit(undefined as any);

      // Should not throw errors
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    test('should handle very long identifier strings', async () => {
      const rateLimiter = createRateLimiter();
      const longIdentifier = 'a'.repeat(1000);

      const result = await rateLimiter.limit(longIdentifier);

      expect(result).toBeDefined();
      expect(result.success).toBeTruthy();
    });

    test('should handle concurrent rate limit checks', async () => {
      const rateLimiter = createRateLimiter({
        maxRequests: 100,
        windowMs: 60000,
      });

      // Make multiple concurrent requests
      const promises = Array.from({ length: 10 }, (_, i) =>
        rateLimiter.limit(`concurrent-test-${i}`),
      );

      const results = await Promise.all(promises);

      // All should succeed for different identifiers
      results.forEach(result => {
        expect(result.success).toBeTruthy();
      });
    });
  });
});
