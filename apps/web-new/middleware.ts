import { authMiddleware } from '@repo/auth/middleware';

export const middleware = authMiddleware;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};