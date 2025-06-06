import { type NextMiddleware, NextResponse } from 'next/server';

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

const middleware: NextMiddleware = async (request) => {
  try {
    console.log(`[WORKERS] Middleware: ${request.method} ${request.nextUrl.pathname}`);
    console.log(`[WORKERS] Headers:`, Object.fromEntries(request.headers.entries()));

    // Apply security headers for all routes
    const response = NextResponse.next();

    // Only apply Arcjet security if configured
    if (env.ARCJET_KEY) {
      await secure(['CATEGORY:SEARCH_ENGINE', 'CATEGORY:MONITOR', 'CATEGORY:WEBHOOK'], request);
    }

    return securityHeaders();
  } catch (error) {
    const message = parseError(error);
    console.error('Middleware error:', error);

    return NextResponse.json({ error: message }, { status: 403 });
  }
};

export default middleware;
