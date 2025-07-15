import { allFlags } from '#/lib/flags';
import { createFeatureFlagMiddleware } from '@repo/feature-flags/middleware';
import { internationalizationMiddleware } from '@repo/internationalization/server/next';
import { type NextRequest, NextResponse } from 'next/server';

// Create feature flag middleware with precomputation
const featureFlagMiddleware = createFeatureFlagMiddleware({
  flags: allFlags,
  generateVisitorId: true,
  visitorCookieName: 'visitor-id',
});

export async function middleware(request: NextRequest) {
  // First, handle feature flags (includes visitor ID generation)
  let response = await featureFlagMiddleware(request);

  // Then handle internationalization
  const i18nResponse = internationalizationMiddleware(request);

  // If i18n middleware returns a response (redirect/rewrite), use it
  if (i18nResponse) {
    // Merge any cookies/headers from feature flags into i18n response
    if (response) {
      // Copy feature flag cookies and headers to i18n response
      response.cookies.getAll().forEach(cookie => {
        i18nResponse.cookies.set(cookie.name, cookie.value, {
          httpOnly: cookie.httpOnly,
          maxAge: cookie.maxAge,
          path: cookie.path,
          sameSite: cookie.sameSite,
        });
      });

      response.headers.forEach((value, key) => {
        if (key.startsWith('x-')) {
          i18nResponse.headers.set(key, value);
        }
      });
    }
    return i18nResponse;
  }

  // Return feature flags response if no i18n response
  return response || NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
