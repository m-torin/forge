import { getAuthFlags } from "@repo/analytics-legacy";
import { auth } from "@repo/auth/server";
import { createRateLimiter, slidingWindow } from "@repo/security";

// Create rate limiter for protected endpoints
const protectedRateLimiter = createRateLimiter({
  limiter: slidingWindow(100, "1 m"), // 100 requests per minute for authenticated users
  prefix: "protected",
});

export async function GET(request: Request) {
  // Check authentication
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Apply rate limiting with user ID
  const { limit, remaining, reset, success } = await protectedRateLimiter.limit(
    session.user.id,
  );

  if (!success) {
    return new Response("Rate limit exceeded", {
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": new Date(reset).toISOString(),
      },
      status: 429,
    });
  }

  // Get auth feature flags for the user
  const authFlags = await getAuthFlags(session.user.id);

  // Example: Check if API keys are enabled for this user
  if (!authFlags.apiKeysEnabled) {
    return Response.json(
      {
        error: "API keys feature is not enabled for your account",
      },
      { status: 403 },
    );
  }

  // Return user data with feature flags
  return Response.json({
    features: {
      auth: authFlags,
    },
    organization: session.session.activeOrganizationId,
    rateLimit: {
      limit,
      remaining,
      reset: new Date(reset).toISOString(),
    },
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    },
  });
}
