import { internationalizationMiddleware } from '@repo/internationalization/server/next';
import { noseconeMiddleware, noseconeOptions } from '@repo/security/middleware';

import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Run internationalization middleware first to handle locale routing
  const i18nResponse = await internationalizationMiddleware(request);

  // If i18n middleware returned a response (redirect), use it
  if (i18nResponse.status !== 200 || i18nResponse.headers.get('x-middleware-rewrite')) {
    return i18nResponse;
  }

  // Apply security headers using Nosecone and return the response
  const securityResponse = await noseconeMiddleware(noseconeOptions)();
  return securityResponse as NextResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.*|icon.png|robots.txt|sitemap.xml).*)',
  ],
};
