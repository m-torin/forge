/**
 * Tests for Node.js middleware functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, vi } from 'vitest';

// Mock observability
const mockLogError = vi.fn();
vi.mock('@repo/observability/server/next', () => ({
  logError: mockLogError,
}));

// Mock shared auth
const mockAuth = {
  api: {
    getSession: vi.fn(),
  },
};
vi.mock('#/shared/auth', () => ({
  auth: mockAuth,
}));

// Mock get-headers
const mockGetAuthHeaders = vi.fn();
vi.mock('#/server/get-headers', () => ({
  getAuthHeaders: mockGetAuthHeaders,
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
      redirect: vi.fn((url: string) => ({
        url,
        status: 302,
        headers: new Map([]),
      })),
    },
  };
});

describe('node.js middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthHeaders.mockResolvedValue({});
  });

  describe('createNodeMiddleware', () => {
    test('should create middleware function', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware();

      expect(typeof middleware).toBe('function');
    });

    test('should allow public routes', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware();

      const publicRoutes = [
        '/sign-in',
        '/sign-up',
        '/forgot-password',
        '/reset-password',
        '/api/auth',
        '/_next',
        '/favicon.ico',
        '/.well-known',
      ];

      for (const route of publicRoutes) {
        const request = new NextRequest(`https://example.com${route}`, {
          method: 'GET',
        });

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalledWith();
      }
    });

    test('should allow home page as public route', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware();
      const request = new NextRequest('https://example.com/', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should allow custom public paths', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware({
        publicPaths: ['/custom-public'],
      });

      const request = new NextRequest('https://example.com/custom-public', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should skip auth when requireAuth is false', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware({
        requireAuth: false,
      });

      const request = new NextRequest('https://example.com/protected', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
      expect(mockAuth.api.getSession).not.toHaveBeenCalled();
    });

    test('should check session for protected routes', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const mockSession = {
        user: { id: 'user-1' },
        session: { id: 'session-1' },
      };
      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const middleware = nodeModule.createNodeMiddleware();
      const request = new NextRequest('https://example.com/protected', {
        method: 'GET',
      });

      await middleware(request);

      expect(mockAuth.api.getSession).toHaveBeenCalledWith({
        headers: {},
      });
      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should redirect to sign-in when no session', async () => {
      const nodeModule = await import('#/server/middleware/node');

      mockAuth.api.getSession.mockResolvedValue(null);

      const middleware = nodeModule.createNodeMiddleware();
      const request = new NextRequest('https://example.com/protected', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/sign-in?callbackUrl=%2Fprotected'),
        }),
      );
    });

    test('should use custom redirect URL', async () => {
      const nodeModule = await import('#/server/middleware/node');

      mockAuth.api.getSession.mockResolvedValue(null);

      const middleware = nodeModule.createNodeMiddleware({
        redirectTo: '/auth/login',
      });

      const request = new NextRequest('https://example.com/protected', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/auth/login?callbackUrl=%2Fprotected'),
        }),
      );
    });

    test('should set session cache headers when enabled', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const mockSession = {
        user: { id: 'user-1' },
        session: { id: 'session-1', activeOrganizationId: 'org-1' },
      };
      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const mockResponse = {
        headers: new Map(),
        set: vi.fn(),
      };
      vi.mocked(NextResponse.next).mockReturnValue(mockResponse as any);

      const middleware = nodeModule.createNodeMiddleware({
        enableSessionCache: true,
      });

      const request = new NextRequest('https://example.com/protected', {
        method: 'GET',
      });

      await middleware(request);

      expect(mockResponse.set).toHaveBeenCalledWith('x-session-cached', 'true');
      expect(mockResponse.set).toHaveBeenCalledWith('x-user-id', 'user-1');
      expect(mockResponse.set).toHaveBeenCalledWith('x-organization-id', 'org-1');
    });

    test('should not set organization header when no active organization', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const mockSession = {
        user: { id: 'user-1' },
        session: { id: 'session-1' }, // No activeOrganizationId
      };
      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const mockResponse = {
        headers: new Map(),
        set: vi.fn(),
      };
      vi.mocked(NextResponse.next).mockReturnValue(mockResponse as any);

      const middleware = nodeModule.createNodeMiddleware({
        enableSessionCache: true,
      });

      const request = new NextRequest('https://example.com/protected', {
        method: 'GET',
      });

      await middleware(request);

      expect(mockResponse.set).toHaveBeenCalledWith('x-session-cached', 'true');
      expect(mockResponse.set).toHaveBeenCalledWith('x-user-id', 'user-1');
      expect(mockResponse.set).not.toHaveBeenCalledWith('x-organization-id', expect.anything());
    });

    test('should not set cache headers when disabled', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const mockSession = {
        user: { id: 'user-1' },
        session: { id: 'session-1' },
      };
      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const mockResponse = {
        headers: new Map(),
        set: vi.fn(),
      };
      vi.mocked(NextResponse.next).mockReturnValue(mockResponse as any);

      const middleware = nodeModule.createNodeMiddleware({
        enableSessionCache: false,
      });

      const request = new NextRequest('https://example.com/protected', {
        method: 'GET',
      });

      await middleware(request);

      expect(mockResponse.set).not.toHaveBeenCalledWith('x-session-cached', expect.anything());
    });

    test('should handle session errors gracefully', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const sessionError = new Error('Session validation failed');
      mockAuth.api.getSession.mockRejectedValue(sessionError);

      const middleware = nodeModule.createNodeMiddleware();
      const request = new NextRequest('https://example.com/protected', {
        method: 'GET',
      });

      await middleware(request);

      expect(mockLogError).toHaveBeenCalledWith('Node middleware error:', sessionError);
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('error=session-error'),
        }),
      );
    });

    test('should handle non-Error exceptions', async () => {
      const nodeModule = await import('#/server/middleware/node');

      mockAuth.api.getSession.mockRejectedValue('string error');

      const middleware = nodeModule.createNodeMiddleware();
      const request = new NextRequest('https://example.com/protected', {
        method: 'GET',
      });

      await middleware(request);

      expect(mockLogError).toHaveBeenCalledWith('Node middleware error:', expect.any(Error));
    });

    test('should pass auth headers to session check', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const authHeaders = {
        'x-api-key': 'test-key',
        authorization: 'Bearer token',
      };
      mockGetAuthHeaders.mockResolvedValue(authHeaders);
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'user-1' },
        session: { id: 'session-1' },
      });

      const middleware = nodeModule.createNodeMiddleware();
      const request = new NextRequest('https://example.com/protected', {
        method: 'GET',
      });

      await middleware(request);

      expect(mockAuth.api.getSession).toHaveBeenCalledWith({
        headers: authHeaders,
      });
    });

    test('should handle route prefixes correctly', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware();

      // Test nested public routes
      const request = new NextRequest('https://example.com/_next/static/chunk.js', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
      expect(mockAuth.api.getSession).not.toHaveBeenCalled();
    });
  });

  describe('default middleware', () => {
    test('should export default nodeMiddleware', async () => {
      const nodeModule = await import('#/server/middleware/node');

      expect(nodeModule.nodeMiddleware).toBeDefined();
      expect(typeof nodeModule.nodeMiddleware).toBe('function');
    });

    test('should work with default settings', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const request = new NextRequest('https://example.com/sign-in', {
        method: 'GET',
      });

      const result = await nodeModule.nodeMiddleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });
  });

  describe('edge cases', () => {
    test('should handle complex nested routes', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware({
        publicPaths: ['/docs'],
      });

      const request = new NextRequest('https://example.com/docs/getting-started/installation', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should handle empty public paths array', async () => {
      const nodeModule = await import('#/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware({
        publicPaths: [],
      });

      const request = new NextRequest('https://example.com/sign-in', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalledWith();
    });

    test('should handle malformed URLs gracefully', async () => {
      const nodeModule = await import('#/server/middleware/node');

      mockAuth.api.getSession.mockResolvedValue(null);

      const middleware = nodeModule.createNodeMiddleware();
      const request = new NextRequest('https://example.com/protected%20space', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith();
    });

    test('should preserve query parameters in callback URL', async () => {
      const nodeModule = await import('#/server/middleware/node');

      mockAuth.api.getSession.mockResolvedValue(null);

      const middleware = nodeModule.createNodeMiddleware();
      const request = new NextRequest('https://example.com/protected?tab=settings&id=123', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('callbackUrl=%2Fprotected%3Ftab%3Dsettings%26id%3D123'),
        }),
      );
    });
  });
});
