/**
 * Advanced Rate Limiting Service with Upstash Redis
 * Provides sliding window, fixed window, and token bucket algorithms
 */

import { logError, logInfo, logWarn } from '@repo/observability/server/next';
import 'server-only';

import { safeEnv } from '../../env';

const env = safeEnv();

export type RateLimitAlgorithm = 'sliding-window' | 'fixed-window' | 'token-bucket';

export interface RateLimitConfig {
  /** Unique identifier for the rate limit */
  key: string;
  /** Maximum requests allowed */
  limit: number;
  /** Time window in milliseconds */
  window: number;
  /** Rate limiting algorithm to use */
  algorithm?: RateLimitAlgorithm;
  /** Skip rate limiting (useful for testing) */
  skip?: boolean;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Time until the limit resets (milliseconds) */
  resetTime: number;
  /** Total requests made in the current window */
  count: number;
  /** Whether rate limiting is enabled */
  enabled: boolean;
}

export interface RateLimitStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  increment(key: string, ttl?: number): Promise<number>;
  delete(key: string): Promise<void>;
}

/**
 * Redis storage implementation using Upstash
 */
class UpstashRedisStorage implements RateLimitStorage {
  private redis: any = null;

  private async getRedis() {
    if (this.redis) return this.redis;

    try {
      // Dynamic import to avoid bundling Redis in client
      const { Redis } = await import('@upstash/redis');

      if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
        throw new Error('Upstash Redis credentials not configured');
      }

      this.redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      });

      return this.redis;
    } catch (error) {
      logError(
        'Failed to initialize Upstash Redis',
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const redis = await this.getRedis();
      return await redis.get(key);
    } catch (error) {
      logError('Redis GET failed', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      const redis = await this.getRedis();
      if (ttl) {
        await redis.setex(key, Math.ceil(ttl / 1000), value);
      } else {
        await redis.set(key, value);
      }
    } catch (error) {
      logError('Redis SET failed', error instanceof Error ? error : new Error(String(error)));
    }
  }

  async increment(key: string, ttl?: number): Promise<number> {
    try {
      const redis = await this.getRedis();
      const result = await redis.incr(key);

      if (ttl && result === 1) {
        // Only set TTL on first increment
        await redis.expire(key, Math.ceil(ttl / 1000));
      }

      return result;
    } catch (error) {
      logError('Redis INCR failed', error instanceof Error ? error : new Error(String(error)));
      return 1; // Fallback to allow request
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const redis = await this.getRedis();
      await redis.del(key);
    } catch (error) {
      logError('Redis DEL failed', error instanceof Error ? error : new Error(String(error)));
    }
  }
}

/**
 * Memory storage fallback (for development/testing)
 */
class MemoryStorage implements RateLimitStorage {
  private store = new Map<string, { value: string; expires?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (item.expires && Date.now() > item.expires) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expires = ttl ? Date.now() + ttl : undefined;
    this.store.set(key, { value, expires });
  }

  async increment(key: string, ttl?: number): Promise<number> {
    const current = await this.get(key);
    const count = current ? parseInt(current, 10) + 1 : 1;
    await this.set(key, count.toString(), ttl);
    return count;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

/**
 * Advanced Rate Limiter class
 */
export class RateLimiter {
  private storage: RateLimitStorage;
  private enabled: boolean;

  constructor() {
    this.enabled = env.AUTH_FEATURES_RATE_LIMITING !== 'false';

    if (!this.enabled) {
      this.storage = new MemoryStorage();
      return;
    }

    // In production, Redis is required
    if (process.env.NODE_ENV === 'production') {
      if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
        logError('Redis configuration required for production rate limiting');
        throw new Error(
          'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production',
        );
      }
      this.storage = new UpstashRedisStorage();
      logInfo('Rate limiter initialized with Upstash Redis (production mode)');
    } else {
      // Development: Try Redis first, fallback to memory
      if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
        this.storage = new UpstashRedisStorage();
        logInfo('Rate limiter initialized with Upstash Redis (development mode)');
      } else {
        this.storage = new MemoryStorage();
        logWarn('Rate limiter using memory storage (development mode only)');
      }
    }
  }

  /**
   * Check if a request should be rate limited
   */
  async check(config: RateLimitConfig): Promise<RateLimitResult> {
    if (!this.enabled || config.skip) {
      return {
        allowed: true,
        remaining: config.limit,
        resetTime: 0,
        count: 0,
        enabled: false,
      };
    }

    try {
      switch (config.algorithm || 'sliding-window') {
        case 'sliding-window':
          return await this.slidingWindow(config);
        case 'fixed-window':
          return await this.fixedWindow(config);
        case 'token-bucket':
          return await this.tokenBucket(config);
        default:
          return await this.slidingWindow(config);
      }
    } catch (error) {
      logError(
        'Rate limiting check failed',
        error instanceof Error ? error : new Error(String(error)),
      );

      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: config.limit,
        resetTime: 0,
        count: 0,
        enabled: false,
      };
    }
  }

  /**
   * Sliding window rate limiting
   */
  private async slidingWindow(config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.window;
    const key = `rl:sw:${config.key}`;

    // Get current window data
    const data = await this.storage.get(key);
    const requests: number[] = data ? JSON.parse(data) : [];

    // Remove expired requests
    const validRequests = requests.filter(timestamp => timestamp > windowStart);

    const count = validRequests.length;
    const allowed = count < config.limit;

    if (allowed) {
      // Add current request
      validRequests.push(now);
      await this.storage.set(key, JSON.stringify(validRequests), config.window);
    }

    const oldestRequest = validRequests[0] || now;
    const resetTime = oldestRequest + config.window - now;

    return {
      allowed,
      remaining: Math.max(0, config.limit - count - (allowed ? 1 : 0)),
      resetTime: Math.max(0, resetTime),
      count: count + (allowed ? 1 : 0),
      enabled: true,
    };
  }

  /**
   * Fixed window rate limiting
   */
  private async fixedWindow(config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = Math.floor(now / config.window) * config.window;
    const key = `rl:fw:${config.key}:${windowStart}`;

    const count = await this.storage.increment(key, config.window);
    const allowed = count <= config.limit;

    const resetTime = windowStart + config.window - now;

    return {
      allowed,
      remaining: Math.max(0, config.limit - count),
      resetTime,
      count,
      enabled: true,
    };
  }

  /**
   * Token bucket rate limiting
   */
  private async tokenBucket(config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const key = `rl:tb:${config.key}`;

    // Get current bucket state
    const data = await this.storage.get(key);
    const bucket = data ? JSON.parse(data) : { tokens: config.limit, lastRefill: now };

    // Calculate tokens to add based on time passed
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor((timePassed / config.window) * config.limit);

    bucket.tokens = Math.min(config.limit, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    const allowed = bucket.tokens > 0;

    if (allowed) {
      bucket.tokens -= 1;
    }

    // Save updated bucket state
    await this.storage.set(key, JSON.stringify(bucket), config.window * 2);

    // Calculate reset time (when bucket will be full)
    const timeToFull = ((config.limit - bucket.tokens) / config.limit) * config.window;

    return {
      allowed,
      remaining: bucket.tokens,
      resetTime: timeToFull,
      count: config.limit - bucket.tokens,
      enabled: true,
    };
  }

  /**
   * Clear rate limit for a specific key
   */
  async clear(key: string): Promise<void> {
    await Promise.all([
      this.storage.delete(`rl:sw:${key}`),
      this.storage.delete(`rl:fw:${key}`),
      this.storage.delete(`rl:tb:${key}`),
    ]);
  }

  /**
   * Get rate limit status without incrementing
   */
  async status(config: RateLimitConfig): Promise<RateLimitResult> {
    const tempConfig = { ...config, skip: true };
    return await this.check(tempConfig);
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Common rate limiting configurations
 */
export const RateLimitPresets = {
  // Authentication attempts
  signIn: (identifier: string): RateLimitConfig => ({
    key: `auth:signin:${identifier}`,
    limit: 5,
    window: 15 * 60 * 1000, // 15 minutes
    algorithm: 'sliding-window',
  }),

  signUp: (identifier: string): RateLimitConfig => ({
    key: `auth:signup:${identifier}`,
    limit: 3,
    window: 60 * 60 * 1000, // 1 hour
    algorithm: 'fixed-window',
  }),

  // Password operations
  forgotPassword: (email: string): RateLimitConfig => ({
    key: `auth:forgot:${email}`,
    limit: 3,
    window: 60 * 60 * 1000, // 1 hour
    algorithm: 'sliding-window',
  }),

  resetPassword: (token: string): RateLimitConfig => ({
    key: `auth:reset:${token}`,
    limit: 3,
    window: 15 * 60 * 1000, // 15 minutes
    algorithm: 'fixed-window',
  }),

  // OTP operations
  sendOTP: (identifier: string): RateLimitConfig => ({
    key: `auth:otp:${identifier}`,
    limit: 5,
    window: 60 * 60 * 1000, // 1 hour
    algorithm: 'sliding-window',
  }),

  verifyOTP: (identifier: string): RateLimitConfig => ({
    key: `auth:verify:${identifier}`,
    limit: 10,
    window: 15 * 60 * 1000, // 15 minutes
    algorithm: 'token-bucket',
  }),

  // API usage
  apiGeneral: (userId: string): RateLimitConfig => ({
    key: `api:user:${userId}`,
    limit: 1000,
    window: 60 * 60 * 1000, // 1 hour
    algorithm: 'token-bucket',
  }),

  // Per-IP limits
  perIP: (ip: string, endpoint: string): RateLimitConfig => ({
    key: `ip:${ip}:${endpoint}`,
    limit: 100,
    window: 60 * 60 * 1000, // 1 hour
    algorithm: 'sliding-window',
  }),
} as const;
