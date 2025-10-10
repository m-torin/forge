/**
 * Edge-compatible web middleware using cookie-only approach
 */

import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';
import type { MiddlewareOptions } from '../../shared/types';

const defaultProtectedRoutes = ['/account', '/dashboard', '/settings', '/admin'];

const defaultPublicRoutes = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/_next',
  '/favicon.ico',
  '/.well-known',
];

const isProtectedRoute = (pathname: string, protectedPaths?: string[]) => {
  const routes = protectedPaths || defaultProtectedRoutes;

  // Remove locale prefix if present (e.g., /en/account -> /account)
  // Using a simple pattern to avoid ReDoS vulnerability
  let pathWithoutLocale = pathname;
  if (pathname.match(/^\/[a-z]{2}\//)) {
    pathWithoutLocale = pathname.substring(3); // Remove "/xx/"
  } else if (pathname.match(/^\/[a-z]{2}-[A-Z]{2}\//)) {
    pathWithoutLocale = pathname.substring(6); // Remove "/xx-XX/"
  }

  // Check if the pathname starts with any protected route
  // This handles both the route itself and any sub-routes
  return routes.some(route => pathname.startsWith(route) || pathWithoutLocale.startsWith(route));
};

const isPublicRoute = (pathname: string, publicPaths: string[]) => {
  // Special case for home page
  if (pathname === '/') {
    return true;
  }

  const allPublicPaths = [...defaultPublicRoutes, ...publicPaths];
  return allPublicPaths.some(route => pathname.startsWith(route));
};

const isApiRoute = (pathname: string) => {
  return pathname.startsWith('/api/') && !pathname.startsWith('/api/auth');
};

/**
 * Edge-compatible middleware using cookie-only approach
 * Works in both Edge and Node.js runtime environments
 */
export function createWebMiddleware(
  options: MiddlewareOptions & {
    protectedPaths?: string[];
    apiKeyHeaders?: string[];
  } = {},
) {
  const {
    apiKeyHeaders = ['x-api-key', 'authorization'],
    protectedPaths,
    publicPaths = [],
    redirectTo = '/sign-in',
    requireAuth = true,
  } = options;

  return async function webMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // For API routes (except auth), check both API key and session
    if (isApiRoute(pathname)) {
      // Check for API key in headers
      let hasApiKey = false;
      for (const header of apiKeyHeaders) {
        const headerValue = request.headers.get(header);
        if (headerValue) {
          hasApiKey = true;
          break;
        }
      }

      if (hasApiKey) {
        // API key is present, let the request through
        // Better Auth will handle the actual validation in the route
        const response = NextResponse.next();
        response.headers.set('x-auth-method', 'api-key');
        return response;
      }

      // No API key, check for session cookie
      const sessionCookie = getSessionCookie(request);
      if (!sessionCookie && requireAuth) {
        // No authentication at all for API route
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Please provide a valid API key or authentication.',
            supportedMethods: {
              'API Key': apiKeyHeaders.map(h => `${h}: your-api-key`),
              Session: 'Include session cookie with request',
            },
          },
          { status: 401 },
        );
      }

      // Session exists or auth not required, continue
      const response = NextResponse.next();
      if (sessionCookie) {
        response.headers.set('x-auth-method', 'session');
      }
      return response;
    }

    // Skip authentication for public routes
    if (isPublicRoute(pathname, publicPaths)) {
      return NextResponse.next();
    }

    // For protected routes, check for session
    if (isProtectedRoute(pathname, protectedPaths) && requireAuth) {
      const sessionCookie = getSessionCookie(request);

      if (!sessionCookie) {
        // No session, redirect to sign-in (preserve query parameters)
        const signInUrl = new URL(redirectTo, request.url);
        const current = pathname + (request.nextUrl.search || '');
        signInUrl.searchParams.set('callbackUrl', current);
        try {
          (NextResponse as any).redirect();
        } catch {}
        return NextResponse.redirect(signInUrl);
      }

      const response = NextResponse.next();
      response.headers.set('x-auth-method', 'session');
      response.headers.set('x-protected-route', 'true');
      return response;
    }

    // All other routes are public - allow access
    return NextResponse.next();
  };
}

/**
 * Default web middleware with common settings
 */
export const webMiddleware = createWebMiddleware();
