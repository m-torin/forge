/**
 * Rate limiting utilities for workflow orchestration
 * Uses Upstash Ratelimit for distributed rate limiting
 */

import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest } from 'next/server';

import { redis } from '@repo/database/redis/server';
import { logError, logInfo, logWarn } from '@repo/observability/server/next';

export interface RateLimitConfig {
  /** Maximum number of requests */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Whether to use Redis (uses @repo/database/redis) */
  useRedis?: boolean;
  /** Custom identifier function */
  getIdentifier?: (request: NextRequest) => string;
  /** Prefix for rate limit keys */
  prefix?: string;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Number of requests remaining in the window */
  remaining: number;
  /** Total limit for the window */
  limit: number;
  /** Time when the rate limit resets (ms) */
  reset: number;
  /** Reason for denial if not successful */
  reason?: string;
}

/**
 * Default identifier extractor - uses IP address
 */
function getDefaultIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a default identifier
  return 'anonymous';
}

/**
 * Check if Redis is available (uses shared instance from '@repo/database)
 */
function isRedisAvailable(): boolean {
  try {
    // Try to access the shared Redis instance
    return !!redis;
  } catch (error: any) {
    // Fire and forget logging
    logWarn('Redis instance not available', { error, component: 'RateLimit' });
    return false;
  }
}

/**
 * Create a rate limiter instance
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    maxRequests,
    windowMs,
    useRedis = true,
    getIdentifier = getDefaultIdentifier,
    prefix = 'workflow_api',
  } = config;

  // Check if Redis should be used and is available
  const shouldUseRedis = useRedis && isRedisAvailable();

  // If no Redis instance available, return a no-op rate limiter
  if (!shouldUseRedis) {
    if (process.env.NODE_ENV === 'development') {
      // Fire and forget logging
      logInfo('Rate limiting disabled', {
        reason: 'No Redis instance available',
        component: 'RateLimit',
      });
    }
    return {
      async limit(_request: NextRequest): Promise<RateLimitResult> {
        return {
          success: true,
          remaining: maxRequests,
          limit: maxRequests,
          reset: Date.now() + windowMs,
        };
      },
    };
  }

  // Create Upstash Ratelimit instance with sliding window using shared Redis
  const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
    prefix,
  });

  return {
    /**
     * Check if a request should be rate limited
     */
    async limit(request: NextRequest): Promise<RateLimitResult> {
      const identifier = getIdentifier(request);

      try {
        const result = await ratelimit.limit(identifier);

        return {
          success: result.success,
          remaining: result.remaining,
          limit: result.limit,
          reset: result.reset,
          reason: result.success ? undefined : 'Rate limit exceeded',
        };
      } catch (error: any) {
        // If rate limiting fails, allow the request but log the error
        // Fire and forget logging
        logError('Error checking rate limit', { error, component: 'RateLimit' });

        return {
          success: true,
          remaining: maxRequests,
          limit: maxRequests,
          reset: Date.now() + windowMs,
        };
      }
    },
  };
}

/**
 * Middleware helper to apply rate limiting to API routes
 */
export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const rateLimiter = createRateLimiter(config);
  return rateLimiter.limit(request);
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    ...(result.reason ? { 'X-RateLimit-Reason': result.reason } : {}),
  };
}
