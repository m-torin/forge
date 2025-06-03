import { type NextMiddleware, NextResponse } from "next/server";

import { authMiddleware as betterAuthMiddleware } from "@repo/auth/middleware";
import { internationalizationMiddleware } from "@repo/internationalization/middleware";
import { parseError } from "@repo/observability/error";
import { secure } from "@repo/security";
import { noseconeMiddleware, noseconeOptions } from "@repo/security/middleware";

import { env } from "./env";

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets and Posthog ingest
  matcher: ["/((?!_next/static|_next/image|ingest|favicon.ico).*)"],
  runtime: "nodejs",
};

const securityHeaders = noseconeMiddleware(noseconeOptions);

// Use auth middleware from auth package

const middleware: NextMiddleware = async (request) => {
  // Apply i18n middleware first to handle URL rewriting
  const i18nResponse = internationalizationMiddleware(request);

  // If i18n middleware returns a response, it means it's either:
  // 1. A redirect (e.g., / -> /en)
  // 2. A rewrite (e.g., /about -> /en/about)
  if (i18nResponse) {
    // For redirects, we return immediately
    const isRedirect = i18nResponse.status >= 300 && i18nResponse.status < 400;
    if (isRedirect) {
      return i18nResponse;
    }

    // For rewrites, we need to continue processing but with the rewritten request
    // The i18n middleware has already set up the rewrite, so we can continue
  }

  // Check auth after i18n processing
  const authHandler = betterAuthMiddleware();
  const authResponse = await authHandler(request);
  // If auth middleware returns a response, use it
  if (authResponse) {
    return authResponse;
  }

  // If i18n returned a rewrite response, return it now after auth check
  if (i18nResponse) {
    return i18nResponse;
  }

  if (!env.ARCJET_KEY) {
    return NextResponse.next();
  }

  try {
    await secure(
      [
        // See https://docs.arcjet.com/bot-protection/identifying-bots
        "CATEGORY:SEARCH_ENGINE", // Allow search engines
        "CATEGORY:PREVIEW", // Allow preview links to show OG images
        "CATEGORY:MONITOR", // Allow uptime monitoring services
      ],
      request,
    );

    return NextResponse.next();
  } catch (error) {
    const message = parseError(error);

    return NextResponse.json({ error: message }, { status: 403 });
  }
};

export default middleware;
