/**
 * AI SDK v5 Rate Limiting with Upstash Redis
 *
 * Comprehensive rate limiting solution for AI API routes using sliding window
 * algorithms with Upstash Redis backend. Replaces custom AIRateLimiter
 * implementations with v5-standard patterns and provides production-ready
 * rate limiting with automatic fallbacks.
 *
 * @module RateLimit
 *
 * @example Basic API Route Usage
 * ```typescript
 * import { withRateLimit } from '@repo/ai/shared';
 * import { generateText } from 'ai';
 *
 * export async function POST(req: Request) {
 *   return withRateLimit(req, async () => {
 *     const { prompt } = await req.json();
 *     return await generateText({ model, prompt });
 *   });
 * }
 * ```
 *
 * @example Tiered Rate Limiting
 * ```typescript
 * import { withTieredRateLimit } from '@repo/ai/shared';
 *
 * export async function POST(req: Request) {
 *   const userTier = getUserTier(req); // 'public' | 'authenticated' | 'premium'
 *
 *   return withTieredRateLimit(req, async () => {
 *     // Your AI operation here
 *   }, userTier);
 * }
 * ```
 *
 * @example Custom Rate Limiting
 * ```typescript
 * import { AIRateLimit, rateLimitStrategies } from '@repo/ai/shared';
 *
 * const customLimiter = new AIRateLimit({
 *   requests: 50,
 *   window: '1 h',
 *   identifier: (req) => req.headers.get('x-api-key') ?? 'anonymous',
 * });
 *
 * const { success, remaining } = await customLimiter.limit('user123');
 * ```
 *
 * @since 1.0.0
 * @author AI SDK v5 Migration Team
 */

import { logError, logWarn } from '@repo/observability';
import { safeEnv } from '../../../env';

// Import Upstash Redis if available
let Redis: any;
try {
  Redis = require('@upstash/redis')?.Redis;
} catch {
  // Upstash not available, will use mock
}

/**
 * Mock Redis implementation for development environments
 *
 * Provides Redis-compatible interface using in-memory storage when Upstash
 * Redis is not available. Automatically used when UPSTASH_REDIS_* environment
 * variables are not configured.
 *
 * @class MockRedis
 * @private
 *
 * @remarks
 * - Uses Map-based in-memory storage
 * - Implements sliding window algorithm for rate limiting
 * - Automatically expires entries based on time windows
 * - Provides same interface as real Redis for seamless development
 */
class MockRedis {
  private cache = new Map<string, { count: number; reset: number; data: any }>();

  async incr(key: string): Promise<number> {
    const now = Date.now();
    const current = this.cache.get(key);

    if (!current || now > current.reset) {
      this.cache.set(key, { count: 1, reset: now + 60000, data: null }); // 1 minute window
      return 1;
    }

    current.count++;
    return current.count;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const current = this.cache.get(key);
    if (current) {
      current.reset = Date.now() + seconds * 1000;
    }
  }

  async set(key: string, value: any, options?: { ex?: number }): Promise<void> {
    const reset = options?.ex ? Date.now() + options.ex * 1000 : Date.now() + 60000;
    this.cache.set(key, { count: 0, reset, data: value });
  }

  async get(key: string): Promise<any> {
    const current = this.cache.get(key);
    if (!current || Date.now() > current.reset) {
      return null;
    }
    return current.data;
  }

  async del(key: string): Promise<number> {
    return this.cache.delete(key) ? 1 : 0;
  }

  // Sliding window implementation for mock
  async eval(script: string, keys: string[], args: string[]): Promise<any> {
    const key = keys[0];
    const window = parseInt(args[0]);
    const limit = parseInt(args[1]);
    const now = Date.now();

    // Simple sliding window logic for mock
    const current = this.cache.get(key) || { count: 0, reset: now + window * 1000, data: [] };
    const requests = (current.data as number[]) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < window * 1000);

    if (validRequests.length >= limit) {
      return [validRequests.length, Math.ceil((validRequests[0] + window * 1000 - now) / 1000)];
    }

    validRequests.push(now);
    this.cache.set(key, {
      count: validRequests.length,
      reset: now + window * 1000,
      data: validRequests,
    });

    return [validRequests.length, -1];
  }
}

/**
 * Resilient Redis client with Upstash integration
 *
 * Provides unified interface for both real Upstash Redis and mock Redis
 * implementations. Automatically detects available configuration and
 * falls back to mock implementation for development.
 *
 * @class ResilientRedisClient
 * @private
 *
 * @remarks
 * - Automatically configures based on environment variables
 * - Implements sliding window rate limiting using Lua scripts
 * - Provides fallback behavior for Redis failures
 * - Includes connection info and diagnostics
 *
 * @example Direct Usage (Advanced)
 * ```typescript
 * const redis = new ResilientRedisClient();
 * const [current, retryAfter] = await redis.slidingWindow('key', 60000, 10);
 * ```
 */
class ResilientRedisClient {
  private redis: any;
  private isMock: boolean;

  constructor() {
    const env = safeEnv();

    if (Redis && env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      this.redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      });
      this.isMock = false;
    } else {
      this.redis = new MockRedis();
      this.isMock = true;
      if (env.NODE_ENV === 'development') {
        logWarn(
          '[AI Rate Limit] Using mock Redis for development. Set UPSTASH_REDIS_* env vars for production.',
        );
      }
    }
  }

  /**
   * Lua script for sliding window rate limiting
   *
   * Implements efficient sliding window algorithm using Redis sorted sets.
   * Removes expired entries, checks current count against limit, and adds
   * new request if within limits.
   *
   * @private
   * @readonly
   *
   * @remarks
   * - Uses ZREMRANGEBYSCORE to remove expired entries
   * - Uses ZCARD to count current requests in window
   * - Uses ZADD to add new request timestamp
   * - Returns [current_count, retry_after_seconds]
   */
  private slidingWindowScript = `
    local key = KEYS[1]
    local window = tonumber(ARGV[1])
    local limit = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])
    
    -- Remove expired entries
    redis.call('ZREMRANGEBYSCORE', key, 0, now - window * 1000)
    
    -- Count current entries
    local current = redis.call('ZCARD', key)
    
    if current >= limit then
        -- Get the oldest entry to calculate retry after
        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        local retry_after = math.ceil((oldest[2] + window * 1000 - now) / 1000)
        return {current, retry_after}
    end
    
    -- Add current request
    redis.call('ZADD', key, now, now)
    redis.call('EXPIRE', key, window)
    
    return {current + 1, -1}
  `;

  async slidingWindow(key: string, windowMs: number, limit: number): Promise<[number, number]> {
    const now = Date.now();
    const windowSeconds = Math.ceil(windowMs / 1000);

    if (this.isMock) {
      return await this.redis.eval(
        this.slidingWindowScript,
        [key],
        [windowSeconds.toString(), limit.toString(), now.toString()],
      );
    }

    try {
      const result = await this.redis.eval(
        this.slidingWindowScript,
        [key],
        [windowSeconds.toString(), limit.toString(), now.toString()],
      );
      return result as [number, number];
    } catch (error) {
      logWarn('[AI Rate Limit] Redis error, falling back to allow:', error);
      return [0, -1]; // Fail open
    }
  }

  async get(key: string): Promise<any> {
    return await this.redis.get(key);
  }

  async set(key: string, value: any, options?: { ex?: number }): Promise<void> {
    await this.redis.set(key, value, options);
  }

  async incr(key: string): Promise<number> {
    return await this.redis.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds);
  }

  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }

  getInfo() {
    return {
      type: this.isMock ? 'mock' : 'upstash',
      connected: true,
    };
  }
}

/**
 * Rate limiting configuration interface
 *
 * Defines the configuration options for rate limiting behavior,
 * following AI SDK v5 patterns for consistency and extensibility.
 *
 * @interface RateLimitConfig
 *
 * @property requests - Maximum number of requests allowed in the time window
 * @property window - Time window for rate limiting (e.g., '1 m', '1 h', '1 d')
 * @property identifier - Function to extract unique identifier from request
 *
 * @example Basic Configuration
 * ```typescript
 * const config: RateLimitConfig = {
 *   requests: 10,
 *   window: '1 m',
 *   identifier: (req) => req.headers.get('x-forwarded-for') ?? 'anonymous'
 * };
 * ```
 *
 * @example Advanced Identifier
 * ```typescript
 * const config: RateLimitConfig = {
 *   requests: 100,
 *   window: '1 h',
 *   identifier: async (req) => {
 *     const apiKey = req.headers.get('authorization');
 *     return apiKey ? await getUserIdFromApiKey(apiKey) : 'anonymous';
 *   }
 * };
 * ```
 */
export interface RateLimitConfig {
  requests: number;
  window: string;
  identifier: (req: Request) => string | Promise<string>;
}

/**
 * AI Rate Limiting class for API protection
 *
 * Implements sophisticated rate limiting using sliding window algorithms
 * with Redis backend. Provides configurable limits, automatic fallbacks,
 * and detailed response information for API consumers.
 *
 * @class AIRateLimit
 *
 * @example Basic Usage
 * ```typescript
 * const limiter = new AIRateLimit({
 *   requests: 20,
 *   window: '1 m',
 * });
 *
 * const result = await limiter.limit('user123');
 * if (!result.success) {
 *   console.log(`Rate limited. Retry after ${result.retryAfter} seconds`);
 * }
 * ```
 *
 * @example Custom Configuration
 * ```typescript
 * const limiter = new AIRateLimit({
 *   requests: 100,
 *   window: '1 h',
 *   identifier: (req) => req.headers.get('x-api-key') ?? 'anonymous',
 * });
 * ```
 */
export class AIRateLimit {
  private redis: ResilientRedisClient;
  public config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.redis = new ResilientRedisClient();

    this.config = {
      requests: config.requests ?? 10,
      window: config.window ?? '1 m',
      identifier:
        config.identifier ??
        ((req: Request) =>
          req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous'),
    };
  }

  async limit(identifier: string): Promise<{
    success: boolean;
    remaining: number;
    reset: Date;
    retryAfter?: number;
    info?: any;
  }> {
    const key = `ai_rate_limit:${identifier}`;
    const now = Date.now();
    const windowMs = this.parseWindow(this.config.window);

    try {
      // Use sliding window for more accurate rate limiting
      const [current, retryAfter] = await this.redis.slidingWindow(
        key,
        windowMs,
        this.config.requests,
      );

      const remaining = Math.max(0, this.config.requests - current);
      const reset = new Date(now + windowMs);

      if (retryAfter > 0) {
        return {
          success: false,
          remaining: 0,
          reset,
          retryAfter,
          info: this.redis.getInfo(),
        };
      }

      return {
        success: true,
        remaining,
        reset,
        info: this.redis.getInfo(),
      };
    } catch (error) {
      logError('[AI Rate Limit] Error, allowing request:', error);
      // Fail open - allow request if rate limiting fails
      return {
        success: true,
        remaining: this.config.requests,
        reset: new Date(now + windowMs),
        info: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  }

  private parseWindow(window: string): number {
    const match = window.match(/^(\d+)\s*([smhd])$/);
    if (!match) return 60000; // Default 1 minute

    const [, num, unit] = match;
    const value = parseInt(num, 10);

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 60000;
    }
  }
}

// Default rate limiter following AI SDK v5 patterns
export const aiRateLimit = new AIRateLimit({
  requests: 10,
  window: '1 m',
});

/**
 * Advanced Rate Limiting Strategies
 *
 * Pre-configured rate limiting instances for common use cases and user tiers.
 * These strategies provide different limits based on user authentication level
 * and usage patterns.
 *
 * @namespace rateLimitStrategies
 *
 * @example Strategy Usage
 * ```typescript
 * import { rateLimitStrategies, withRateLimit } from '@repo/ai/shared';
 *
 * // Use different strategies based on user tier
 * const strategy = user.isPremium
 *   ? rateLimitStrategies.premium
 *   : user.isAuthenticated
 *     ? rateLimitStrategies.authenticated
 *     : rateLimitStrategies.public;
 *
 * return withRateLimit(req, handler, strategy);
 * ```
 *
 * @example Development Usage
 * ```typescript
 * // Use generous limits for development
 * const devLimiter = rateLimitStrategies.development;
 * const result = await devLimiter.limit('dev-user');
 * ```
 */
export const rateLimitStrategies = {
  // Conservative limits for public APIs
  public: new AIRateLimit({
    requests: 5,
    window: '1 m',
  }),

  // Higher limits for authenticated users
  authenticated: new AIRateLimit({
    requests: 20,
    window: '1 m',
  }),

  // Premium user limits
  premium: new AIRateLimit({
    requests: 100,
    window: '1 m',
  }),

  // Development limits (generous)
  development: new AIRateLimit({
    requests: 1000,
    window: '1 m',
  }),

  // Burst limits for short periods
  burst: new AIRateLimit({
    requests: 10,
    window: '10 s',
  }),
};

/**
 * Rate limiting middleware for API routes with strategy selection
 *
 * Wraps an API route handler with rate limiting protection. Automatically
 * checks rate limits before executing the handler and returns appropriate
 * error responses when limits are exceeded.
 *
 * @template T - Return type of the handler function
 *
 * @param req - Incoming HTTP request
 * @param handler - API route handler to protect with rate limiting
 * @param strategy - Rate limiting strategy to use (defaults to global aiRateLimit)
 *
 * @returns Promise resolving to handler result or rate limit error response
 *
 * @example Basic API Protection
 * ```typescript
 * import { withRateLimit } from '@repo/ai/shared';
 *
 * export async function POST(req: Request) {
 *   return withRateLimit(req, async () => {
 *     const { prompt } = await req.json();
 *     return await generateText({ model, prompt });
 *   });
 * }
 * ```
 *
 * @example Custom Strategy
 * ```typescript
 * import { withRateLimit, rateLimitStrategies } from '@repo/ai/shared';
 *
 * export async function POST(req: Request) {
 *   return withRateLimit(req, async () => {
 *     // Handler logic
 *   }, rateLimitStrategies.premium);
 * }
 * ```
 *
 * @see {@link withTieredRateLimit} For automatic tier selection
 * @see {@link rateLimitStrategies} For available strategies
 */
export async function withRateLimit<T>(
  req: Request,
  handler: () => Promise<T>,
  strategy: AIRateLimit = aiRateLimit,
): Promise<T | Response> {
  const identifier = await strategy.config.identifier(req);
  const { success, retryAfter, remaining, info } = await strategy.limit(identifier);

  if (!success) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter,
        info: info?.type,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(strategy.config.requests),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + (retryAfter || 60)),
        },
      },
    );
  }

  return handler();
}

/**
 * Advanced rate limiting with multiple tiers
 *
 * Automatically selects appropriate rate limiting strategy based on user tier.
 * Provides convenient interface for implementing tiered API access without
 * manual strategy selection.
 *
 * @template T - Return type of the handler function
 *
 * @param req - Incoming HTTP request
 * @param handler - API route handler to protect with rate limiting
 * @param userTier - User tier determining rate limit level
 *
 * @returns Promise resolving to handler result or rate limit error response
 *
 * @example Tiered API Route
 * ```typescript
 * import { withTieredRateLimit } from '@repo/ai/shared';
 *
 * export async function POST(req: Request) {
 *   const user = await authenticateUser(req);
 *   const tier = user?.subscription?.tier ?? 'public';
 *
 *   return withTieredRateLimit(req, async () => {
 *     // AI operation with appropriate rate limits
 *     return await generateText({ model, prompt });
 *   }, tier);
 * }
 * ```
 *
 * @example Dynamic Tier Selection
 * ```typescript
 * const getUserTier = (req: Request): 'public' | 'authenticated' | 'premium' => {
 *   const apiKey = req.headers.get('authorization');
 *   if (!apiKey) return 'public';
 *
 *   const user = validateApiKey(apiKey);
 *   return user?.isPremium ? 'premium' : 'authenticated';
 * };
 *
 * export async function POST(req: Request) {
 *   const tier = getUserTier(req);
 *   return withTieredRateLimit(req, handler, tier);
 * }
 * ```
 *
 * @see {@link rateLimitStrategies} For tier-specific rate limits
 */
export async function withTieredRateLimit<T>(
  req: Request,
  handler: () => Promise<T>,
  userTier: 'public' | 'authenticated' | 'premium' | 'development' = 'public',
): Promise<T | Response> {
  const strategy = rateLimitStrategies[userTier];
  return withRateLimit(req, handler, strategy);
}

/**
 * Rate limiting with custom identifier
 *
 * Applies rate limiting using a custom identifier instead of extracting
 * it from the request. Useful for user-based rate limiting, API key limits,
 * or other custom identification schemes.
 *
 * @template T - Return type of the handler function
 *
 * @param identifier - Custom identifier for rate limiting (e.g., user ID, API key)
 * @param handler - Function to execute if rate limit allows
 * @param strategy - Rate limiting strategy to use (defaults to global aiRateLimit)
 *
 * @returns Promise resolving to handler result or rate limit error response
 *
 * @example User-based Rate Limiting
 * ```typescript
 * import { withCustomRateLimit } from '@repo/ai/shared';
 *
 * export async function processUserRequest(userId: string, prompt: string) {
 *   return withCustomRateLimit(userId, async () => {
 *     return await generateText({ model, prompt });
 *   });
 * }
 * ```
 *
 * @example API Key Rate Limiting
 * ```typescript
 * const apiKey = req.headers.get('x-api-key');
 * if (!apiKey) throw new Error('API key required');
 *
 * return withCustomRateLimit(apiKey, async () => {
 *   // Protected operation
 * }, rateLimitStrategies.premium);
 * ```
 *
 * @see {@link withRateLimit} For request-based rate limiting
 * @see {@link rateLimitStrategies} For available strategies
 */
export async function withCustomRateLimit<T>(
  identifier: string,
  handler: () => Promise<T>,
  strategy: AIRateLimit = aiRateLimit,
): Promise<T | Response> {
  const { success, retryAfter, remaining } = await strategy.limit(identifier);

  if (!success) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter,
        identifier: identifier.substring(0, 8) + '...',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Remaining': String(remaining),
        },
      },
    );
  }

  return handler();
}

/**
 * Get rate limit status without incrementing counter
 *
 * Retrieves current rate limit status for an identifier without consuming
 * a request from their allowance. Useful for displaying rate limit information
 * to API consumers or for monitoring purposes.
 *
 * @param identifier - Identifier to check rate limit status for
 * @param strategy - Rate limiting strategy to check against
 *
 * @returns Promise resolving to current rate limit status
 *
 * @remarks
 * This is a read-only operation that doesn't affect rate limit counters.
 * In production implementations, this would use separate Redis commands
 * to avoid incrementing the request count.
 *
 * @example Status Check
 * ```typescript
 * import { getRateLimitStatus } from '@repo/ai/shared';
 *
 * const status = await getRateLimitStatus('user123');
 * console.log(`Remaining requests: ${status.remaining}`);
 * console.log(`Reset time: ${status.reset}`);
 * ```
 *
 * @example API Info Endpoint
 * ```typescript
 * export async function GET(req: Request) {
 *   const userId = getUserId(req);
 *   const status = await getRateLimitStatus(userId);
 *
 *   return Response.json({
 *     rateLimits: {
 *       requests: status.requests,
 *       remaining: status.remaining,
 *       resetTime: status.reset.toISOString(),
 *       window: status.window,
 *     },
 *   });
 * }
 * ```
 *
 * @todo Implement true read-only Redis operations for production use
 */
export async function getRateLimitStatus(
  identifier: string,
  strategy: AIRateLimit = aiRateLimit,
): Promise<{
  requests: number;
  remaining: number;
  reset: Date;
  window: string;
  info: any;
}> {
  // This is a read-only check - in a real implementation,
  // you'd need a separate Redis command for this
  return {
    requests: strategy.config.requests,
    remaining: strategy.config.requests, // Placeholder
    reset: new Date(Date.now() + strategy['parseWindow'](strategy.config.window)),
    window: strategy.config.window,
    info: strategy['redis'].getInfo(),
  };
}
