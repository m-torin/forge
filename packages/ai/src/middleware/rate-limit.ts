/**
 * Rate limiting middleware for AI requests
 *
 * Simple in-memory rate limiting implementation
 * For production, integrate with @upstash/ratelimit or @upstash/redis
 */

interface RateLimitConfig {
  requests?: number;
  window?: number; // in milliseconds
  identifier?: (request: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const rateLimitMiddleware = (config: RateLimitConfig = {}) => {
  const {
    requests = 100,
    window = 60000, // 1 minute
    identifier = (req: any) => req?.ip || req?.userId || 'anonymous',
    skipSuccessfulRequests = false,
    skipFailedRequests = true,
  } = config;

  return (next: any) => async (request: any) => {
    const key = identifier(request);
    const now = Date.now();

    // Get or initialize rate limit data
    let limitData = rateLimitStore.get(key);
    if (!limitData || now > limitData.resetTime) {
      limitData = { count: 0, resetTime: now + window };
      rateLimitStore.set(key, limitData);
    }

    // Check if limit exceeded
    if (limitData.count >= requests) {
      const error = new Error('Rate limit exceeded');
      (error as any).status = 429;
      (error as any).headers = {
        'X-RateLimit-Limit': requests,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': Math.ceil(limitData.resetTime / 1000),
      };
      throw error;
    }

    // Increment counter (before or after depending on config)
    if (!skipSuccessfulRequests) {
      limitData.count++;
    }

    try {
      const result = await next(request);

      // Update counter for successful requests if needed
      if (skipSuccessfulRequests) {
        // Don't count successful requests
      }

      return result;
    } catch (error) {
      // Handle failed requests
      if (!skipFailedRequests) {
        limitData.count++;
      }
      throw error;
    }
  };
};

// Export alias for index.ts
export const rateLimit = rateLimitMiddleware;
