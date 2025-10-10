/**
 * Shared Test Utilities
 *
 * Common testing utilities and patterns used across security test suites.
 * Reduces duplication and provides consistent testing interfaces.
 */

import { vi } from 'vitest';

/**
 * Mock request builder for testing security middleware
 */
export function createMockRequest(overrides: any = {}) {
  const defaultRequest = {
    ip: '192.168.1.1',
    method: 'GET',
    url: 'https://test.com/api/test',
    headers: new Map([
      ['user-agent', 'Mozilla/5.0 (Test Browser)'],
      ['x-forwarded-for', '192.168.1.1'],
    ]),
    nextUrl: {
      pathname: '/api/test',
      searchParams: new URLSearchParams(),
    },
  };

  return {
    ...defaultRequest,
    ...overrides,
    headers: new Map([...defaultRequest.headers, ...(overrides.headers || [])]),
  };
}

/**
 * Mock response builder for testing security responses
 */
export function createMockResponse(overrides: any = {}) {
  const headers = new Map();

  const response = {
    status: 200,
    headers,
    json: vi.fn(),
    text: vi.fn(),
    redirect: vi.fn(),
    rewrite: vi.fn(),
    next: vi.fn(),
    ...overrides,
  };

  // Add helper methods for header manipulation
  response.setHeader = (name: string, value: string) => {
    headers.set(name.toLowerCase(), value);
    return response;
  };

  response.getHeader = (name: string) => {
    return headers.get(name.toLowerCase());
  };

  response.hasHeader = (name: string) => {
    return headers.has(name.toLowerCase());
  };

  return response;
}

/**
 * Creates a mock Redis client for rate limiting tests
 */
export function createMockRedisClient() {
  const storage = new Map<string, any>();

  return {
    storage, // Expose for test inspection

    async get(key: string) {
      return storage.get(key) || null;
    },

    async set(key: string, value: any, options?: any) {
      storage.set(key, value);

      // Handle TTL if provided
      if (options?.ex) {
        setTimeout(() => {
          storage.delete(key);
        }, options.ex * 1000);
      }

      return 'OK';
    },

    async del(key: string) {
      return storage.delete(key) ? 1 : 0;
    },

    async incr(key: string) {
      const current = storage.get(key) || 0;
      const newValue = current + 1;
      storage.set(key, newValue);
      return newValue;
    },

    async expire(key: string, seconds: number) {
      if (storage.has(key)) {
        setTimeout(() => {
          storage.delete(key);
        }, seconds * 1000);
        return 1;
      }
      return 0;
    },

    async ttl(key: string) {
      // Simple mock - return -1 if no TTL, -2 if key doesn't exist
      return storage.has(key) ? -1 : -2;
    },

    clear() {
      storage.clear();
    },
  };
}

/**
 * Mock environment configuration for testing
 */
export function createMockEnv(overrides: any = {}) {
  return {
    NODE_ENV: 'test',
    RATE_LIMIT_REQUESTS: '100',
    RATE_LIMIT_WINDOW: '3600',
    UPSTASH_REDIS_REST_URL: 'memory',
    UPSTASH_REDIS_REST_TOKEN: 'test-token',
    SECURITY_HEADERS_STRICT: 'false',
    ARCJET_KEY: 'ajkey_test_key',
    ...overrides,
  };
}

/**
 * Waits for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates multiple concurrent requests for rate limiting tests
 */
export async function createConcurrentRequests(
  requestFactory: () => Promise<any>,
  count: number,
  delayMs: number = 0,
): Promise<any[]> {
  const requests = Array.from({ length: count }, async (_, i) => {
    if (delayMs > 0) {
      await sleep(i * delayMs);
    }
    return requestFactory();
  });

  return Promise.all(requests);
}

/**
 * Asserts that security headers are present in response
 */
export function assertSecurityHeaders(response: any, expectedHeaders: string[] = []) {
  const defaultHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'referrer-policy',
  ];

  const headersToCheck = expectedHeaders.length > 0 ? expectedHeaders : defaultHeaders;

  headersToCheck.forEach(header => {
    const headerValue = response.getHeader
      ? response.getHeader(header)
      : response.headers?.[header];
    if (!headerValue) {
      throw new Error(`Missing security header: ${header}`);
    }
  });
}

/**
 * Asserts that rate limiting is working correctly
 */
export function assertRateLimitResponse(response: any, shouldBeBlocked: boolean = false) {
  if (shouldBeBlocked) {
    if (response.status !== 429) {
      throw new Error(`Expected rate limit (429), got ${response.status}`);
    }

    const retryAfter = response.getHeader
      ? response.getHeader('retry-after')
      : response.headers?.['retry-after'];
    if (!retryAfter) {
      throw new Error('Missing Retry-After header on rate limited response');
    }
  } else {
    if (response.status === 429) {
      throw new Error('Request was unexpectedly rate limited');
    }
  }
}

/**
 * Mock setup helpers for common security testing scenarios
 */
export const mockHelpers = {
  /**
   * Sets up Redis mocks with in-memory storage
   */
  setupRedisMocks() {
    const mockRedis = createMockRedisClient();

    vi.doMock('@repo/db-upstash-redis/server', () => ({
      redis: mockRedis,
    }));

    return mockRedis;
  },

  /**
   * Sets up environment mocks
   */
  setupEnvMocks(customEnv: any = {}) {
    const mockEnv = createMockEnv(customEnv);

    vi.doMock('../env', () => ({
      safeEnv: vi.fn(() => mockEnv),
    }));

    return mockEnv;
  },

  /**
   * Sets up server-only mock to prevent import errors
   */
  setupServerOnlyMock() {
    vi.doMock('server-only', () => ({}));
  },

  /**
   * Sets up Arcjet mocks for security testing
   */
  setupArcjetMocks() {
    const mockProtect = vi.fn();
    const mockWithRule = vi.fn();
    const mockArcjet = vi.fn();

    mockProtect.mockResolvedValue({
      isDenied: vi.fn(() => false),
    });

    mockWithRule.mockReturnValue({
      protect: mockProtect,
    });

    mockArcjet.mockReturnValue({
      withRule: mockWithRule,
    });

    vi.doMock('@arcjet/next', () => ({
      default: mockArcjet,
      detectBot: vi.fn(),
      request: vi.fn(),
      shield: vi.fn(),
    }));

    return {
      mockProtect,
      mockWithRule,
      mockArcjet,
    };
  },
};

/**
 * Test patterns for common security scenarios
 */
export const testPatterns = {
  /**
   * Standard test for rate limiting functionality
   */
  async testRateLimit(
    rateLimitFunction: Function,
    config: { requests: number; window: number },
    testRequestCount: number,
  ) {
    const results = [];

    for (let i = 0; i < testRequestCount; i++) {
      try {
        const result = await rateLimitFunction(`test-key-${i}`);
        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error });
      }
    }

    return results;
  },

  /**
   * Standard test for security middleware functionality
   */
  async testSecurityMiddleware(middleware: Function, request: any, expectedResponse: any) {
    const response = createMockResponse();

    try {
      await middleware(request, response);
      return { success: true, response };
    } catch (error) {
      return { success: false, error, response };
    }
  },

  /**
   * Standard test for header security
   */
  testSecurityHeaders(response: any, requiredHeaders: string[] = []) {
    try {
      assertSecurityHeaders(response, requiredHeaders);
      return { success: true, headers: response.headers };
    } catch (error) {
      return { success: false, error, headers: response.headers };
    }
  },
};
