import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/.well-known',
];

const isPublicRoute = (pathname: string) => {
  // Special case for home page
  if (pathname === '/') {
    return true;
  }
  return publicRoutes.some((route) => pathname.startsWith(route));
};

const isApiRoute = (pathname: string) => {
  return pathname.startsWith('/api/') && !pathname.startsWith('/api/auth');
};

// Edge-compatible middleware using cookie-only approach
export const authMiddleware = (next?: () => NextResponse) => {
  return async (request: NextRequest) => {
    const { pathname } = request.nextUrl;

    // Skip authentication for public routes
    if (isPublicRoute(pathname)) {
      return next ? next() : NextResponse.next();
    }

    // For API routes, check both API key and session
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

    // Regular routes (non-API) - check for session cookie only
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      // No session, redirect to sign-in
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Session exists, continue
    return next ? next() : NextResponse.next();
  };
};
