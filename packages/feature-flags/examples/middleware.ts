import { type NextRequest, NextResponse } from 'next/server';

import { precompute } from '../src/server-next';
import { getOrGenerateVisitorId } from '../src/shared/utils';

import { marketingFlags } from './flags';

export const config = {
  matcher: ['/', '/pricing', '/features'],
};

export async function middleware(request: NextRequest) {
  // Generate visitor ID for anonymous users
  const visitorId = await getOrGenerateVisitorId(request.cookies, request.headers);

  // Precompute flags for static pages
  const code = await precompute(marketingFlags);

  // Rewrite to precomputed path
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  const nextUrl = new URL(`/${code}${pathname}${search}`, request.url);

  const response = NextResponse.rewrite(nextUrl, { request });

  // Set visitor ID cookie if new
  if (!request.cookies.has('visitor-id')) {
    response.cookies.set('visitor-id', visitorId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    });

    // Also set as header for immediate access
    response.headers.set('x-visitor-id', visitorId);
  }

  return response;
}
