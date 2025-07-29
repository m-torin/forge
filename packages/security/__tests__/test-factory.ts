/**
 * Security Test Factory
 *
 * Centralized factory for creating consistent security tests, reducing repetitive patterns.
 * This factory provides common test scenarios and data generators for security functionality.
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';

/**
 * Security test factory configuration
 */
export interface SecurityTestConfig<TResult = any> {
  /** Name of the security function being tested */
  functionName: string;
  /** The security function to test */
  securityFunction: (...args: any[]) => TResult;
  /** Test scenarios to generate */
  scenarios: SecurityTestScenario<TResult>[];
}

/**
 * Test scenario definition
 */
export interface SecurityTestScenario<TResult = any> {
  /** Name of the test scenario */
  name: string;
  /** Description of what the test validates */
  description: string;
  /** Arguments to pass to the security function */
  args: any[];
  /** Expected result validation */
  validate: (result: TResult) => void;
  /** Whether this scenario should throw an error */
  shouldThrow?: boolean;
  /** Expected error message if shouldThrow is true */
  expectedError?: string;
}

/**
 * Creates a complete test suite for a security function
 */
export function createSecurityTestSuite<TResult = any>(config: SecurityTestConfig<TResult>) {
  const { functionName, securityFunction, scenarios } = config;

  return describe(`${functionName} security function`, () => {
    // Standard setup
    beforeEach(() => {
      vi.clearAllMocks();
      setupSecurityEnvironment();
    });

    // Generate test scenarios
    scenarios.forEach(({ name, description, args, validate, shouldThrow, expectedError }) => {
      test(`${name} - ${description}`, async () => {
        if (shouldThrow) {
          await expect(() => securityFunction(...args)).rejects.toThrow(expectedError || '');
        } else {
          const result = await securityFunction(...args);

          // Basic validation
          expect(result).toBeDefined();

          // Custom validation
          validate(result);
        }
      });
    });

    // Standard validation tests
    test('should return defined result', async () => {
      const result = await securityFunction();
      expect(result).toBeDefined();
    });

    test('should handle security validation', async () => {
      const result = await securityFunction();
      expect(result).toBeDefined();
    });
  });
}

/**
 * Rate limiting test factory configuration
 */
export interface RateLimitTestConfig<TResult = any> {
  /** Name of the rate limiter being tested */
  limiterName: string;
  /** Path to import the rate limiter from */
  importPath: string;
  /** Test scenarios to generate */
  scenarios: RateLimitTestScenario<TResult>[];
}

/**
 * Rate limiting test scenario definition
 */
export interface RateLimitTestScenario<TResult = any> {
  /** Name of the test scenario */
  name: string;
  /** Configuration for the rate limiter */
  config: any;
  /** Number of requests to make */
  requestCount: number;
  /** Expected behavior */
  expectedBehavior: 'allow' | 'deny' | 'mixed';
  /** Custom assertion function */
  customAssertions?: (results: TResult[]) => void;
}

/**
 * Creates a complete test suite for rate limiting
 */
export function createRateLimitTestSuite<TResult = any>(config: RateLimitTestConfig<TResult>) {
  const { limiterName, importPath, scenarios } = config;

  return describe(`${limiterName} rate limiting`, () => {
    // Standard setup
    beforeEach(() => {
      vi.clearAllMocks();
      setupSecurityEnvironment();
    });

    // Generate test scenarios
    scenarios.forEach(
      ({ name, config: limiterConfig, requestCount, expectedBehavior, customAssertions }) => {
        test(`should ${name}`, async () => {
          const module = await import(importPath);
          const limiter = module[limiterName] || module.default;

          const rateLimiter = limiter(limiterConfig);
          const results: TResult[] = [];

          // Make multiple requests
          for (let i = 0; i < requestCount; i++) {
            const result = await rateLimiter.check('test-key');
            results.push(result);
          }

          // Validate behavior
          if (expectedBehavior === 'allow') {
            results.forEach(result => {
              expect((result as any).success).toBeTruthy();
            });
          } else if (expectedBehavior === 'deny') {
            expect(results.some(result => !(result as any).success)).toBeTruthy();
          }

          // Custom assertions
          if (customAssertions) {
            customAssertions(results);
          }
        });
      },
    );
  });
}

/**
 * Middleware test factory configuration
 */
export interface MiddlewareTestConfig<TResult = any> {
  /** Name of the middleware being tested */
  middlewareName: string;
  /** Path to import the middleware from */
  importPath: string;
  /** Test scenarios to generate */
  scenarios: MiddlewareTestScenario<TResult>[];
}

/**
 * Middleware test scenario definition
 */
export interface MiddlewareTestScenario<TResult = any> {
  /** Name of the test scenario */
  name: string;
  /** Mock request configuration */
  request: any;
  /** Expected response properties */
  expectedResponse?: any;
  /** Custom assertion function */
  customAssertions?: (result: TResult) => void;
  /** Whether this scenario should be blocked */
  shouldBlock?: boolean;
}

/**
 * Creates a complete test suite for security middleware
 */
export function createMiddlewareTestSuite<TResult = any>(config: MiddlewareTestConfig<TResult>) {
  const { middlewareName, importPath, scenarios } = config;

  return describe(`${middlewareName} middleware`, () => {
    // Standard setup
    beforeEach(() => {
      vi.clearAllMocks();
      setupSecurityEnvironment();
    });

    // Generate test scenarios
    scenarios.forEach(({ name, request, expectedResponse, customAssertions, shouldBlock }) => {
      test(`should ${name}`, async () => {
        const module = await import(importPath);
        const middleware = module[middlewareName] || module.default;

        const mockRequest = createMockRequest(request);
        const mockResponse = createMockResponse();
        const nextFn = vi.fn();

        await middleware(mockRequest, mockResponse, nextFn);

        if (shouldBlock) {
          expect(nextFn).not.toHaveBeenCalled();
          expect(mockResponse.status).toHaveBeenCalledWith(expect.any(Number));
        } else {
          expect(nextFn).toHaveBeenCalledWith();
        }

        // Check expected response
        if (expectedResponse) {
          Object.entries(expectedResponse).forEach(([key, value]) => {
            expect((mockResponse as any)[key]).toHaveBeenCalledWith(value);
          });
        }

        // Custom assertions
        if (customAssertions) {
          customAssertions(mockResponse as any);
        }
      });
    });
  });
}

/**
 * Headers test factory configuration
 */
export interface HeadersTestConfig<TResult = any> {
  /** Name of the headers function being tested */
  functionName: string;
  /** Path to import the function from */
  importPath: string;
  /** Test scenarios to generate */
  scenarios: HeadersTestScenario<TResult>[];
}

/**
 * Headers test scenario definition
 */
export interface HeadersTestScenario<TResult = any> {
  /** Name of the test scenario */
  name: string;
  /** Input configuration */
  config: any;
  /** Expected headers to be set */
  expectedHeaders: Record<string, string>;
  /** Custom assertion function */
  customAssertions?: (result: TResult) => void;
}

/**
 * Creates a complete test suite for security headers
 */
export function createHeadersTestSuite<TResult = any>(config: HeadersTestConfig<TResult>) {
  const { functionName, importPath, scenarios } = config;

  return describe(`${functionName} security headers`, () => {
    // Standard setup
    beforeEach(() => {
      vi.clearAllMocks();
      setupSecurityEnvironment();
    });

    // Generate test scenarios
    scenarios.forEach(({ name, config: headerConfig, expectedHeaders, customAssertions }) => {
      test(`should ${name}`, async () => {
        const module = await import(importPath);
        const fn = module[functionName] || module.default;

        const result = fn(headerConfig);

        // Check expected headers
        Object.entries(expectedHeaders).forEach(([headerName, expectedValue]) => {
          expect(result).toHaveProperty(headerName);
          if (expectedValue) {
            expect(result[headerName]).toBe(expectedValue);
          }
        });

        // Custom assertions
        if (customAssertions) {
          customAssertions(result);
        }
      });
    });
  });
}

/**
 * Sets up standard security test environment
 */
export function setupSecurityEnvironment(overrides: Record<string, string> = {}) {
  const defaultEnv = {
    NODE_ENV: 'test',
    UPSTASH_REDIS_REST_URL: 'https://test-redis.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'test-token',
    RATE_LIMIT_REQUESTS: '100',
    RATE_LIMIT_WINDOW: '3600',
    ...overrides,
  };

  vi.stubGlobal('process', {
    ...process,
    env: {
      ...process.env,
      ...defaultEnv,
    },
  });
}

/**
 * Creates a mock Next.js request object
 */
export function createMockRequest(overrides: any = {}) {
  return {
    ip: '192.168.1.1',
    headers: new Headers({
      'user-agent': 'Test Browser',
      'x-forwarded-for': '192.168.1.1',
      ...overrides.headers,
    }),
    url: 'https://test.com/api/test',
    method: 'GET',
    nextUrl: {
      pathname: '/api/test',
      searchParams: new URLSearchParams(),
    },
    ...overrides,
  };
}

/**
 * Creates a mock Next.js response object
 */
export function createMockResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    headers: {
      set: vi.fn(),
      get: vi.fn(),
      append: vi.fn(),
      delete: vi.fn(),
    },
    cookies: {
      set: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    },
  };
}

/**
 * Common test scenario generators
 */
export const createScenarios = {
  /**
   * Creates rate limiting scenarios
   */
  rateLimiting: (requests: number, limit: number) => ({
    name: `handle ${requests} requests with limit of ${limit}`,
    config: { requests: limit, window: 60 },
    requestCount: requests,
    expectedBehavior: requests > limit ? ('mixed' as const) : ('allow' as const),
  }),

  /**
   * Creates security header scenarios
   */
  securityHeaders: () => ({
    name: 'set security headers',
    config: {},
    expectedHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  }),

  /**
   * Creates middleware blocking scenarios
   */
  middlewareBlocking: (reason: string) => ({
    name: `block request due to ${reason}`,
    request: { ip: '192.168.1.1' },
    shouldBlock: true,
  }),
};

/**
 * Validation helpers for security test data
 */
export const validateSecurityResults = {
  /**
   * Validates that rate limiting response has required properties
   */
  hasValidRateLimitResult: (result: any) => {
    const required = ['success', 'limit', 'remaining', 'reset'];
    const missing = required.filter(prop => !(prop in result));
    return missing.length === 0 ? null : missing;
  },

  /**
   * Validates that security headers are properly set
   */
  hasValidSecurityHeaders: (headers: any) => {
    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Referrer-Policy',
    ];
    const missing = requiredHeaders.filter(header => !headers[header]);
    return missing.length === 0 ? null : missing;
  },

  /**
   * Validates that middleware response is secure
   */
  hasSecureMiddlewareResponse: (response: any) => {
    if (!response.headers) {
      return ['No headers set'];
    }

    const errors: string[] = [];

    // Check for security headers
    if (!response.headers.get('X-Content-Type-Options')) {
      errors.push('Missing X-Content-Type-Options header');
    }

    return errors.length === 0 ? null : errors;
  },
};
