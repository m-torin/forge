import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest): NextResponse {
  // Add security headers
  const response = NextResponse.next();

  // Security headers for workflow endpoints
  if (request.nextUrl.pathname.startsWith('/api/workflow')) {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // In production, remove local development headers
    if (process.env.NODE_ENV === 'production') {
      response.headers.delete('X-Development-Mode');
    }
  }

  return response;
}

export const config = {
  matcher: '/api/workflow/:path*',
};
