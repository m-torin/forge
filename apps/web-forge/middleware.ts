import { env } from '@/env';
import { type NextMiddleware, NextResponse } from 'next/server';

import { createAuthMiddleware } from '@repo/auth/server-utils';
import { internationalizationMiddleware } from '@repo/internationalization/middleware';
import { parseError } from '@repo/observability/error';
import { secure } from '@repo/security';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets and Posthog ingest
  matcher: ['/((?!_next/static|_next/image|ingest|favicon.ico).*)'],
  runtime: 'nodejs',
};

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

// Create auth middleware with API key support
const authMiddleware = createAuthMiddleware({
  apiKeyHeaders: ['x-api-key'],
  publicApiRoutes: ['/api/auth'],
  publicWebRoutes: [
    '/sign-in',
    '/sign-up',
    '/',
    '/_next',
    '/favicon.ico',
    '/.well-known',
    '/about',
    '/blog',
    '/contact',
    '/legal',
    '/pricing',
    '/apple-icon.png',
    '/icon.png',
    '/opengraph-image.png',
    '/robots.txt',
    '/sitemap.xml',
  ],
  redirectPath: '/sign-in',
});

const middleware: NextMiddleware = async (request) => {
  // Apply i18n middleware first to handle URL rewriting
  const i18nResponse = internationalizationMiddleware(request);

  // If i18n middleware returns a response, it means it's either:
  // 1. A redirect (e.g., / -> /en)
  // 2. A rewrite (e.g., /about -> /en/about)
  // We should return this response to let Next.js handle the rewrite/redirect
  if (i18nResponse) {
    // For rewrites, the middleware continues to process with the rewritten URL
    // For redirects, we return immediately
    const isRedirect = i18nResponse.status >= 300 && i18nResponse.status < 400;
    if (isRedirect) {
      return i18nResponse;
    }
  }

  // Check auth after i18n processing
  const authResponse = await authMiddleware()(request);
  // If auth middleware redirects or blocks, return its response
  if (authResponse.status !== 200 || authResponse.headers.get('Location')) {
    return authResponse;
  }

  // If i18n returned a rewrite response, return it now after auth check
  if (i18nResponse) {
    return i18nResponse;
  }

  if (!env.ARCJET_KEY) {
    return securityHeaders();
  }

  try {
    await secure(
      [
        // See https://docs.arcjet.com/bot-protection/identifying-bots
        'CATEGORY:SEARCH_ENGINE', // Allow search engines
        'CATEGORY:PREVIEW', // Allow preview links to show OG images
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
