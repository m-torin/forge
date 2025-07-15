/**
 * Middleware factory tests
 */

import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createAdvancedMiddleware,
  createCombinedMiddleware,
  createSmartMiddleware,
} from '../../src/server/middleware/factory';

import type { AuthConfig } from '../../src/shared/types';

// Mock the middleware modules using vi.hoisted
const { mockCreateApiMiddleware, mockCreateNodeMiddleware, mockCreateWebMiddleware } = vi.hoisted(
  () => {
    const mockCreateApiMiddleware = vi.fn();
    const mockCreateWebMiddleware = vi.fn();
    const mockCreateNodeMiddleware = vi.fn();

    return {
      mockCreateApiMiddleware,
      mockCreateNodeMiddleware,
      mockCreateWebMiddleware,
    };
  },
);

vi.mock('../../src/server/middleware/api', () => ({
  createApiMiddleware: mockCreateApiMiddleware,
}));

vi.mock('../../src/server/middleware/web', () => ({
  createWebMiddleware: mockCreateWebMiddleware,
}));

vi.mock('../../src/server/middleware/node', () => ({
  createNodeMiddleware: mockCreateNodeMiddleware,
}));

vi.mock('@repo/observability/server/next', () => ({
  logInfo: vi.fn((message: string, ...args: any[]) => console.info(message, ...args)),
  logError: vi.fn((message: string, ...args: any[]) => console.error(message, ...args)),
  logWarn: vi.fn(),
  logDebug: vi.fn(),
}));

vi.mock('next/server', async importOriginal => {
  const actual = (await importOriginal()) as any;

  // Create a proper NextRequest class
  class MockNextRequest {
    url: string;
    headers: Headers;
    method: string;
    nextUrl: {
      pathname: string;
      searchParams: URLSearchParams;
      href: string;
      origin: string;
      protocol: string;
      username: string;
      password: string;
      host: string;
      hostname: string;
      port: string;
      search: string;
      hash: string;
    };

    constructor(url: string | URL, init?: RequestInit) {
      const urlObj = new URL(url);
      this.url = urlObj.toString();
      this.headers = new Headers(init?.headers || {});
      this.method = init?.method || 'GET';

      // Create a separate object for nextUrl to avoid readonly property issues
      this.nextUrl = {
        pathname: urlObj.pathname,
        searchParams: urlObj.searchParams,
        href: urlObj.href,
        origin: urlObj.origin,
        protocol: urlObj.protocol,
        username: urlObj.username,
        password: urlObj.password,
        host: urlObj.host,
        hostname: urlObj.hostname,
        port: urlObj.port,
        search: urlObj.search,
        hash: urlObj.hash,
      };
    }
  }

  return {
    ...actual,
    NextRequest: MockNextRequest,
    NextResponse: {
      json: vi.fn((data, init) => {
        const headers = new Map();
        const setSpy = vi.spyOn(headers, 'set');
        setSpy.mockImplementation(() => headers);
        return {
          body: JSON.stringify(data),
          headers,
          status: init?.status || 200,
        };
      }),
      next: vi.fn(() => {
        const headers = new Map();
        const setSpy = vi.spyOn(headers, 'set');
        setSpy.mockImplementation(() => headers);
        return { headers };
      }),
    },
  };
});

describe('middleware Factory', () => {
  const mockAuthConfig: AuthConfig = {
    middleware: {
      enableApiMiddleware: true,
      enableNodeMiddleware: true,
      enableWebMiddleware: true,
      publicPaths: ['/sign-in', '/sign-up'],
      redirectTo: '/sign-in',
      requireAuthentication: false,
    },
    providers: {},
    apiKeys: {
      defaultPermissions: ['read'],
      enableServiceAuth: true,
      expirationDays: 90,
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 100,
      },
    },
    appUrl: 'http://localhost:3000',
    databaseUrl: 'postgresql://localhost:5432/test',
    features: {
      advancedMiddleware: true,
      admin: true,
      apiKeys: true,
      impersonation: true,
      magicLink: true,
      organizationInvitations: true,
      organizations: true,
      passkeys: true,
      serviceToService: true,
      sessionCaching: true,
      teams: true,
      twoFactor: true,
    },
    secret: 'test-secret',
    teams: {
      defaultPermissions: ['read'],
      enableInvitations: true,
      maxTeamsPerOrganization: 10,
    },
  };

  const originalConsole = console;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default middleware mocks
    const mockApiMiddlewareInstance = vi.fn().mockResolvedValue(NextResponse.next());
    const mockWebMiddlewareInstance = vi.fn().mockResolvedValue(NextResponse.next());
    const mockNodeMiddlewareInstance = vi.fn().mockResolvedValue(NextResponse.next());

    mockCreateApiMiddleware.mockReturnValue(mockApiMiddlewareInstance);
    mockCreateWebMiddleware.mockReturnValue(mockWebMiddlewareInstance);
    mockCreateNodeMiddleware.mockReturnValue(mockNodeMiddlewareInstance);

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.info = originalConsole.info;
    process.env = originalEnv;
  });

  describe('createAdvancedMiddleware', () => {
    test('should create middleware with default configuration', () => {
      const middleware = createAdvancedMiddleware(mockAuthConfig);

      expect(middleware).toBeInstanceOf(Function);
      expect(mockCreateWebMiddleware).toHaveBeenCalledTimes(1);
    });

    test('should create API middleware when API keys are enabled', () => {
      const middleware = createAdvancedMiddleware(mockAuthConfig, {
        apiRoutes: {
          options: { allowedHeaders: ['x-custom-key'] },
          paths: ['/api/test'],
        },
      });

      expect(middleware).toBeInstanceOf(Function);
      expect(mockCreateApiMiddleware).toHaveBeenCalledTimes(1);
      expect(mockCreateApiMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          allowedHeaders: ['x-custom-key'],
        }),
      );
    });

    test('should create Node middleware when runtime is nodejs', () => {
      const middleware = createAdvancedMiddleware(mockAuthConfig, {
        runtime: 'nodejs',
      });

      expect(middleware).toBeInstanceOf(Function);
      expect(mockCreateNodeMiddleware).toHaveBeenCalledTimes(1);
      expect(mockCreateNodeMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          enableSessionCache: true,
        }),
      );
    });

    test('should handle API routes correctly', async () => {
      const middleware = createAdvancedMiddleware(mockAuthConfig);
      const request = new NextRequest('http://localhost:3000/api/test');

      await middleware(request);

      expect(mockCreateApiMiddleware).toHaveBeenCalledTimes(1);
    });

    test('should handle web routes correctly', async () => {
      const middleware = createAdvancedMiddleware(mockAuthConfig);
      const request = new NextRequest('http://localhost:3000/dashboard');

      await middleware(request);

      expect(mockCreateWebMiddleware).toHaveBeenCalledTimes(1);
    });

    test('should add custom headers when specified', async () => {
      const middleware = createAdvancedMiddleware(mockAuthConfig, {
        customHeaders: {
          'x-another-header': 'another-value',
          'x-custom-header': 'custom-value',
        },
      });

      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);

      expect(response.headers.set).toHaveBeenCalledWith('x-custom-header', 'custom-value');
      expect(response.headers.set).toHaveBeenCalledWith('x-another-header', 'another-value');
    });

    test('should add metrics headers when enabled', async () => {
      const middleware = createAdvancedMiddleware(mockAuthConfig, {
        enableMetrics: true,
      });

      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);

      expect(response.headers.set).toHaveBeenCalledWith('x-auth-duration', expect.any(String));
      expect(response.headers.set).toHaveBeenCalledWith('x-auth-middleware', 'web');
      expect(response.headers.set).toHaveBeenCalledWith('x-auth-timestamp', expect.any(String));
    });

    test('should add feature flags in development mode', async () => {
      (process.env as any).NODE_ENV = 'development';

      const middleware = createAdvancedMiddleware(mockAuthConfig);
      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);

      expect(response.headers.set).toHaveBeenCalledWith(
        'x-auth-features',
        JSON.stringify({
          apiKeys: true,
          impersonation: true,
          sessionCaching: true,
          teams: true,
        }),
      );
    });

    test('should handle audit logging when enabled', async () => {
      (process.env as any).NODE_ENV = 'development';

      const middleware = createAdvancedMiddleware(mockAuthConfig, {
        enableAuditLog: true,
      });

      const request = new NextRequest('http://localhost:3000/dashboard');
      await middleware(request);

      // Verify audit logging was called
      const infoCall = (console.info as any).mock.calls.find((call: any[]) =>
        call[0]?.includes('audit'),
      );
      expect(infoCall).toBeDefined();
    });

    test('should handle middleware errors gracefully', async () => {
      mockCreateWebMiddleware.mockReturnValue(() => {
        throw new Error('Test middleware error');
      });

      const middleware = createAdvancedMiddleware(mockAuthConfig);
      const request = new NextRequest('http://localhost:3000/dashboard');
      await middleware(request);

      expect(console.error).toHaveBeenCalledWith('Advanced middleware error:', expect.any(Error));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Middleware Error',
          message: 'An error occurred in authentication middleware',
        }),
        { status: 500 },
      );
    });

    test('should disable API middleware when feature is disabled', () => {
      const configWithoutApiKeys = {
        ...mockAuthConfig,
        features: {
          ...mockAuthConfig.features,
          apiKeys: false,
        },
      };

      const middleware = createAdvancedMiddleware(configWithoutApiKeys);

      expect(middleware).toBeInstanceOf(Function);
      expect(mockCreateApiMiddleware).not.toHaveBeenCalled();
    });

    test('should conditionally disable features', () => {
      const middleware = createAdvancedMiddleware(mockAuthConfig, {
        conditionalFeatures: {
          enableApiKeys: false,
        },
      });

      expect(middleware).toBeInstanceOf(Function);
      expect(mockCreateApiMiddleware).not.toHaveBeenCalled();
    });
  });

  describe('createCombinedMiddleware', () => {
    test('should create combined middleware with default options', () => {
      const middleware = createCombinedMiddleware();

      expect(middleware).toBeInstanceOf(Function);
      expect(mockCreateApiMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          allowedHeaders: ['x-api-key', 'authorization'],
          publicPaths: [],
        }),
      );
      expect(mockCreateWebMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          publicPaths: ['/sign-in', '/sign-up', '/_next', '/favicon.ico', '/.well-known'],
          redirectTo: '/sign-in',
        }),
      );
    });

    test('should route API requests to API middleware', async () => {
      const middleware = createCombinedMiddleware();
      const request = new NextRequest('http://localhost:3000/api/test');

      await middleware(request);

      const apiMiddlewareInstance = mockCreateApiMiddleware.mock.results[0].value;
      expect(apiMiddlewareInstance).toHaveBeenCalledWith(request);
    });

    test('should route web requests to web middleware', async () => {
      const middleware = createCombinedMiddleware();
      const request = new NextRequest('http://localhost:3000/dashboard');

      await middleware(request);

      const webMiddlewareInstance = mockCreateWebMiddleware.mock.results[0].value;
      expect(webMiddlewareInstance).toHaveBeenCalledWith(request);
    });

    test('should accept custom public routes', () => {
      createCombinedMiddleware({
        publicApiRoutes: ['/api/public'],
        publicWebRoutes: ['/custom-public'],
      });

      expect(mockCreateApiMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          publicPaths: ['/api/public'],
        }),
      );
      expect(mockCreateWebMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          publicPaths: ['/custom-public'],
        }),
      );
    });
  });

  describe('createSmartMiddleware', () => {
    test('should detect nodejs runtime automatically', () => {
      // Mock process.versions to simulate Node.js environment
      const originalVersions = process.versions;
      Object.defineProperty(process, 'versions', {
        configurable: true,
        value: { ...originalVersions, node: '18.0.0' },
      });

      const middleware = createSmartMiddleware(mockAuthConfig, { runtime: 'auto' });

      expect(middleware).toBeInstanceOf(Function);

      Object.defineProperty(process, 'versions', {
        configurable: true,
        value: originalVersions,
      });
    });

    test('should use edge runtime when Node.js is not detected', () => {
      // Mock process.versions to simulate edge environment
      const originalVersions = process.versions;
      Object.defineProperty(process, 'versions', {
        configurable: true,
        value: undefined,
      });

      const middleware = createSmartMiddleware(mockAuthConfig, { runtime: 'auto' });

      expect(middleware).toBeInstanceOf(Function);

      Object.defineProperty(process, 'versions', {
        configurable: true,
        value: originalVersions,
      });
    });

    test('should respect explicit runtime setting', () => {
      const middleware = createSmartMiddleware(mockAuthConfig, { runtime: 'edge' });

      expect(middleware).toBeInstanceOf(Function);
      // Should not create Node middleware when explicitly set to edge
      expect(mockCreateNodeMiddleware).not.toHaveBeenCalled();
    });

    test('should configure conditional features based on config', () => {
      const configWithLimitedFeatures = {
        ...mockAuthConfig,
        features: {
          ...mockAuthConfig.features,
          apiKeys: false,
          teams: false,
        },
      };

      const middleware = createSmartMiddleware(configWithLimitedFeatures);

      expect(middleware).toBeInstanceOf(Function);
      // Should not create API middleware when API keys are disabled
      expect(mockCreateApiMiddleware).not.toHaveBeenCalled();
    });
  });
});
