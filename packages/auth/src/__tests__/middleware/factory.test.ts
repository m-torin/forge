/**
 * Middleware factory tests
 */

import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createAdvancedMiddleware,
  createCombinedMiddleware,
  createSmartMiddleware,
} from '../../middleware/factory';

import type { AuthConfig } from '../../shared/types';

// Mock the middleware modules
const mockCreateApiMiddleware = vi.fn();
const mockCreateWebMiddleware = vi.fn();
const mockCreateNodeMiddleware = vi.fn();

vi.mock('../api', () => ({
  createApiMiddleware: mockCreateApiMiddleware,
}));

vi.mock('../web', () => ({
  createWebMiddleware: mockCreateWebMiddleware,
}));

vi.mock('../node', () => ({
  createNodeMiddleware: mockCreateNodeMiddleware,
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      body: JSON.stringify(data),
      headers: new Map(),
      status: init?.status || 200,
    })),
    next: vi.fn(() => ({ headers: new Map() })),
  },
}));

describe('Middleware Factory', () => {
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
    console.log = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    process.env = originalEnv;
  });

  describe('createAdvancedMiddleware', () => {
    it('should create middleware with default configuration', () => {
      const middleware = createAdvancedMiddleware(mockAuthConfig);

      expect(middleware).toBeInstanceOf(Function);
      expect(mockCreateWebMiddleware).toHaveBeenCalledTimes(1);
    });

    it('should create API middleware when API keys are enabled', () => {
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

    it('should create Node middleware when runtime is nodejs', () => {
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

    it('should handle API routes correctly', async () => {
      const middleware = createAdvancedMiddleware(mockAuthConfig);
      const request = new NextRequest('http://localhost:3000/api/test');

      await middleware(request);

      expect(mockCreateApiMiddleware).toHaveBeenCalledTimes(1);
    });

    it('should handle web routes correctly', async () => {
      const middleware = createAdvancedMiddleware(mockAuthConfig);
      const request = new NextRequest('http://localhost:3000/dashboard');

      await middleware(request);

      expect(mockCreateWebMiddleware).toHaveBeenCalledTimes(1);
    });

    it('should add custom headers when specified', async () => {
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

    it('should add metrics headers when enabled', async () => {
      const middleware = createAdvancedMiddleware(mockAuthConfig, {
        enableMetrics: true,
      });

      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);

      expect(response.headers.set).toHaveBeenCalledWith('x-auth-duration', expect.any(String));
      expect(response.headers.set).toHaveBeenCalledWith('x-auth-middleware', 'web');
      expect(response.headers.set).toHaveBeenCalledWith('x-auth-timestamp', expect.any(String));
    });

    it('should add feature flags in development mode', async () => {
      process.env.NODE_ENV = 'development';

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

    it('should handle audit logging when enabled', async () => {
      process.env.NODE_ENV = 'development';

      const middleware = createAdvancedMiddleware(mockAuthConfig, {
        enableAuditLog: true,
      });

      const request = new NextRequest('http://localhost:3000/dashboard');
      await middleware(request);

      expect(console.log).toHaveBeenCalledWith(
        'Auth middleware audit:',
        expect.objectContaining({
          middleware: 'web',
          path: '/dashboard',
          timestamp: expect.any(String),
        }),
      );
    });

    it('should handle middleware errors gracefully', async () => {
      mockCreateWebMiddleware.mockReturnValue(() => {
        throw new Error('Test middleware error');
      });

      const middleware = createAdvancedMiddleware(mockAuthConfig);
      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await middleware(request);

      expect(console.error).toHaveBeenCalledWith('Advanced middleware error:', expect.any(Error));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Middleware Error',
          message: 'An error occurred in authentication middleware',
        }),
        { status: 500 },
      );
    });

    it('should disable API middleware when feature is disabled', () => {
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

    it('should conditionally disable features', () => {
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
    it('should create combined middleware with default options', () => {
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

    it('should route API requests to API middleware', async () => {
      const middleware = createCombinedMiddleware();
      const request = new NextRequest('http://localhost:3000/api/test');

      await middleware(request);

      const apiMiddlewareInstance = mockCreateApiMiddleware.mock.results[0].value;
      expect(apiMiddlewareInstance).toHaveBeenCalledWith(request);
    });

    it('should route web requests to web middleware', async () => {
      const middleware = createCombinedMiddleware();
      const request = new NextRequest('http://localhost:3000/dashboard');

      await middleware(request);

      const webMiddlewareInstance = mockCreateWebMiddleware.mock.results[0].value;
      expect(webMiddlewareInstance).toHaveBeenCalledWith(request);
    });

    it('should accept custom public routes', () => {
      const middleware = createCombinedMiddleware({
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
    it('should detect nodejs runtime automatically', () => {
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

    it('should use edge runtime when Node.js is not detected', () => {
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

    it('should respect explicit runtime setting', () => {
      const middleware = createSmartMiddleware(mockAuthConfig, { runtime: 'edge' });

      expect(middleware).toBeInstanceOf(Function);
      // Should not create Node middleware when explicitly set to edge
      expect(mockCreateNodeMiddleware).not.toHaveBeenCalled();
    });

    it('should configure conditional features based on config', () => {
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
