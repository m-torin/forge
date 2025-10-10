/**
 * Rate Limit Provider
 * Implements rate limiting using Upstash Redis
 */

import { Ratelimit } from '@upstash/ratelimit';

import { redis } from '@repo/db-upstash-redis/server';

import { JsonObject, RateLimitConfig, RateLimitPattern } from '../../shared/types/index';
import { createProviderError, RateLimitError } from '../../shared/utils/errors';
// Note: Using internal cache implementation instead of @repo/mcp-server
// import { BoundedCache } from '@repo/mcp-server/utils';

// Enhanced cache implementation matching expected interface
interface CacheOptions {
  maxSize?: number;
  ttl?: number;
  enableAnalytics?: boolean;
}

class BoundedCache<T = any> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private maxSize: number;
  private ttl: number;
  private enableAnalytics: boolean;
  private stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };

  constructor(options: CacheOptions | number = {}) {
    if (typeof options === 'number') {
      this.maxSize = options;
      this.ttl = 0;
      this.enableAnalytics = false;
    } else {
      this.maxSize = options.maxSize || 1000;
      this.ttl = options.ttl || 0;
      this.enableAnalytics = options.enableAnalytics || false;
    }
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      if (this.enableAnalytics) this.stats.misses++;
      return undefined;
    }

    // Check TTL
    if (this.ttl > 0 && Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      if (this.enableAnalytics) this.stats.misses++;
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    if (this.enableAnalytics) this.stats.hits++;
    return entry.value;
  }

  set(key: string, value: T): void {
    const entry = { value, timestamp: Date.now() };

    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, entry);
    if (this.enableAnalytics) this.stats.sets++;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check TTL
    if (this.ttl > 0 && Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result && this.enableAnalytics) this.stats.deletes++;
    return result;
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  getAnalytics() {
    return { ...this.stats };
  }

  cleanup(): void {
    if (this.ttl === 0) return;

    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.cache.delete(key));
  }
}

export interface RateLimitProviderOptions {
  /** Rate limit algorithm */
  algorithm?: 'fixed-window' | 'sliding-window' | 'token-bucket';
  /** Default rate limit settings */
  defaultLimit?: {
    requests: number;
    window: number;
  };
  /** Prefix for Redis keys */
  keyPrefix?: string;
  /** Whether to enable Redis (uses @repo/db-prisma/redis) */
  enableRedis?: boolean;
}

export class RateLimitProvider {
  public readonly name = 'rate-limit';
  public readonly version = '1.0.0';

  private options: RateLimitProviderOptions;
  private rateLimiters: BoundedCache;
  private useRedis: boolean;

  private get redis() {
    return redis;
  }

  constructor(options: RateLimitProviderOptions) {
    this.options = {
      algorithm: 'sliding-window',
      defaultLimit: { requests: 10, window: 60 },
      keyPrefix: 'rl',
      enableRedis: true,
      ...options,
    };

    this.useRedis = this.options.enableRedis !== false;

    // Initialize bounded cache for rate limiters with TTL and size limits
    this.rateLimiters = new BoundedCache({
      maxSize: 1000, // Limit to 1000 rate limiters
      ttl: 10 * 60 * 1000, // 10 minutes TTL
      enableAnalytics: true,
    });
  }

  /**
   * Create provider from configuration
   */
  static fromConfig(config: RateLimitConfig): RateLimitProvider {
    return new RateLimitProvider({
      algorithm: config.config.algorithm,
      defaultLimit: config.config.defaultLimit,
      enableRedis: true,
    });
  }

  /**
   * Check if an operation is rate limited
   */
  async checkRateLimit(
    pattern: RateLimitPattern,
    context?: JsonObject,
  ): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: Date;
  }> {
    try {
      const rateLimiter = this.getRateLimiter(pattern);
      const key = pattern.keyGenerator ? pattern.keyGenerator(context) : pattern.getIdentifier;

      const result = await rateLimiter.limit(key);

      const response = {
        allowed: result.success,
        limit: result.limit,
        remaining: result.remaining,
        resetTime: new Date(result.reset),
      };

      if (!result.success && pattern.throwOnLimit) {
        throw new RateLimitError(
          `Rate limit exceeded for ${pattern.getIdentifier}`,
          pattern.tokens,
          pattern.interval,
          Math.ceil((result.reset - Date.now()) / 1000),
        );
      }

      return response;
    } catch (error: any) {
      if (error instanceof RateLimitError) {
        throw error;
      }

      throw createProviderError(
        `Failed to check rate limit for ${pattern.getIdentifier}`,
        this.name,
        'rate-limit',
        { originalError: error as Error },
      );
    }
  }

  /**
   * Clear all rate limiters
   */
  clearCache(): void {
    this.rateLimiters.clear();
  }

  /**
   * Create a rate limiting decorator
   */
  createRateLimitDecorator(pattern: RateLimitPattern) {
    // Capture the provider instance to reuse it
    const providerInstance = this;

    return function rateLimitDecorator<_T extends (...args: unknown[]) => Promise<unknown>>(
      _target: unknown,
      _propertyName: string,
      descriptor: PropertyDescriptor,
    ) {
      const method = descriptor.value;

      descriptor.value = async function (this: unknown, ...args: unknown[]) {
        // Reuse the provider instance instead of creating a new one
        return providerInstance.withRateLimit(pattern, () => method.apply(this, args));
      };

      return descriptor;
    };
  }

  /**
   * Get rate limit status for a key
   */
  async getRateLimitStatus(
    pattern: RateLimitPattern,
    context?: JsonObject,
  ): Promise<null | {
    current: number;
    limit: number;
    resetTime: Date;
  }> {
    try {
      const rateLimiter = this.getRateLimiter(pattern);
      const key = pattern.keyGenerator ? pattern.keyGenerator(context) : pattern.getIdentifier;

      // This would require additional methods from Upstash Ratelimit
      // For now, we'll use the limit check to get current status
      const result = await rateLimiter.limit(key);

      return {
        current: result.limit - result.remaining,
        limit: result.limit,
        resetTime: new Date(result.reset),
      };
    } catch (error: any) {
      throw createProviderError(
        `Failed to get rate limit status for ${pattern.getIdentifier}`,
        this.name,
        'rate-limit',
        { originalError: error as Error },
      );
    }
  }

  /**
   * Get statistics for all active rate limiters
   */
  getStats(): {
    activeLimiters: number;
    limiterTypes: Record<string, number>;
    cacheAnalytics?: any;
  } {
    const limiterTypes: Record<string, number> = {};

    for (const key of this.rateLimiters.keys()) {
      const parts = key.split('-');
      const algorithm = parts[parts.length - 1];
      limiterTypes[algorithm] = (limiterTypes[algorithm] || 0) + 1;
    }

    return {
      activeLimiters: this.rateLimiters.size,
      limiterTypes,
      cacheAnalytics: this.rateLimiters.getAnalytics(),
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    details?: JsonObject;
    responseTime: number;
    status: 'healthy' | 'unhealthy';
    timestamp: Date;
  }> {
    const startTime = Date.now();

    try {
      await this.redis.ping();

      return {
        details: {
          activeLimiters: this.rateLimiters.size,
          redis: 'healthy',
        },
        responseTime: Date.now() - startTime,
        status: 'healthy',
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        details: {
          activeLimiters: this.rateLimiters.size,
          error:
            error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error',
          redis: 'unhealthy',
        },
        responseTime: Date.now() - startTime,
        status: 'unhealthy',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  async resetRateLimit(identifier: string, key?: string): Promise<void> {
    try {
      const fullKey = key || identifier;
      await this.redis.del(`${this.options.keyPrefix}:${fullKey}`);
    } catch (error: any) {
      throw createProviderError(
        `Failed to reset rate limit for ${identifier}`,
        this.name,
        'rate-limit',
        { originalError: error as Error },
      );
    }
  }

  /**
   * Apply rate limiting to a function
   */
  async withRateLimit<T>(
    pattern: RateLimitPattern,
    fn: () => Promise<T>,
    context?: JsonObject,
  ): Promise<T> {
    const check = await this.checkRateLimit(pattern, context);

    if (!check.allowed) {
      if (pattern.throwOnLimit) {
        throw new RateLimitError(
          `Rate limit exceeded for ${pattern.getIdentifier}`,
          pattern.tokens,
          pattern.interval,
          Math.ceil((check.resetTime.getTime() - Date.now()) / 1000),
        );
      } else {
        throw new RateLimitError(
          `Rate limit exceeded for ${pattern.getIdentifier}`,
          pattern.tokens,
          pattern.interval,
          Math.ceil((check.resetTime.getTime() - Date.now()) / 1000),
        );
      }
    }

    return await fn();
  }

  /**
   * Create or get a rate limiter for a specific identifier
   */
  private getRateLimiter(pattern: RateLimitPattern): Ratelimit {
    const key = `${pattern.getIdentifier}-${pattern.tokens}-${pattern.interval}-${pattern.algorithm}`;

    const existingRateLimiter = this.rateLimiters.get(key);
    if (existingRateLimiter) {
      return existingRateLimiter;
    }

    let ratelimit: Ratelimit;

    switch (pattern.algorithm) {
      case 'fixed-window':
        ratelimit = new Ratelimit({
          limiter: Ratelimit.fixedWindow(pattern.tokens, `${pattern.interval}ms`),
          prefix: this.options.keyPrefix,
          redis: redis,
        });
        break;

      case 'sliding-window':
        ratelimit = new Ratelimit({
          limiter: Ratelimit.slidingWindow(pattern.tokens, `${pattern.interval}ms`),
          prefix: this.options.keyPrefix,
          redis: redis,
        });
        break;

      case 'token-bucket':
        ratelimit = new Ratelimit({
          limiter: Ratelimit.tokenBucket(pattern.tokens, `${pattern.interval}ms`, pattern.tokens),
          prefix: this.options.keyPrefix,
          redis: redis,
        });
        break;

      default:
        throw new Error(`Unsupported rate limit algorithm: ${pattern.algorithm}`);
    }

    this.rateLimiters.set(key, ratelimit);
    return ratelimit;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Clear rate limiter cache using bounded cache cleanup
    this.rateLimiters.cleanup();
    // Redis connections are automatically managed by Upstash
    return;
  }
}
