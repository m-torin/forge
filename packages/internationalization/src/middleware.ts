/**
 * Internationalization middleware for Next.js
 * Handles locale detection and routing using next-intl
 */

import createMiddleware from "next-intl/middleware";
import type { NextRequest, NextResponse } from "next/server";
import { routing } from "./routing";

// Create the internationalization middleware with our routing configuration
// The middleware may return undefined when no locale redirect is needed
export const internationalizationMiddleware: (
  request: NextRequest,
) => NextResponse | undefined = createMiddleware(routing);

// Export the middleware configuration for Next.js
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)", "/"],
};
