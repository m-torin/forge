import { type NextMiddleware, NextResponse } from 'next/server';

import { createAuthMiddleware } from '@repo/auth/middleware-api';
import { parseError } from '@repo/observability/error';
import { secure } from '@repo/security';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';

import { env } from './env';

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs',
};

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

// Create auth middleware with API key support
const authMiddleware = createAuthMiddleware({
  apiKeyHeaders: ['x-api-key'],
  publicApiRoutes: [
    '/api/auth', // Keep auth endpoints public for login
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
    // Check auth first
    const authResponse = await authMiddleware()(request);
    // If auth middleware redirects or blocks, return its response
    if (authResponse.status !== 200 || authResponse.headers.get('Location')) {
      return authResponse;
    }

    if (!env.ARCJET_KEY) {
      return securityHeaders();
    }

    // Apply Arcjet security
    await secure(
      [
        // Workers-specific security allowlist
        'CATEGORY:SEARCH_ENGINE', // Allow search engines
        'CATEGORY:MONITOR', // Allow uptime monitoring services
        'CATEGORY:WEBHOOK', // Allow webhook services
      ],
      request,
    );

    return securityHeaders();
  } catch (error) {
    const message = parseError(error);
    console.error('Middleware error:', error);

    return NextResponse.json({ error: message }, { status: 403 });
  }
};

export default middleware;
