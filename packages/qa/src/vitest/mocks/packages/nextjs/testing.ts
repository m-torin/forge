// Next.js Experimental Testing Utilities mocks
import { vi } from 'vitest';

// Mock next/experimental/testing/server utilities
vi.mock('next/experimental/testing/server', () => ({
  unstable_doesMiddlewareMatch: mockDoesMiddlewareMatch,
  unstable_getResponseFromNextConfig: mockGetResponseFromNextConfig,
  isRewrite: mockIsRewrite,
  getRewrittenUrl: mockGetRewrittenUrl,
  getRedirectUrl: mockGetRedirectUrl,
  isRedirect: mockIsRedirect,
}));

// Mock middleware matching function
export const mockDoesMiddlewareMatch = vi.fn(
  ({ config, nextConfig, url, headers, cookies }: any) => {
    // Simple matching logic for testing
    if (!config.matcher) return true;

    const matchers = Array.isArray(config.matcher) ? config.matcher : [config.matcher];

    return matchers.some((matcher: any) => {
      if (typeof matcher === 'string') {
        return url.includes(matcher.replace('*', ''));
      }

      if (typeof matcher === 'object') {
        // Check source pattern
        if (matcher.source) {
          const pattern = matcher.source.replace(/:\w+/g, '[^/]+').replace(/\*/g, '.*');
          // eslint-disable-next-line security/detect-non-literal-regexp
          const regex = new RegExp(pattern);
          // eslint-disable-next-line vitest/no-conditional-tests
          if (!regex.test(url)) return false;
        }

        // Check has conditions
        if (matcher.has) {
          return matcher.has.every((condition: any) => {
            if (condition.type === 'header') {
              return headers && headers[condition.key] === condition.value;
            }
            if (condition.type === 'cookie') {
              return cookies && cookies[condition.key] === condition.value;
            }
            return true;
          });
        }

        // Check missing conditions
        if (matcher.missing) {
          return matcher.missing.every((condition: any) => {
            if (condition.type === 'header') {
              return !headers || headers[condition.key] !== condition.value;
            }
            if (condition.type === 'cookie') {
              return !cookies || cookies[condition.key] !== condition.value;
            }
            return true;
          });
        }

        return true;
      }

      return false;
    });
  },
);

// Mock response from next config
export const mockGetResponseFromNextConfig = vi.fn(
  async ({ url, nextConfig, headers, cookies }: any) => {
    const mockResponse = {
      status: 200,
      headers: new Headers(),
      body: null,
      ok: true,
      redirected: false,
      statusText: 'OK',
      url,
      type: 'basic' as ResponseType,
      clone: vi.fn(),
      arrayBuffer: vi.fn(),
      blob: vi.fn(),
      formData: vi.fn(),
      json: vi.fn(),
      text: vi.fn(),
    };

    // Process redirects if configured
    if (nextConfig.redirects) {
      const redirects = await nextConfig.redirects();

      for (const redirect of redirects) {
        const pattern = redirect.source.replace(/:\w+/g, '[^/]+').replace(/\*/g, '.*');
        // eslint-disable-next-line security/detect-non-literal-regexp
        const regex = new RegExp(pattern);

        if (regex.test(url)) {
          mockResponse.status = redirect.permanent ? 308 : 307;
          mockResponse.headers.set('Location', redirect.destination);
          break;
        }
      }
    }

    // Process rewrites if configured
    if (nextConfig.rewrites) {
      const rewrites = await nextConfig.rewrites();

      if (Array.isArray(rewrites)) {
        for (const rewrite of rewrites) {
          const pattern = rewrite.source.replace(/:\w+/g, '[^/]+').replace(/\*/g, '.*');
          // eslint-disable-next-line security/detect-non-literal-regexp
          const regex = new RegExp(pattern);

          if (regex.test(url)) {
            mockResponse.headers.set('x-middleware-rewrite', rewrite.destination);
            break;
          }
        }
      }
    }

    return mockResponse;
  },
);

// Mock rewrite checking
export const mockIsRewrite = vi.fn((response: any) => {
  return response.headers && response.headers.get('x-middleware-rewrite') !== null;
});

// Mock redirect checking
export const mockIsRedirect = vi.fn((response: any) => {
  return response.status >= 300 && response.status < 400;
});

// Mock get rewritten URL
export const mockGetRewrittenUrl = vi.fn((response: any) => {
  return response.headers ? response.headers.get('x-middleware-rewrite') : null;
});

// Mock get redirect URL
export const mockGetRedirectUrl = vi.fn((response: any) => {
  return response.headers ? response.headers.get('Location') : null;
});

// Mock testing utilities
const mockTestingUtils = {
  createMockMiddlewareConfig: (overrides: any = {}) => ({
    matcher: [
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        missing: [
          { type: 'header', key: 'next-router-prefetch' },
          { type: 'header', key: 'purpose', value: 'prefetch' },
        ],
      },
    ],
    ...overrides,
  }),

  createMockNextConfig: (overrides: any = {}) => ({
    async redirects() {
      return [
        {
          source: '/old-path',
          destination: '/new-path',
          permanent: false,
        },
      ];
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://api.example.com/:path*',
        },
      ];
    },
    ...overrides,
  }),

  createMockHeaders: (overrides: any = {}) => ({
    'user-agent': 'Mozilla/5.0 (Test)',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    ...overrides,
  }),

  createMockCookies: (overrides: any = {}) => ({
    session: 'abc123',
    theme: 'dark',
    ...overrides,
  }),
};

// Mock middleware execution testing
const mockMiddlewareExecution = {
  simulateRequest: vi.fn(async (middleware: Function, request: any) => {
    // Simulate middleware execution
    return await middleware(request);
  }),

  testMiddlewareChain: vi.fn(async (middlewares: Function[], request: any) => {
    let response = request;

    for (const middleware of middlewares) {
      response = await middleware(response);
    }

    return response;
  }),

  mockMiddlewareContext: vi.fn(() => ({
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  })),
};

// Mock performance testing
const mockPerformanceTesting = {
  measureMiddlewarePerformance: vi.fn(async (middleware: Function, request: any) => {
    const start = performance.now();
    const result = await middleware(request);
    const duration = performance.now() - start;

    return {
      result,
      duration,
      memory: {
        used: Math.random() * 1000000,
        total: 1000000,
      },
    };
  }),

  benchmarkMiddleware: vi.fn(async (middleware: Function, requests: any[]) => {
    const results = [];

    for (const request of requests) {
      const result = await mockPerformanceTesting.measureMiddlewarePerformance(middleware, request);
      results.push(result);
    }

    return {
      results,
      average: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      min: Math.min(...results.map(r => r.duration)),
      max: Math.max(...results.map(r => r.duration)),
    };
  }),
};

// Mock security testing
const mockSecurityTesting = {
  testCSRFProtection: vi.fn((middleware: Function, request: any) => {
    // Simulate CSRF token validation
    const token = request.headers['x-csrf-token'];
    return token && token.startsWith('csrf-');
  }),

  testRateLimiting: vi.fn((middleware: Function, requests: any[]) => {
    // Simulate rate limiting
    const limit = 10;
    return requests.length <= limit;
  }),

  testCORSHeaders: vi.fn((response: any) => {
    const headers = response.headers;
    return {
      hasOrigin: headers.has('Access-Control-Allow-Origin'),
      hasMethods: headers.has('Access-Control-Allow-Methods'),
      hasHeaders: headers.has('Access-Control-Allow-Headers'),
    };
  }),
};

// Mock error testing
const mockErrorTesting = {
  simulateMiddlewareError: vi.fn((error: Error) => {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      digest: `middleware-error-${Math.random().toString(36).substring(2, 15)}`,
    };
  }),

  testErrorBoundary: vi.fn(async (middleware: Function, request: any) => {
    try {
      return await middleware(request);
    } catch (error) {
      return mockErrorTesting.simulateMiddlewareError(error as Error);
    }
  }),

  mockErrorResponse: vi.fn((status: number, message: string) => ({
    status,
    statusText: message,
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ error: message }),
  })),
};

// Mock integration testing
const mockIntegrationTesting = {
  testFullPipeline: vi.fn(async (config: any, request: any) => {
    // Test the full middleware → next.config → response pipeline
    const middlewareMatches = mockDoesMiddlewareMatch({
      config: config.middleware,
      nextConfig: config.nextConfig,
      url: request.url,
      headers: request.headers,
      cookies: request.cookies,
    });

    if (!middlewareMatches) {
      return request;
    }

    const response = await mockGetResponseFromNextConfig({
      url: request.url,
      nextConfig: config.nextConfig,
      headers: request.headers,
      cookies: request.cookies,
    });

    return response;
  }),

  testE2EFlow: vi.fn(async (flows: any[]) => {
    const results = [];

    for (const flow of flows) {
      const result = await mockIntegrationTesting.testFullPipeline(flow.config, flow.request);
      results.push({
        flow: flow.name,
        request: flow.request,
        response: result,
        assertions: flow.assertions,
      });
    }

    return results;
  }),
};

// Testing utilities export
export const testingUtils = {
  // Config helpers
  createMockMiddlewareConfig: mockTestingUtils.createMockMiddlewareConfig,
  createMockNextConfig: mockTestingUtils.createMockNextConfig,
  createMockHeaders: mockTestingUtils.createMockHeaders,
  createMockCookies: mockTestingUtils.createMockCookies,

  // Test execution
  simulateMiddlewareExecution: mockMiddlewareExecution.simulateRequest,
  measurePerformance: mockPerformanceTesting.measureMiddlewarePerformance,
  testSecurity: mockSecurityTesting,
  testErrors: mockErrorTesting,
  testIntegration: mockIntegrationTesting,

  // Assertions
  expectMiddlewareMatch: (config: any, url: string, shouldMatch: boolean) => {
    const matches = mockDoesMiddlewareMatch({ config, url });
    expect(matches).toBe(shouldMatch);
  },

  expectRedirect: (response: any, expectedUrl: string) => {
    expect(mockIsRedirect(response)).toBeTruthy();
    expect(mockGetRedirectUrl(response)).toBe(expectedUrl);
  },

  expectRewrite: (response: any, expectedUrl: string) => {
    expect(mockIsRewrite(response)).toBeTruthy();
    expect(mockGetRewrittenUrl(response)).toBe(expectedUrl);
  },

  expectNoRedirectOrRewrite: (response: any) => {
    expect(mockIsRedirect(response)).toBeFalsy();
    expect(mockIsRewrite(response)).toBeFalsy();
  },
};
