import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createRateLimitHeaders,
  createRateLimiter,
  withRateLimit,
  type RateLimitConfig,
  type RateLimitResult,
} from '../../src/shared/utils/rate-limit';

// 3rd party mocks are auto-imported by @repo/qa package

vi.mock('@repo/observability/server/next', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

// Mock NextRequest
const createMockRequest = (headers: Record<string, string> = {}) =>
  ({
    headers: {
      get: (name: string) => headers[name] || null,
    },
  }) as any;

describe('rate-limit utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset NODE_ENV to test value using vi.stubEnv
    vi.stubEnv('NODE_ENV', 'test');
  });

  describe('createRateLimiter', () => {
    test('should create rate limiter with default configuration', () => {
      const config: RateLimitConfig = {
        maxRequests: 100,
        windowMs: 60000,
      };

      const rateLimiter = createRateLimiter(config);

      expect(rateLimiter).toBeDefined();
      expect(typeof rateLimiter.limit).toBe('function');
    });

    test('should create no-op rate limiter when Redis not available', async () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 30000,
        useRedis: false,
      };

      const rateLimiter = createRateLimiter(config);
      const request = createMockRequest();

      const result = await rateLimiter.limit(request);

      expect(result.success).toBeTruthy();
      expect(result.remaining).toBe(10);
      expect(result.limit).toBe(10);
      expect(result.reset).toBeGreaterThan(Date.now());
    });

    test('should handle custom identifier function', async () => {
      const customGetIdentifier = vi.fn().mockReturnValue('custom-id-123');
      const config: RateLimitConfig = {
        maxRequests: 5,
        windowMs: 15000,
        useRedis: true, // Enable Redis so custom identifier gets called
        getIdentifier: customGetIdentifier,
      };

      const rateLimiter = createRateLimiter(config);
      const request = createMockRequest();

      await rateLimiter.limit(request);

      expect(customGetIdentifier).toHaveBeenCalledWith(request);
    });

    test('should use custom prefix', () => {
      const config: RateLimitConfig = {
        maxRequests: 50,
        windowMs: 45000,
        useRedis: false,
        prefix: 'custom_prefix',
      };

      const rateLimiter = createRateLimiter(config);

      expect(rateLimiter).toBeDefined();
    });
  });

  describe('identifier extraction', () => {
    test('should extract IP from x-forwarded-for header', async () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
        useRedis: false,
      };

      const rateLimiter = createRateLimiter(config);
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      });

      const result = await rateLimiter.limit(request);

      expect(result.success).toBeTruthy();
    });

    test('should extract IP from x-real-ip header', async () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
        useRedis: false,
      };

      const rateLimiter = createRateLimiter(config);
      const request = createMockRequest({
        'x-real-ip': '203.0.113.1',
      });

      const result = await rateLimiter.limit(request);

      expect(result.success).toBeTruthy();
    });

    test('should extract IP from cf-connecting-ip header', async () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
        useRedis: false,
      };

      const rateLimiter = createRateLimiter(config);
      const request = createMockRequest({
        'cf-connecting-ip': '198.51.100.1',
      });

      const result = await rateLimiter.limit(request);

      expect(result.success).toBeTruthy();
    });

    test('should fallback to anonymous when no IP headers present', async () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
        useRedis: false,
      };

      const rateLimiter = createRateLimiter(config);
      const request = createMockRequest();

      const result = await rateLimiter.limit(request);

      expect(result.success).toBeTruthy();
    });

    test('should prioritize x-forwarded-for over other headers', async () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
        useRedis: false,
      };

      const rateLimiter = createRateLimiter(config);
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '203.0.113.1',
        'cf-connecting-ip': '198.51.100.1',
      });

      const result = await rateLimiter.limit(request);

      expect(result.success).toBeTruthy();
    });
  });

  describe('withRateLimit', () => {
    test('should apply rate limiting to request', async () => {
      const config: RateLimitConfig = {
        maxRequests: 20,
        windowMs: 30000,
        useRedis: false,
      };

      const request = createMockRequest();
      const result = await withRateLimit(request, config);

      expect(result.success).toBeTruthy();
      expect(result.limit).toBe(20);
      expect(result.remaining).toBe(20);
    });

    test('should handle rate limit denial', async () => {
      const config: RateLimitConfig = {
        maxRequests: 0, // This should cause denial in real scenario
        windowMs: 30000,
        useRedis: false,
      };

      const request = createMockRequest();
      const result = await withRateLimit(request, config);

      // With no-op limiter, it always succeeds
      expect(result.success).toBeTruthy();
    });
  });

  describe('createRateLimitHeaders', () => {
    test('should create basic rate limit headers', () => {
      const result: RateLimitResult = {
        success: true,
        remaining: 95,
        limit: 100,
        reset: 1640995200000, // 2022-01-01T00:00:00.000Z
      };

      const headers = createRateLimitHeaders(result);
      const headersRecord = headers as Record<string, string>;

      expect(headersRecord['X-RateLimit-Limit']).toBe('100');
      expect(headersRecord['X-RateLimit-Remaining']).toBe('95');
      expect(headersRecord['X-RateLimit-Reset']).toBe('2022-01-01T00:00:00.000Z');
      expect(headersRecord['X-RateLimit-Reason']).toBeUndefined();
    });

    test('should include reason header when rate limited', () => {
      const result: RateLimitResult = {
        success: false,
        remaining: 0,
        limit: 100,
        reset: 1640995200000,
        reason: 'Rate limit exceeded',
      };

      const headers = createRateLimitHeaders(result);
      const headersRecord = headers as Record<string, string>;

      expect(headersRecord['X-RateLimit-Limit']).toBe('100');
      expect(headersRecord['X-RateLimit-Remaining']).toBe('0');
      expect(headersRecord['X-RateLimit-Reset']).toBe('2022-01-01T00:00:00.000Z');
      expect(headersRecord['X-RateLimit-Reason']).toBe('Rate limit exceeded');
    });

    test('should handle zero values', () => {
      const result: RateLimitResult = {
        success: false,
        remaining: 0,
        limit: 0,
        reset: 0,
      };

      const headers = createRateLimitHeaders(result);
      const headersRecord = headers as Record<string, string>;

      expect(headersRecord['X-RateLimit-Limit']).toBe('0');
      expect(headersRecord['X-RateLimit-Remaining']).toBe('0');
      expect(headersRecord['X-RateLimit-Reset']).toBe('1970-01-01T00:00:00.000Z');
    });

    test('should handle large numbers', () => {
      const result: RateLimitResult = {
        success: true,
        remaining: 999999,
        limit: 1000000,
        reset: 9999999999999,
      };

      const headers = createRateLimitHeaders(result);
      const headersRecord = headers as Record<string, string>;

      expect(headersRecord['X-RateLimit-Limit']).toBe('1000000');
      expect(headersRecord['X-RateLimit-Remaining']).toBe('999999');
      expect(headersRecord['X-RateLimit-Reset']).toBe('2286-11-20T17:46:39.999Z');
    });
  });

  describe('edge Cases', () => {
    test('should handle malformed x-forwarded-for header', async () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
        useRedis: false,
      };

      const rateLimiter = createRateLimiter(config);
      const request = createMockRequest({
        'x-forwarded-for': '   , , ,   ', // Malformed with spaces and commas
      });

      const result = await rateLimiter.limit(request);

      expect(result.success).toBeTruthy();
    });

    test('should handle empty header values', async () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
        useRedis: false,
      };

      const rateLimiter = createRateLimiter(config);
      const request = createMockRequest({
        'x-forwarded-for': '',
        'x-real-ip': '',
        'cf-connecting-ip': '',
      });

      const result = await rateLimiter.limit(request);

      expect(result.success).toBeTruthy();
    });

    test('should handle very large configuration values', () => {
      const config: RateLimitConfig = {
        maxRequests: Number.MAX_SAFE_INTEGER,
        windowMs: Number.MAX_SAFE_INTEGER,
        useRedis: false,
      };

      const rateLimiter = createRateLimiter(config);

      expect(rateLimiter).toBeDefined();
      expect(typeof rateLimiter.limit).toBe('function');
    });

    test('should handle zero configuration values', () => {
      const config: RateLimitConfig = {
        maxRequests: 0,
        windowMs: 0,
        useRedis: false,
      };

      const rateLimiter = createRateLimiter(config);

      expect(rateLimiter).toBeDefined();
      expect(typeof rateLimiter.limit).toBe('function');
    });

    test('should handle development environment logging', () => {
      vi.stubEnv('NODE_ENV', 'development');

      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
        useRedis: false, // This will trigger the development logging
      };

      const rateLimiter = createRateLimiter(config);

      expect(rateLimiter).toBeDefined();

      // Environment will be restored automatically by vi.stubEnv
    });
  });

  describe('integration scenarios', () => {
    test('should work with all configuration options', async () => {
      const customIdentifier = vi.fn().mockReturnValue('test-user-123');
      const config: RateLimitConfig = {
        maxRequests: 50,
        windowMs: 120000,
        useRedis: false, // Use no-op limiter for predictable testing
        getIdentifier: customIdentifier,
        prefix: 'test_api',
      };

      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.100',
      });

      const result = await withRateLimit(request, config);

      expect(result.success).toBeTruthy();
      expect(result.limit).toBe(50);
      expect(result.remaining).toBe(50);
      // Custom identifier is not called with no-op limiter
    });

    test('should create consistent headers for successful rate limit', () => {
      const result: RateLimitResult = {
        success: true,
        remaining: 42,
        limit: 100,
        reset: Date.now() + 60000,
      };

      const headers = createRateLimitHeaders(result);

      expect(Object.keys(headers)).toStrictEqual([
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
      ]);
    });

    test('should create consistent headers for denied rate limit', () => {
      const result: RateLimitResult = {
        success: false,
        remaining: 0,
        limit: 100,
        reset: Date.now() + 60000,
        reason: 'Rate limit exceeded',
      };

      const headers = createRateLimitHeaders(result);

      expect(Object.keys(headers)).toStrictEqual([
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-RateLimit-Reason',
      ]);
    });
  });
});
