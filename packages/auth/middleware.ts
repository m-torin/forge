import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

const protectedRoutes = ['/account', '/dashboard', '/favorites', '/shop', '/registries/create'];

const isProtectedRoute = (pathname: string) => {
  // Remove locale prefix if present (e.g., /en/account -> /account)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '');

  // Check if the pathname starts with any protected route
  // This handles both the route itself and any sub-routes
  return protectedRoutes.some(
    (route) => pathname.startsWith(route) || pathWithoutLocale.startsWith(route),
  );
};

const isApiRoute = (pathname: string) => {
  return pathname.startsWith('/api/') && !pathname.startsWith('/api/auth');
};

// Edge-compatible middleware using cookie-only approach
export const authMiddleware = (next?: () => NextResponse) => {
  return async (request: NextRequest) => {
    const { pathname } = request.nextUrl;

    // For API routes (except auth), check both API key and session
    if (isApiRoute(pathname)) {
      // Check for API key in headers
      const apiKey = request.headers.get('x-api-key');
      if (apiKey) {
        // API key is present, let the request through
        // Better Auth will handle the actual validation in the route
        return next ? next() : NextResponse.next();
      }

      // No API key, check for session cookie
      const sessionCookie = getSessionCookie(request);
      if (!sessionCookie) {
        // No authentication at all for API route
        return NextResponse.json(
          { error: 'Unauthorized. Please provide a valid API key or authentication.' },
          { status: 401 },
        );
      }

      // Session exists, continue
      return next ? next() : NextResponse.next();
    }

    // For protected routes, check for session
    if (isProtectedRoute(pathname)) {
      const sessionCookie = getSessionCookie(request);

      if (!sessionCookie) {
        // No session, redirect to sign-in
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }
    }

    // All other routes are public - allow access
    return next ? next() : NextResponse.next();
  };
};
