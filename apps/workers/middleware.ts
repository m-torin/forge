import { type NextMiddleware, NextResponse } from 'next/server';

import { createAuthMiddleware } from '@repo/auth-new/server';
import { parseError } from '@repo/observability/error';
import { secure } from '@repo/security';
import { noseconeMiddleware, noseconeOptions } from '@repo/security/middleware';

import { env } from './env';

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs',
};

const securityHeaders = noseconeMiddleware(noseconeOptions);

// Create auth middleware with API key support
const authMiddleware = createAuthMiddleware({
  apiKeyHeaders: ['x-api-key'],
  publicApiRoutes: [
    '/api/auth', // Keep auth endpoints public for login
    '/api/events', // SSE endpoint for workflow updates
    '/api/client/trigger', // Workflow trigger endpoint
    '/api/client/logs', // Workflow logs endpoint
  ],
  publicWebRoutes: [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/unauthorized',
    '/_next',
    '/favicon.ico',
    '/.well-known',
    '/apple-icon.png',
    '/icon.png',
    '/opengraph-image.png',
  ],
  redirectPath: '/sign-in',
});

const middleware: NextMiddleware = async (request) => {
  try {
    console.log(`[WORKERS] Middleware: ${request.method} ${request.nextUrl.pathname}`);
    console.log(`[WORKERS] Headers:`, Object.fromEntries(request.headers.entries()));

    // Skip ALL auth and security for API routes during development
    if (request.nextUrl.pathname.startsWith('/api/')) {
      console.log(`[WORKERS] Bypassing ALL middleware for API route: ${request.nextUrl.pathname}`);

      // Add response logging for API routes
      const response = NextResponse.next();

      // Log response details for debugging
      console.log(`[WORKERS] Middleware response for ${request.nextUrl.pathname}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      return response;
    }

    // Only apply security headers for non-API routes
    if (!env.ARCJET_KEY) {
      return securityHeaders();
    }

    // Apply Arcjet security only for web routes
    await secure(['CATEGORY:SEARCH_ENGINE', 'CATEGORY:MONITOR', 'CATEGORY:WEBHOOK'], request);

    return securityHeaders();
  } catch (error) {
    const message = parseError(error);
    console.error('Middleware error:', error);

    return NextResponse.json({ error: message }, { status: 403 });
  }
};

export default middleware;
