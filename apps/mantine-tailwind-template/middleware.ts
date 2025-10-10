import { allFlags } from "#/lib/flags";
import { createFeatureFlagMiddleware } from "@repo/feature-flags/middleware";
import { internationalizationMiddleware } from "@repo/internationalization/middleware";
import { logInfo } from "@repo/observability";
import { type NextRequest, NextResponse } from "next/server";

// Create feature flag middleware with precomputation
const featureFlagMiddleware = createFeatureFlagMiddleware({
  flags: allFlags,
  generateVisitorId: true,
  visitorCookieName: "visitor-id",
});

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // Log middleware request handling for debugging
  logInfo("[Middleware] Processing request", {
    pathname,
    origin,
    userAgent: request.headers.get("user-agent")?.slice(0, 100),
  });

  // First, handle feature flags (includes visitor ID generation)
  // Type assertion needed due to Next.js canary version mismatch in monorepo
  let response = await featureFlagMiddleware(request as any);

  // Handle internationalization
  const i18nResponse = internationalizationMiddleware(request);

  // Log i18n middleware result details
  logInfo("[Middleware] I18n middleware result", {
    pathname,
    hasI18nResponse: !!i18nResponse,
    i18nResponseType: i18nResponse
      ? i18nResponse.headers.get("x-middleware-rewrite")
        ? "rewrite"
        : i18nResponse.headers.get("location")
          ? "redirect"
          : "unknown"
      : "none",
    rewriteUrl: i18nResponse?.headers.get("x-middleware-rewrite"),
    redirectUrl: i18nResponse?.headers.get("location"),
  });

  // If i18n middleware returns a response (redirect/rewrite), use it
  if (i18nResponse) {
    // Merge any cookies/headers from feature flags into i18n response
    if (response) {
      // Copy feature flag cookies and headers to i18n response
      response.cookies.getAll().forEach((cookie) => {
        i18nResponse.cookies.set(cookie.name, cookie.value, {
          httpOnly: cookie.httpOnly,
          maxAge: cookie.maxAge,
          path: cookie.path,
          sameSite: cookie.sameSite,
        });
      });

      response.headers.forEach((value, key) => {
        if (key.startsWith("x-")) {
          i18nResponse.headers.set(key, value);
        }
      });
    }

    logInfo("[Middleware] Returning i18n response", {
      pathname,
      finalUrl:
        i18nResponse.headers.get("x-middleware-rewrite") ||
        i18nResponse.headers.get("location"),
    });

    return i18nResponse;
  }

  // Return feature flags response if no i18n response
  logInfo("[Middleware] Returning feature flags response or next", {
    pathname,
    hasFeatureFlagsResponse: !!response,
  });

  return response || NextResponse.next();
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)", "/"],
};
