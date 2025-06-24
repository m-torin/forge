// Enhanced middleware with AI security for SEO workflows
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Enhanced security headers for AI processing workflows
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add specific CSP for SEO generation APIs
  if (request.nextUrl.pathname.startsWith('/api/workflow/seo-generation')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; connect-src 'self' https://api.anthropic.com http://localhost:1234; script-src 'none'; style-src 'none';",
    );

    // Add AI-specific rate limiting headers
    response.headers.set('X-RateLimit-Limit', '10');
    response.headers.set('X-RateLimit-Window', '60000');
    response.headers.set('X-AI-Cost-Warning', 'This endpoint consumes AI tokens');
  }

  // Block suspicious patterns for AI endpoints
  if (request.nextUrl.pathname.includes('seo-generation')) {
    const userAgent = request.headers.get('user-agent') || '';
    const suspiciousPatterns = ['bot', 'crawler', 'spider', 'scraper'];

    if (
      suspiciousPatterns.some(
        (pattern) => userAgent.toLowerCase().includes(pattern) && !userAgent.includes('SeoBot/1.0'),
      )
    ) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // Add token usage tracking headers for AI endpoints
  if (request.nextUrl.pathname.startsWith('/api/workflow/seo-')) {
    response.headers.set('X-Token-Tracking', 'enabled');
    response.headers.set('X-Cost-Center', 'seo-ai-processing');
  }

  return response;
}

export const config = {
  matcher: [
    '/api/workflow/seo-generation/:path*',
    '/api/workflow/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
