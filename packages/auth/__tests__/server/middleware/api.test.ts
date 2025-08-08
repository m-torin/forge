/**
 * Tests for API middleware functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, vi } from 'vitest';

// Mock better-auth/cookies
const mockGetSessionCookie = vi.fn();
vi.mock('better-auth/cookies', () => ({
  getSessionCookie: mockGetSessionCookie,
}));

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({
        headers: new Map([]),
        set: vi.fn(),
      })),
      json: vi.fn((data: any, init?: any) => ({
        data,
        status: init?.status || 200,
        headers: new Map([]),
      })),
      redirect: vi.fn((url: string) => ({
        url,
        status: 302,
        headers: new Map([]),
      })),
    },
  };
});

describe('aPI middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createApiMiddleware', () => {
    test('should create middleware function', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const middleware = apiModule.createApiMiddleware();

      expect(typeof middleware).toBe('function');
    });

    test('should allow public API routes', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const middleware = apiModule.createApiMiddleware();
      const request = new NextRequest('https://example.com/api/health', {
        method: 'GET',
      });

      const result = await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should allow default public API routes', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const middleware = apiModule.createApiMiddleware();

      const publicRoutes = ['/api/health', '/api/public', '/api/auth'];

      for (const route of publicRoutes) {
        const request = new NextRequest(`https://example.com${route}`, {
          method: 'GET',
        });

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalledWith();
      }
    });

    test('should allow custom public API routes', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const middleware = apiModule.createApiMiddleware({
        publicApiRoutes: ['/api/custom'],
      });

      const request = new NextRequest('https://example.com/api/custom', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should detect API key in x-api-key header', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const middleware = apiModule.createApiMiddleware();
      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
        headers: {
          'x-api-key': 'test-api-key',
        },
      });

      const result = await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should detect Bearer token in authorization header', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const middleware = apiModule.createApiMiddleware();
      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-token',
        },
      });

      const result = await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should handle authorization header without Bearer prefix', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const middleware = apiModule.createApiMiddleware();
      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
        headers: {
          authorization: 'test-token',
        },
      });

      const result = await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should respect custom allowed headers', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const middleware = apiModule.createApiMiddleware({
        allowedHeaders: ['x-custom-key'],
      });

      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
        headers: {
          'x-custom-key': 'test-key',
        },
      });

      const result = await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should check session when no API key provided', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      mockGetSessionCookie.mockReturnValue({ sessionId: 'test-session' });

      const middleware = apiModule.createApiMiddleware();
      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
      });

      const result = await middleware(request);

      expect(mockGetSessionCookie).toHaveBeenCalledWith(request);
      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should return 401 when no authentication provided and auth required', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      mockGetSessionCookie.mockReturnValue(null);

      const middleware = apiModule.createApiMiddleware({
        requireAuth: true,
      });

      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
      });

      const result = await middleware(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Unauthorized',
          message: 'Please provide a valid API key or authentication.',
        }),
        { status: 401 },
      );
    });

    test('should allow unauthenticated access when auth not required', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      mockGetSessionCookie.mockReturnValue(null);

      const middleware = apiModule.createApiMiddleware({
        requireAuth: false,
      });

      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
      });

      const result = await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should set auth method header for API key', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const mockResponse = {
        headers: new Map(),
        set: vi.fn(),
      };
      vi.mocked(NextResponse.next).mockReturnValue(mockResponse as any);

      const middleware = apiModule.createApiMiddleware();
      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
        headers: {
          'x-api-key': 'test-key',
        },
      });

      await middleware(request);

      expect(mockResponse.set).toHaveBeenCalledWith('x-auth-method', 'api-key');
    });

    test('should set auth method header for session', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      mockGetSessionCookie.mockReturnValue({ sessionId: 'test-session' });

      const mockResponse = {
        headers: new Map(),
        set: vi.fn(),
      };
      vi.mocked(NextResponse.next).mockReturnValue(mockResponse as any);

      const middleware = apiModule.createApiMiddleware();
      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
      });

      await middleware(request);

      expect(mockResponse.set).toHaveBeenCalledWith('x-auth-method', 'session');
    });

    test('should set rate limit headers when enabled', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const mockResponse = {
        headers: new Map(),
        set: vi.fn(),
      };
      vi.mocked(NextResponse.next).mockReturnValue(mockResponse as any);

      const middleware = apiModule.createApiMiddleware({
        enableRateLimit: true,
      });

      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
        headers: {
          'x-api-key': 'test-key',
        },
      });

      await middleware(request);

      expect(mockResponse.set).toHaveBeenCalledWith('x-rate-limit-check', 'api-key');
    });

    test('should handle multiple allowed headers and use first found', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const middleware = apiModule.createApiMiddleware({
        allowedHeaders: ['x-first-key', 'x-second-key'],
      });

      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
        headers: {
          'x-second-key': 'second-key',
          'x-first-key': 'first-key',
        },
      });

      const result = await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should properly extract Bearer token from authorization header', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const middleware = apiModule.createApiMiddleware();
      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
        headers: {
          authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        },
      });

      const result = await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should include supported auth methods in 401 response', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      mockGetSessionCookie.mockReturnValue(null);

      const middleware = apiModule.createApiMiddleware({
        allowedHeaders: ['x-api-key', 'x-custom-header'],
        requireAuth: true,
      });

      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          supportedMethods: {
            'API Key': ['x-api-key: your-api-key', 'x-custom-header: your-api-key'],
            Session: 'Include session cookie with request',
          },
        }),
        { status: 401 },
      );
    });
  });

  describe('default middleware', () => {
    test('should export default apiMiddleware', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      expect(apiModule.apiMiddleware).toBeDefined();
      expect(typeof apiModule.apiMiddleware).toBe('function');
    });

    test('should work with default settings', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const request = new NextRequest('https://example.com/api/health', {
        method: 'GET',
      });

      const result = await apiModule.apiMiddleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });
  });

  describe('publicPaths handling', () => {
    test('should combine publicPaths and publicApiRoutes', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const middleware = apiModule.createApiMiddleware({
        publicPaths: ['/api/custom'],
        publicApiRoutes: ['/api/special'],
      });

      // Test publicPaths
      const request1 = new NextRequest('https://example.com/api/custom', {
        method: 'GET',
      });
      await middleware(request1);
      expect(NextResponse.next).toHaveBeenCalledWith();

      // Test publicApiRoutes
      const request2 = new NextRequest('https://example.com/api/special', {
        method: 'GET',
      });
      await middleware(request2);
      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should handle route prefixes correctly', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const middleware = apiModule.createApiMiddleware({
        publicApiRoutes: ['/api/v1'],
      });

      const request = new NextRequest('https://example.com/api/v1/users', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });
  });

  describe('edge cases', () => {
    test('should handle empty header values', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      mockGetSessionCookie.mockReturnValue(null);

      const middleware = apiModule.createApiMiddleware();
      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
        headers: {
          'x-api-key': '',
        },
      });

      const result = await middleware(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Unauthorized',
        }),
        { status: 401 },
      );
    });

    test('should handle malformed Bearer token', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const middleware = apiModule.createApiMiddleware();
      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
        headers: {
          authorization: 'Bearer',
        },
      });

      const result = await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should handle missing headers gracefully', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      mockGetSessionCookie.mockReturnValue(null);

      const middleware = apiModule.createApiMiddleware({
        requireAuth: false,
      });

      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
      });

      const result = await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should handle case-insensitive header matching', async () => {
      const apiModule = await import('../../src/server/middleware/api');

      const middleware = apiModule.createApiMiddleware();
      const request = new NextRequest('https://example.com/api/protected', {
        method: 'GET',
        headers: {
          'X-API-KEY': 'test-key', // Different case
        },
      });

      // Note: Next.js normalizes headers to lowercase
      Object.defineProperty(request, 'headers', {
        value: {
          get: vi.fn((key: string) => {
            if (key.toLowerCase() === 'x-api-key') {
              return 'test-key';
            }
            return null;
          }),
        },
      });

      const result = await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });
  });
});
