/**
 * Next.js server-side Upstash Redis client
 * Optimized for Next.js server components and API routes
 */

import { Ratelimit } from '@upstash/ratelimit';
import 'server-only';
import { createRateLimit, createServerClient, type UpstashRedisClient } from './server';
import type { RateLimitConfig, UpstashRedisConfig } from './types';

/**
 * Next.js optimized Redis client with singleton pattern
 */
class NextRedisClient {
  private static instance: UpstashRedisClient | null = null;
  private static rateLimiters = new Map<string, Ratelimit>();

  /**
   * Get singleton Redis client for Next.js
   */
  static getClient(config?: Partial<UpstashRedisConfig>): UpstashRedisClient {
    if (!this.instance) {
      this.instance = createServerClient({
        // Next.js specific defaults
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
        ...config,
      });
    }
    return this.instance;
  }

  /**
   * Get or create rate limiter for Next.js API routes
   */
  static getRateLimit(
    name: string,
    config: RateLimitConfig,
    redisConfig?: Partial<UpstashRedisConfig>,
  ): Ratelimit {
    if (!this.rateLimiters.has(name)) {
      const client = this.getClient(redisConfig);
      const rateLimit = createRateLimit(client.redis, config);
      this.rateLimiters.set(name, rateLimit);
    }
    return this.rateLimiters.get(name)!;
  }

  /**
   * Reset singleton (useful for testing)
   */
  static reset(): void {
    this.instance = null;
    this.rateLimiters.clear();
  }
}

/**
 * Get Next.js optimized Redis client
 */
export function getNextRedis(config?: Partial<UpstashRedisConfig>): UpstashRedisClient {
  return NextRedisClient.getClient(config);
}

/**
 * Next.js API route rate limiting middleware
 */
export function withRateLimit(
  rateLimitConfig: RateLimitConfig,
  options: {
    identifier?: (request: Request) => string;
    onRateLimit?: (request: Request) => Response;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  } = {},
) {
  const rateLimit = NextRedisClient.getRateLimit('api-default', rateLimitConfig);

  return (handler: (request: Request) => Promise<Response>) => {
    return async (request: Request): Promise<Response> => {
      // Extract identifier (IP, user ID, etc.)
      const identifier = options.identifier
        ? options.identifier(request)
        : getClientIdentifier(request);

      // Check rate limit
      const { success, limit, remaining, reset } = await rateLimit.limit(identifier);

      // Add rate limit headers
      const headers = new Headers({
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      });

      if (!success) {
        if (options.onRateLimit) {
          return options.onRateLimit(request);
        }

        return new Response(
          JSON.stringify({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.round((reset - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.round((reset - Date.now()) / 1000).toString(),
              ...Object.fromEntries(headers.entries()),
            },
          },
        );
      }

      // Execute handler
      const response = await handler(request);

      // Add rate limit headers to successful responses
      if (response.status < 400 || !options.skipSuccessfulRequests) {
        for (const [key, value] of headers.entries()) {
          response.headers.set(key, value);
        }
      }

      return response;
    };
  };
}

/**
 * Next.js server action with rate limiting
 */
export function createRateLimitedAction<T extends any[], R>(
  action: (...args: T) => Promise<R>,
  rateLimitConfig: RateLimitConfig,
  options: {
    identifier?: (...args: T) => string;
    onRateLimit?: (...args: T) => R | Promise<R>;
  } = {},
) {
  const rateLimit = NextRedisClient.getRateLimit('server-action', rateLimitConfig);

  return async (...args: T): Promise<R> => {
    'use server';

    // Extract identifier
    const identifier = options.identifier ? options.identifier(...args) : 'server-action-default';

    // Check rate limit
    const { success } = await rateLimit.limit(identifier);

    if (!success) {
      if (options.onRateLimit) {
        return await options.onRateLimit(...args);
      }
      throw new Error('Rate limit exceeded');
    }

    return await action(...args);
  };
}

/**
 * Next.js cached Redis operations
 */
export async function getCachedValue<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    tags?: string[];
    revalidate?: number;
  } = {},
): Promise<T> {
  const redis = getNextRedis();

  // Try to get from Redis first
  const cached = await redis.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch and cache
  const value = await fetcher();
  await redis.set(key, value, { ttl: options.ttl });

  return value;
}

/**
 * Next.js session management with Redis
 */
export function createNextSession(
  options: {
    ttl?: number;
    cookieName?: string;
    secure?: boolean;
  } = {},
) {
  const redis = getNextRedis();
  const sessionStore = redis.createSessionStore(options.ttl);

  return {
    async getSession(sessionId: string) {
      return await sessionStore.get(sessionId);
    },

    async setSession(sessionId: string, data: any) {
      await sessionStore.set(sessionId, data, options.ttl);
    },

    async destroySession(sessionId: string) {
      await sessionStore.destroy(sessionId);
    },

    async touchSession(sessionId: string) {
      await sessionStore.touch(sessionId, options.ttl);
    },
  };
}

/**
 * Next.js middleware helpers
 */
export function createRedisMiddleware(config?: Partial<UpstashRedisConfig>) {
  const redis = getNextRedis(config);

  return {
    /**
     * Check if IP is blocked
     */
    async isBlocked(ip: string): Promise<boolean> {
      return await redis.exists(`blocked:${ip}`);
    },

    /**
     * Block IP address
     */
    async blockIP(ip: string, ttl = 3600): Promise<void> {
      await redis.set(`blocked:${ip}`, true, { ttl });
    },

    /**
     * Unblock IP address
     */
    async unblockIP(ip: string): Promise<void> {
      await redis.del(`blocked:${ip}`);
    },

    /**
     * Track page views
     */
    async trackPageView(path: string, ip: string): Promise<void> {
      const today = new Date().toISOString().split('T')[0];
      await redis.redis.zincrby(`pageviews:${today}`, 1, path);
      await redis.redis.sadd(`visitors:${today}`, ip);
      await redis.expire(`pageviews:${today}`, 86400 * 7); // Keep for 7 days
      await redis.expire(`visitors:${today}`, 86400 * 7);
    },

    /**
     * Get popular pages
     */
    async getPopularPages(limit = 10): Promise<Array<{ path: string; views: number }>> {
      const today = new Date().toISOString().split('T')[0];
      const results = await redis.redis.zrevrange(`pageviews:${today}`, 0, limit - 1, {
        withScores: true,
      });

      const pages = [];
      for (let i = 0; i < results.length; i += 2) {
        pages.push({
          path: results[i] as string,
          views: results[i + 1] as number,
        });
      }

      return pages;
    },
  };
}

/**
 * Utility to extract client identifier from request
 */
function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = forwarded?.split(',')[0].trim() || realIp || cfConnectingIp || 'unknown';
  return ip;
}

/**
 * Common rate limit presets for Next.js apps
 */
export const nextRateLimits = {
  // API endpoints
  api: {
    strict: { requests: 10, window: '1m', algorithm: 'sliding-window' as const },
    moderate: { requests: 100, window: '1m', algorithm: 'sliding-window' as const },
    lenient: { requests: 1000, window: '1m', algorithm: 'sliding-window' as const },
  },

  // Authentication endpoints
  auth: {
    login: { requests: 5, window: '15m', algorithm: 'sliding-window' as const },
    signup: { requests: 3, window: '1h', algorithm: 'sliding-window' as const },
    passwordReset: { requests: 3, window: '1h', algorithm: 'sliding-window' as const },
  },

  // Content creation
  content: {
    posts: { requests: 10, window: '1h', algorithm: 'sliding-window' as const },
    comments: { requests: 30, window: '1h', algorithm: 'sliding-window' as const },
    uploads: { requests: 20, window: '1h', algorithm: 'sliding-window' as const },
  },
} as const;

/**
 * Default Next.js Redis client
 */
export const nextRedis = getNextRedis();

// Re-export server utilities
export { createRateLimit, safeRedisOperation } from './server';

// Re-export types
export type { RateLimitConfig, RedisResult, SessionStore, UpstashRedisConfig } from './server';
