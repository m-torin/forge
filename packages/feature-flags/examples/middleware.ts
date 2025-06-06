import { type NextRequest, NextResponse } from 'next/server';
import { precompute } from '../src/server';
import { marketingFlags } from './flags';
import { getOrGenerateVisitorId } from '../src/shared/utils';

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
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      sameSite: 'lax',
    });

    // Also set as header for immediate access
    response.headers.set('x-visitor-id', visitorId);
  }

  return response;
}
