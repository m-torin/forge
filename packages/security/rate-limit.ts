/**
 * Rate limiting utilities using Upstash Redis
 * Uses shared Redis instance from @repo/db-prisma
 */

import { getServerClient } from '@repo/db-upstash-redis/server';
import { Ratelimit, type RatelimitConfig } from '@upstash/ratelimit';
import { safeEnv } from './env';

// Re-export Ratelimit helper functions for convenience
export const slidingWindow = Ratelimit.slidingWindow;
export const fixedWindow = Ratelimit.fixedWindow;
export const tokenBucket = Ratelimit.tokenBucket;

// Track if we've already logged the warning about missing Redis
let hasLoggedMissingRedisWarning = false;

/**
 * Create a rate limiter using the shared Redis instance
 * @param props - Rate limiter configuration excluding Redis instance
 * @returns Configured Ratelimit instance or no-op limiter if Redis unavailable
 */
export const createRateLimiter = (props: Omit<RatelimitConfig, 'redis'>): Ratelimit => {
  const env = safeEnv();

  // Check if Redis is properly configured
  if (!env.UPSTASH_REDIS_REST_TOKEN || !env.UPSTASH_REDIS_REST_URL) {
    // Log warning only once
    if (!hasLoggedMissingRedisWarning) {
      hasLoggedMissingRedisWarning = true;
    }

    // Return a no-op rate limiter that always allows requests
    return {
      getRemaining: async () => 999999,
      limit: async () => ({
        limit: 999999,
        remaining: 999999,
        reset: 0,
        success: true,
      }),
      resetUsedTokens: async () => {},
    } as any;
  }

  const redisClient = getServerClient();
  return new Ratelimit({
    limiter: props.limiter ?? Ratelimit.slidingWindow(10, '10 s'),
    prefix: props.prefix ?? 'forge',
    redis: redisClient.redis, // Access the raw Redis client
    analytics: props.analytics ?? false,
    ephemeralCache: props.ephemeralCache ?? undefined,
  });
};

/**
 * Default rate limiter configurations
 */
export const rateLimitConfigs = {
  // API endpoints - 100 requests per minute
  api: {
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:api',
  },

  // Authentication - 5 attempts per 15 minutes
  auth: {
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    prefix: 'ratelimit:auth',
  },

  // File uploads - 10 uploads per hour
  upload: {
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'ratelimit:upload',
  },

  // Webhook endpoints - 1000 requests per hour
  webhook: {
    limiter: Ratelimit.slidingWindow(1000, '1 h'),
    prefix: 'ratelimit:webhook',
  },

  // Search endpoints - 500 requests per minute
  search: {
    limiter: Ratelimit.slidingWindow(500, '1 m'),
    prefix: 'ratelimit:search',
  },
} as const;

/**
 * Pre-configured rate limiters
 */
export const rateLimiters = {
  api: createRateLimiter(rateLimitConfigs.api),
  auth: createRateLimiter(rateLimitConfigs.auth),
  upload: createRateLimiter(rateLimitConfigs.upload),
  webhook: createRateLimiter(rateLimitConfigs.webhook),
  search: createRateLimiter(rateLimitConfigs.search),
} as const;

/**
 * Rate limit result type
 */
export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
};

/**
 * Apply rate limiting to a request
 * @param identifier - Unique identifier for the request (e.g., IP address, user ID)
 * @param type - Type of rate limiter to use
 * @returns Rate limit result with success status and limit info
 */
export const applyRateLimit = async (
  identifier: string,
  type: keyof typeof rateLimiters = 'api',
): Promise<RateLimitResult> => {
  const limiter = rateLimiters[type];
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    retryAfter: result.success ? undefined : result.reset - Date.now(),
  };
};

/**
 * Check if a request is rate limited
 * @param identifier - Unique identifier for the request
 * @param type - Type of rate limiter to check
 * @returns True if request should be blocked due to rate limiting
 */
export const isRateLimited = async (
  identifier: string,
  type: keyof typeof rateLimiters = 'api',
): Promise<boolean> => {
  const result = await applyRateLimit(identifier, type);
  return !result.success;
};

/**
 * Get rate limit info without applying limits
 * @param identifier - Unique identifier for the request
 * @param type - Type of rate limiter to query
 * @returns Rate limit information excluding success status
 */
export const getRateLimitInfo = async (
  identifier: string,
  type: keyof typeof rateLimiters = 'api',
): Promise<Omit<RateLimitResult, 'success'>> => {
  const limiter = rateLimiters[type];
  const result = await limiter.limit(identifier);

  return {
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
};
