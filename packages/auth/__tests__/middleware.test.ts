import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authMiddleware } from '../middleware';
import { nodeAuthMiddleware } from '../middleware.node';
import { auth } from '../server';

// Mock better-auth/cookies
vi.mock('better-auth/cookies', () => ({
  getSessionCookie: vi.fn(),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

// Mock auth module
vi.mock('../server', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

describe('Auth Middleware', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionCookie).mockReturnValue(null);
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
  });

  describe('authMiddleware (Edge Runtime)', () => {
    it('allows access to public routes without authentication', async () => {
      mockRequest = new NextRequest(new URL('http://localhost:3000/sign-in'));

      const middleware = authMiddleware();
      const response = await middleware(mockRequest);

      expect(response.status).toBe(200);
      expect(getSessionCookie).not.toHaveBeenCalled();
    });

    it('redirects to sign-in when no session exists for protected routes', async () => {
      mockRequest = new NextRequest(new URL('http://localhost:3000/dashboard'));
      vi.mocked(getSessionCookie).mockReturnValueOnce(null);

      const middleware = authMiddleware();
      const response = await middleware(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/sign-in');
      expect(response.headers.get('location')).toContain('callbackUrl=%2Fdashboard');
    });

    it('allows access when session exists', async () => {
      mockRequest = new NextRequest(new URL('http://localhost:3000/dashboard'));
      vi.mocked(getSessionCookie).mockReturnValueOnce('test-session');

      const middleware = authMiddleware();
      const response = await middleware(mockRequest);

      expect(response.status).toBe(200);
    });

    it('chains with next middleware when provided', async () => {
      mockRequest = new NextRequest(new URL('http://localhost:3000/dashboard'));
      vi.mocked(getSessionCookie).mockReturnValueOnce('test-session');

      const nextMiddleware = vi.fn().mockReturnValue(NextResponse.next());
      const middleware = authMiddleware(nextMiddleware);

      await middleware(mockRequest);

      expect(nextMiddleware).toHaveBeenCalled();
    });
  });

  describe('nodeAuthMiddleware (Node.js Runtime)', () => {
    it('allows access to public routes without authentication', async () => {
      mockRequest = new NextRequest(new URL('http://localhost:3000/sign-in'));

      const middleware = nodeAuthMiddleware();
      const response = await middleware(mockRequest);

      expect(response.status).toBe(200);
      expect(auth.api.getSession).not.toHaveBeenCalled();
    });

    it('redirects to sign-in when no session exists for protected routes', async () => {
      mockRequest = new NextRequest(new URL('http://localhost:3000/dashboard'));
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

      const middleware = nodeAuthMiddleware();
      const response = await middleware(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/sign-in');
      expect(response.headers.get('location')).toContain('callbackUrl=%2Fdashboard');
    });

    it('allows access when session exists', async () => {
      mockRequest = new NextRequest(new URL('http://localhost:3000/dashboard'));
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        session: { id: 'session-1' },
        user: { id: '1', email: 'test@example.com' },
      });

      const middleware = nodeAuthMiddleware();
      const response = await middleware(mockRequest);

      expect(response.status).toBe(200);
    });

    it('checks public routes correctly', async () => {
      const publicRoutes = [
        '/sign-in',
        '/sign-up',
        '/api/auth/callback',
        '/_next/static/chunk.js',
        '/favicon.ico',
      ];

      for (const route of publicRoutes) {
        mockRequest = new NextRequest(new URL(`http://localhost:3000${route}`));
        const middleware = nodeAuthMiddleware();
        const response = await middleware(mockRequest);
        expect(response.status).toBe(200);
        expect(auth.api.getSession).not.toHaveBeenCalled();
      }
    });
  });
});
