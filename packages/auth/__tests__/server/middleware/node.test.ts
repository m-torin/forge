/**
 * Tests for Node.js middleware functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
vi.mock('@/shared/auth', () => ({
  auth: mockAuth,
}));

// Mock get-headers
const mockGetAuthHeaders = vi.fn();
vi.mock('@/server/get-headers', () => ({
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

describe('Node.js middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthHeaders.mockResolvedValue({});
  });

  describe('createNodeMiddleware', () => {
    it('should create middleware function', async () => {
      const nodeModule = await import('@/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware();

      expect(typeof middleware).toBe('function');
    });

    it('should allow public routes', async () => {
      const nodeModule = await import('@/server/middleware/node');

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

        expect(NextResponse.next).toHaveBeenCalled();
      }
    });

    it('should allow home page as public route', async () => {
      const nodeModule = await import('@/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware();
      const request = new NextRequest('https://example.com/', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should allow custom public paths', async () => {
      const nodeModule = await import('@/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware({
        publicPaths: ['/custom-public'],
      });

      const request = new NextRequest('https://example.com/custom-public', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should skip auth when requireAuth is false', async () => {
      const nodeModule = await import('@/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware({
        requireAuth: false,
      });

      const request = new NextRequest('https://example.com/protected', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(mockAuth.api.getSession).not.toHaveBeenCalled();
    });

    it('should check session for protected routes', async () => {
      const nodeModule = await import('@/server/middleware/node');

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
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should redirect to sign-in when no session', async () => {
      const nodeModule = await import('@/server/middleware/node');

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

    it('should use custom redirect URL', async () => {
      const nodeModule = await import('@/server/middleware/node');

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

    it('should set session cache headers when enabled', async () => {
      const nodeModule = await import('@/server/middleware/node');

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

    it('should not set organization header when no active organization', async () => {
      const nodeModule = await import('@/server/middleware/node');

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

    it('should not set cache headers when disabled', async () => {
      const nodeModule = await import('@/server/middleware/node');

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

    it('should handle session errors gracefully', async () => {
      const nodeModule = await import('@/server/middleware/node');

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

    it('should handle non-Error exceptions', async () => {
      const nodeModule = await import('@/server/middleware/node');

      mockAuth.api.getSession.mockRejectedValue('string error');

      const middleware = nodeModule.createNodeMiddleware();
      const request = new NextRequest('https://example.com/protected', {
        method: 'GET',
      });

      await middleware(request);

      expect(mockLogError).toHaveBeenCalledWith('Node middleware error:', expect.any(Error));
    });

    it('should pass auth headers to session check', async () => {
      const nodeModule = await import('@/server/middleware/node');

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

    it('should handle route prefixes correctly', async () => {
      const nodeModule = await import('@/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware();

      // Test nested public routes
      const request = new NextRequest('https://example.com/_next/static/chunk.js', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(mockAuth.api.getSession).not.toHaveBeenCalled();
    });
  });

  describe('default middleware', () => {
    it('should export default nodeMiddleware', async () => {
      const nodeModule = await import('@/server/middleware/node');

      expect(nodeModule.nodeMiddleware).toBeDefined();
      expect(typeof nodeModule.nodeMiddleware).toBe('function');
    });

    it('should work with default settings', async () => {
      const nodeModule = await import('@/server/middleware/node');

      const request = new NextRequest('https://example.com/sign-in', {
        method: 'GET',
      });

      const result = await nodeModule.nodeMiddleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle complex nested routes', async () => {
      const nodeModule = await import('@/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware({
        publicPaths: ['/docs'],
      });

      const request = new NextRequest('https://example.com/docs/getting-started/installation', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should handle empty public paths array', async () => {
      const nodeModule = await import('@/server/middleware/node');

      const middleware = nodeModule.createNodeMiddleware({
        publicPaths: [],
      });

      const request = new NextRequest('https://example.com/sign-in', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should handle malformed URLs gracefully', async () => {
      const nodeModule = await import('@/server/middleware/node');

      mockAuth.api.getSession.mockResolvedValue(null);

      const middleware = nodeModule.createNodeMiddleware();
      const request = new NextRequest('https://example.com/protected%20space', {
        method: 'GET',
      });

      await middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it('should preserve query parameters in callback URL', async () => {
      const nodeModule = await import('@/server/middleware/node');

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
