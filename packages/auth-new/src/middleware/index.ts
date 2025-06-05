/**
 * Authentication middleware
 */

import type { NextRequest } from 'next/server';
import { auth } from '../server/auth';

/**
 * Create authentication middleware for route protection
 */
export function createAuthMiddleware(options: {
  publicRoutes?: readonly string[];
  protectedRoutes?: readonly string[];
  redirectUrl?: string;
} = {}) {
  const {
    publicRoutes = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'] as const,
    protectedRoutes = ['/dashboard', '/settings', '/api'] as const,
    redirectUrl = '/sign-in',
  } = options;

  return async function authMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    if (isPublicRoute) return; // Allow access to public routes

    // Check if route needs protection
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    if (!isProtectedRoute) return; // Not a protected route, allow access

    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        // Redirect to sign-in page
        const url = new URL(redirectUrl, request.url);
        url.searchParams.set('returnUrl', pathname);
        return Response.redirect(url);
      }

      // Session exists, allow access
    } catch (error) {
      console.error('Auth middleware error:', error);
      // Redirect to sign-in on error
      const url = new URL(redirectUrl, request.url);
      return Response.redirect(url);
    }
  };
}

/**
 * Default auth middleware with common settings
 */
export const authMiddleware = createAuthMiddleware();