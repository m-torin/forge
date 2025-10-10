// Next.js Server APIs mocks
import { vi } from 'vitest';
import { createMockCookies } from './shared';

// Next.js Server (NextRequest, NextResponse, Route Handlers)
vi.mock('next/server', () => {
  // Mock NextRequest
  const createMockNextRequest = (url: string = 'http://localhost:3000', init: any = {}) => {
    const request = new Request(url, init);

    return {
      ...request,
      nextUrl: {
        pathname: new URL(url).pathname,
        search: new URL(url).search,
        searchParams: new URL(url).searchParams,
        origin: new URL(url).origin,
        href: url,
        host: new URL(url).host,
        hostname: new URL(url).hostname,
        port: new URL(url).port,
        protocol: new URL(url).protocol,
        basePath: '',
        locale: 'en',
        clone: vi.fn(() => createMockNextRequest(url, init)),
      },
      cookies: createMockCookies(),
      geo: {
        country: 'US',
        region: 'CA',
        city: 'San Francisco',
        latitude: '37.7749',
        longitude: '-122.4194',
      },
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Test)',
    };
  };

  // Mock NextResponse
  const createMockNextResponse = () => ({
    ...Response,
    next: vi.fn(() => new Response()),
    redirect: vi.fn((url: string, status: number = 302) => {
      return new Response(null, {
        status,
        headers: { Location: url },
      });
    }),
    rewrite: vi.fn((url: string) => {
      return new Response(null, {
        headers: { 'x-middleware-rewrite': url },
      });
    }),
    json: vi.fn((data: any, init?: ResponseInit) => {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init?.headers,
        },
      });
    }),
    cookies: createMockCookies(),
  });

  return {
    NextRequest: vi.fn((url: string, init?: any) => createMockNextRequest(url, init)),
    NextResponse: createMockNextResponse(),
    connection: vi.fn(() => Promise.resolve()),
    userAgent: vi.fn(() => ({
      isBot: false,
      ua: 'Mozilla/5.0 (Test)',
      browser: {
        name: 'Chrome',
        version: '91.0.4472.124',
      },
      device: {
        model: undefined,
        type: undefined,
        vendor: undefined,
      },
      engine: {
        name: 'Blink',
        version: '91.0.4472.124',
      },
      os: {
        name: 'macOS',
        version: '10.15.7',
      },
      cpu: {
        architecture: 'amd64',
      },
    })),
  };
});

// Mock draftMode function
vi.mock('next/headers', async importOriginal => {
  const actual = (await importOriginal()) as any;

  const mockDraftMode = vi.fn(() => ({
    isEnabled: false,
    enable: vi.fn(),
    disable: vi.fn(),
  }));

  return {
    ...actual,
    draftMode: mockDraftMode,
  };
});

// Mock connection function
export const mockConnection = vi.fn(async () => ({
  ip: '127.0.0.1',
  userAgent: 'Mozilla/5.0 (Test)',
  geo: {
    country: 'US',
    region: 'CA',
    city: 'San Francisco',
    latitude: '37.7749',
    longitude: '-122.4194',
  },
}));

// Mock after function for cleanup
export const mockAfter = vi.fn((callback: () => void | Promise<void>) => {
  // Store the callback for later execution
  (global as any).__afterCallbacks = (global as any).__afterCallbacks || [];
  (global as any).__afterCallbacks.push(callback);
});

// Mock unauthorized function
export const mockUnauthorized = vi.fn(() => {
  throw new Error('NEXT_UNAUTHORIZED');
});

// Mock forbidden function
export const mockForbidden = vi.fn(() => {
  throw new Error('NEXT_FORBIDDEN');
});

// Export additional server functions for testing
// Mock server-side utilities
export const mockServerUtils = {
  executeAfterCallbacks: vi.fn(async () => {
    const callbacks = (global as any).__afterCallbacks || [];
    for (const callback of callbacks) {
      await callback();
    }
    (global as any).__afterCallbacks = [];
  }),

  clearAfterCallbacks: vi.fn(() => {
    (global as any).__afterCallbacks = [];
  }),

  simulateServerError: vi.fn((type: 'unauthorized' | 'forbidden') => {
    if (type === 'unauthorized') {
      mockUnauthorized();
    } else if (type === 'forbidden') {
      mockForbidden();
    }
  }),
};

// Mock server context
export const mockServerContext = {
  isServer: true,
  isDev: process.env.NODE_ENV === 'development',
  isEdgeRuntime: false,

  createContext: vi.fn(() => ({
    req: {
      url: 'http://localhost:3000',
      method: 'GET',
      headers: {},
      cookies: {},
    },
    res: {
      status: 200,
      headers: {},
      cookies: {},
    },
  })),
};

// Mock server performance
export const mockServerPerformance = {
  measureRequestTime: vi.fn(() => ({
    start: () => performance.now(),
    end: (startTime: number) => performance.now() - startTime,
  })),

  trackMemoryUsage: vi.fn(() => ({
    used: Math.random() * 1000000,
    total: 1000000,
  })),

  logMetrics: vi.fn((metrics: any) => {
    console.log('[Server Metrics]', metrics);
  }),
};

// Mock server security
export const mockServerSecurity = {
  validateOrigin: vi.fn((origin: string) => {
    const allowedOrigins = ['http://localhost:3000', 'https://example.com'];
    return allowedOrigins.includes(origin);
  }),

  sanitizeHeaders: vi.fn((headers: Record<string, string>) => {
    const sanitized = { ...headers };
    delete sanitized['x-forwarded-for'];
    delete sanitized['x-real-ip'];
    return sanitized;
  }),

  generateNonce: vi.fn(() => {
    return `nonce-${Math.random().toString(36).substring(2, 15)}`;
  }),

  validateCSP: vi.fn((csp: string) => {
    return csp.includes('default-src') || csp.includes('script-src');
  }),
};

// Mock server testing utilities
export const serverTestUtils = {
  createMockRequest: (url: string = 'http://localhost:3000', options: any = {}) => {
    return {
      url,
      method: options.method || 'GET',
      headers: options.headers || {},
      cookies: options.cookies || {},
      body: options.body,
      json: vi.fn().mockResolvedValue(options.body),
      text: vi.fn().mockResolvedValue(JSON.stringify(options.body)),
      formData: vi.fn().mockResolvedValue(new FormData()),
      ...options,
    };
  },

  createMockResponse: (options: any = {}) => {
    return {
      status: options.status || 200,
      headers: options.headers || {},
      cookies: options.cookies || {},
      body: options.body,
      json: vi.fn((data: any) => ({ ...options, body: data })),
      text: vi.fn((data: string) => ({ ...options, body: data })),
      redirect: vi.fn((url: string, status: number = 302) => ({
        ...options,
        status,
        headers: { ...options.headers, Location: url },
      })),
      ...options,
    };
  },

  simulateServerSideExecution: vi.fn(async (fn: Function, context: any = {}) => {
    const originalContext = mockServerContext;
    Object.assign(mockServerContext, context);

    try {
      return await fn();
    } finally {
      Object.assign(mockServerContext, originalContext);
    }
  }),

  expectServerFunctionCalled: (fn: any, expectedArgs?: any[]) => {
    expect(fn).toHaveBeenCalledWith();
    if (expectedArgs) {
      expect(fn).toHaveBeenCalledWith(...expectedArgs);
    }
  },
};
