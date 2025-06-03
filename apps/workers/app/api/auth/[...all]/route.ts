import { auth } from '@repo/auth/server';
import { createRateLimiter, slidingWindow } from '@repo/security';

// Create a rate limiter for auth endpoints
const authRateLimiter = createRateLimiter({
  limiter: slidingWindow(10, '1 m'), // 10 requests per minute
  prefix: 'workers-auth',
});

// Wrap auth handlers with rate limiting
const rateLimitedAuth = async (request: Request) => {
  // Get identifier from request (IP or user ID)
  const identifier =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';

  // Check rate limit
  const { limit, remaining, reset, success } = await authRateLimiter.limit(identifier);

  if (!success) {
    return new Response('Workers auth rate limit exceeded', {
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      },
      status: 429,
    });
  }

  // Pass through to auth handler
  return auth(request);
};

export { rateLimitedAuth as GET, rateLimitedAuth as POST };
