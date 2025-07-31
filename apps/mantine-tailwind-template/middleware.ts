import { internationalizationMiddleware } from '@repo/internationalization/server/next';
import { type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return internationalizationMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};