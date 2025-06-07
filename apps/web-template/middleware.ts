import { authMiddleware } from "@repo/auth/middleware";
import { internationalizationMiddleware } from "@repo/internationalization/middleware";

import type { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Run internationalization middleware first to handle locale routing
  const i18nResponse = await internationalizationMiddleware(request as any);

  // If i18n middleware returned a response (redirect), use it
  if (
    i18nResponse.status !== 200 ||
    i18nResponse.headers.get("x-middleware-rewrite")
  ) {
    return i18nResponse as any;
  }

  // Otherwise, run auth middleware
  return authMiddleware(request as any) as any;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
