import { internationalizationMiddleware } from '@repo/internationalization/middleware';

import type { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Run internationalization middleware first to handle locale routing
  const i18nResponse = await internationalizationMiddleware(request as any);

  // Return the i18n response directly (auth middleware temporarily disabled)
  return i18nResponse as any;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
