import { precompute } from '@vercel/flags/next';
import { type NextRequest, NextResponse } from 'next/server';

import { getOrGenerateVisitorId } from '../shared/utils';

export interface FeatureFlagMiddlewareOptions {
  /**
   * Array of flags to precompute for static pages
   */
  flags?: readonly any[];

  /**
   * Cookie name for visitor ID
   */
  visitorCookieName?: string;

  /**
   * Path prefix for precomputed routes
   */
  codePrefix?: string;

  /**
   * Whether to generate visitor IDs for anonymous users
   */
  generateVisitorId?: boolean;
}

/**
 * Create feature flag middleware for Next.js
 */
export function createFeatureFlagMiddleware(options: FeatureFlagMiddlewareOptions = {}) {
  const {
    codePrefix = '',
    flags = [],
    generateVisitorId = true,
    visitorCookieName = 'visitor-id',
  } = options;

  return async function featureFlagMiddleware(
    request: NextRequest,
  ): Promise<NextResponse | undefined> {
    let response: NextResponse | undefined;
    let visitorId: string | undefined;

    // Generate visitor ID if enabled
    if (generateVisitorId) {
      visitorId = await getOrGenerateVisitorId(request.cookies, request.headers, visitorCookieName);
    }

    // Precompute flags if provided
    if (flags.length > 0) {
      const code = await precompute(flags);
      const pathname = request.nextUrl.pathname;
      const search = request.nextUrl.search;

      // Rewrite to precomputed path
      const rewriteUrl = new URL(`${codePrefix}/${code}${pathname}${search}`, request.url);

      response = NextResponse.rewrite(rewriteUrl, { request });
    }

    // Set visitor ID cookie if generated and not already present
    if (visitorId && !request.cookies.has(visitorCookieName)) {
      response = response || NextResponse.next();
      response.cookies.set(visitorCookieName, visitorId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        sameSite: 'lax',
      });

      // Also set as header for immediate access
      response.headers.set(`x-${visitorCookieName}`, visitorId);
    }

    return response;
  };
}
