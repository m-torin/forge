import { type NextMiddleware, NextResponse } from 'next/server';

import { authMiddleware as betterAuthMiddleware } from '@repo/auth/middleware';
import { parseError } from '@repo/observability/error';
import { secure } from '@repo/security';
import {
  noseconeMiddleware,
  noseconeOptions,
} from '@repo/security/middleware';

import { env } from './env';

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs',
};

const securityHeaders = noseconeMiddleware(noseconeOptions);

// Use auth middleware from auth package

const middleware: NextMiddleware = async (request) => {
  // Check auth first for admin app
  const authHandler = betterAuthMiddleware();
  const authResponse = await authHandler(request);
  // If auth middleware redirects or blocks, return its response
  if (authResponse.status !== 200 || authResponse.headers.get('Location')) {
    return authResponse;
  }

  if (!env.ARCJET_KEY) {
    return securityHeaders();
  }

  try {
    await secure(
      [
        // Admin-specific security allowlist
        'CATEGORY:SEARCH_ENGINE', // Allow search engines
        'CATEGORY:MONITOR', // Allow uptime monitoring services
      ],
      request,
    );

    return securityHeaders();
  } catch (error) {
    const message = parseError(error);

    return NextResponse.json({ error: message }, { status: 403 });
  }
};

export default middleware;
