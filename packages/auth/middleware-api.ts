import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

const publicApiRoutes = ['/api/health', '/api/public', '/api/auth'];

const isPublicApiRoute = (pathname: string) => {
  return publicApiRoutes.some((route) => pathname.startsWith(route));
};

// Enhanced middleware specifically for API routes with API key support
export const apiAuthMiddleware = (options?: {
  allowedHeaders?: string[];
  requireAuth?: boolean;
  publicRoutes?: string[];
}) => {
  const allowedHeaders = options?.allowedHeaders || ['x-api-key'];
  const requireAuth = options?.requireAuth ?? true;
  const additionalPublicRoutes = options?.publicRoutes || [];

  return (next?: () => NextResponse) => {
    return async (request: NextRequest) => {
      const { pathname } = request.nextUrl;

      // Check if this is a public API route
      if (isPublicApiRoute(pathname) || additionalPublicRoutes.includes(pathname)) {
        return next ? next() : NextResponse.next();
      }

      // Check for API key in any of the allowed headers
      let apiKey: string | null = null;
      for (const header of allowedHeaders) {
        apiKey = request.headers.get(header);
        if (apiKey) break;
      }

      if (apiKey) {
        // API key is present, let Better Auth handle validation
        // Add a flag to indicate API key auth
        const response = next ? next() : NextResponse.next();
        response.headers.set('x-auth-method', 'api-key');
        return response;
      }

      // No API key, check for session
      const sessionCookie = getSessionCookie(request);

      if (!sessionCookie && requireAuth) {
        // No authentication provided
        return NextResponse.json(
          {
            error: 'Unauthorized',
            headers: allowedHeaders.map((h) => ({ [h]: 'your-api-key' })),
            message: 'Please provide a valid API key or authentication.',
          },
          { status: 401 },
        );
      }

      if (sessionCookie) {
        const response = next ? next() : NextResponse.next();
        response.headers.set('x-auth-method', 'session');
        return response;
      }

      // No auth but not required
      return next ? next() : NextResponse.next();
    };
  };
};

// Combined middleware for both web and API routes
export const createAuthMiddleware = (options?: {
  publicWebRoutes?: string[];
  publicApiRoutes?: string[];
  apiKeyHeaders?: string[];
  redirectPath?: string;
}) => {
  const publicWebRoutes = options?.publicWebRoutes || [
    '/sign-in',
    '/sign-up',
    '/_next',
    '/favicon.ico',
    '/.well-known',
  ];
  const publicApiRoutes = options?.publicApiRoutes || [];
  const apiKeyHeaders = options?.apiKeyHeaders || ['x-api-key'];
  const redirectPath = options?.redirectPath || '/sign-in';

  const isPublicWebRoute = (pathname: string) => {
    if (pathname === '/') return true;
    return publicWebRoutes.some((route) => pathname.startsWith(route));
  };

  return (next?: () => NextResponse) => {
    return async (request: NextRequest) => {
      const { pathname } = request.nextUrl;

      // Handle API routes
      if (pathname.startsWith('/api/')) {
        return apiAuthMiddleware({
          allowedHeaders: apiKeyHeaders,
          publicRoutes: publicApiRoutes,
          requireAuth: true,
        })(next)(request);
      }

      // Handle web routes
      if (isPublicWebRoute(pathname)) {
        return next ? next() : NextResponse.next();
      }

      // Check for session
      const sessionCookie = getSessionCookie(request);

      if (!sessionCookie) {
        // No session, redirect to sign-in
        const signInUrl = new URL(redirectPath, request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Session exists, continue
      return next ? next() : NextResponse.next();
    };
  };
};
