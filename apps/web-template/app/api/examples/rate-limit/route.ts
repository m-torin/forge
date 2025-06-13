import { NextResponse } from 'next/server';

import { createRateLimiter, slidingWindow } from '@repo/security/server/next';

// Create a rate limiter with 5 requests per 60 seconds
const rateLimiter = createRateLimiter({
  limiter: slidingWindow(5, '60 s'),
  prefix: 'api-example',
});

export async function GET(request: any) {
  // Get IP address from request headers
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';

  // Check rate limit
  const { limit, remaining, reset, success } = await rateLimiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        },
        status: 429,
      },
    );
  }

  // Return successful response with rate limit headers
  return NextResponse.json(
    {
      message: 'Hello from rate-limited API!',
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      },
    },
  );
}

export async function POST(request: any) {
  // Example of using the secure function for bot protection
  try {
    const { secure } = await import('@repo/security/server/next');

    // Allow only specific bots, block all others
    await secure(['CATEGORY:SEARCH_ENGINE'], request);

    // If we get here, the request passed security checks
    return NextResponse.json({
      data: await request.json(),
      message: 'POST request successful',
    });
  } catch (error: any) {
    // Security check failed
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message || 'Unknown error' : 'Security check failed',
      },
      { status: 403 },
    );
  }
}
