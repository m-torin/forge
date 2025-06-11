import { internationalizationMiddleware } from "@repo/internationalization/middleware";

import type { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  return internationalizationMiddleware(request as any) as any;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.*|icon.png|robots.txt|sitemap.xml).*)",
  ],
};