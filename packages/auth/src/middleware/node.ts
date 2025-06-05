/**
 * Node.js runtime middleware for Next.js (requires runtime: "nodejs" config)
 */

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '../server/auth';

import type { NextRequest } from 'next/server';
import type { MiddlewareOptions } from '../shared/types';

const defaultPublicRoutes = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/.well-known',
];

const isPublicRoute = (pathname: string, publicPaths: string[]) => {
  // Special case for home page
  if (pathname === '/') {
    return true;
  }
  
  const allPublicPaths = [...defaultPublicRoutes, ...publicPaths];
  return allPublicPaths.some((route) => pathname.startsWith(route));
};

/**
 * Node.js runtime middleware for Next.js 15.2.0+ (requires runtime: "nodejs" config)
 * Uses auth.api for session validation which requires Node.js runtime
 */
export function createNodeMiddleware(options: MiddlewareOptions = {}) {
  const {
    requireAuth = true,
    redirectTo = '/sign-in',
    publicPaths = [],
    enableSessionCache = true,
  } = options;

  return async function nodeMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip authentication for public routes
    if (isPublicRoute(pathname, publicPaths)) {
      return NextResponse.next();
    }

    if (!requireAuth) {
      return NextResponse.next();
    }

    try {
      // Check session using auth.api (requires Node.js runtime)
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        // No session, redirect to sign-in
        const signInUrl = new URL(redirectTo, request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Session exists, add caching headers if enabled
      const response = NextResponse.next();
      
      if (enableSessionCache) {
        response.headers.set('x-session-cached', 'true');
        response.headers.set('x-user-id', session.user.id);
        
        if (session.session.activeOrganizationId) {
          response.headers.set('x-organization-id', session.session.activeOrganizationId);
        }
      }

      return response;
    } catch (error) {
      console.error('Node middleware error:', error);
      
      // Redirect to sign-in on error
      const signInUrl = new URL(redirectTo, request.url);
      signInUrl.searchParams.set('error', 'session-error');
      return NextResponse.redirect(signInUrl);
    }
  };
}

/**
 * Default Node.js middleware with common settings
 */
export const nodeMiddleware = createNodeMiddleware();