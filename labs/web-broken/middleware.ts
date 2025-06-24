import { internationalizationMiddleware } from "@repo/internationalization/server/next";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Next.js middleware for internationalization
 *
 * This middleware handles:
 * - Automatic locale detection from Accept-Language headers
 * - URL rewriting for localized routes
 * - Default locale handling (English doesn't get prefix)
 */
export function middleware(request: NextRequest): Response | NextResponse {
  try {
    // Type assertion is needed due to Next.js version compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return internationalizationMiddleware(request as any);
  } catch (error) {
    console.error("Middleware error:", error);
    // Return a basic response if middleware fails to prevent white screen
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
