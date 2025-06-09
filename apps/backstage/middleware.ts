import { type NextMiddleware, NextResponse } from 'next/server';

import { secure } from '@repo/security';
import { noseconeMiddleware, noseconeOptions } from '@repo/security/middleware';

import { env } from './env';

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

const securityHeaders = noseconeMiddleware(noseconeOptions);

const middleware: NextMiddleware = async (request) => {
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
    const message = error instanceof Error ? error.message : 'Access denied';

    return NextResponse.json({ error: message }, { status: 403 });
  }
};

export default middleware;
