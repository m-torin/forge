import { analytics } from "@repo/analytics-legacy";
import { auth } from "@repo/auth/server";
import { createRateLimiter, secure, slidingWindow } from "@repo/security";

// Stricter rate limiting for sign-up to prevent abuse
const signupRateLimiter = createRateLimiter({
  limiter: slidingWindow(3, "1 h"), // 3 sign-ups per hour per IP
  prefix: "signup",
});

export async function POST(request: Request) {
  const identifier =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  // Apply strict rate limiting
  const { limit, remaining, success } =
    await signupRateLimiter.limit(identifier);

  if (!success) {
    // Track rate limit exceeded
    analytics.capture("signup_rate_limit_exceeded", {
      ip: identifier,
    });

    return new Response("Too many sign-up attempts. Please try again later.", {
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
      },
      status: 429,
    });
  }

  try {
    // Use Arcjet to protect against bots
    await secure(
      [
        "CATEGORY:SEARCH_ENGINE", // Allow search engines
        "CATEGORY:PREVIEW", // Allow preview bots
      ],
      request,
    );
  } catch (error) {
    // Track bot detection
    analytics.capture("signup_bot_detected", {
      error: error instanceof Error ? error.message : "Unknown error",
      ip: identifier,
    });

    return Response.json(
      {
        error: "Access denied. Bot activity detected.",
      },
      { status: 403 },
    );
  }

  // Parse request body
  const body = await request.json();
  const { name, email, password } = body;

  try {
    // Create the user account
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    // Track successful sign-up
    analytics.capture("signup_success_api", {
      method: "email",
      userId: result.user?.id,
    });

    return Response.json(result);
  } catch (error) {
    // Track sign-up failure
    analytics.capture("signup_failed_api", {
      error: error instanceof Error ? error.message : "Unknown error",
      method: "email",
    });

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Sign-up failed",
      },
      { status: 400 },
    );
  }
}
