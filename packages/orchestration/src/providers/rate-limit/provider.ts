/**
 * Rate Limit Provider
 * Implements rate limiting using Upstash Redis
 */

import { Ratelimit } from '@upstash/ratelimit';

import { redis } from '@repo/database/redis/server';

import { JsonObject, RateLimitConfig, RateLimitPattern } from '../../shared/types/index';
import { createProviderError, RateLimitError } from '../../shared/utils/errors';

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
  /** Whether to enable Redis (uses @repo/database/redis) */
  enableRedis?: boolean;
}

export class RateLimitProvider {
  public readonly name = 'rate-limit';
  public readonly version = '1.0.0';

  private options: RateLimitProviderOptions;
  private rateLimiters = new Map<string, Ratelimit>();
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
    return function rateLimitDecorator<_T extends (...args: unknown[]) => Promise<unknown>>(
      _target: unknown,
      _propertyName: string,
      descriptor: PropertyDescriptor,
    ) {
      const method = descriptor.value;

      descriptor.value = async function (this: unknown, ...args: unknown[]) {
        const provider = new RateLimitProvider(
          (this as { options: RateLimitProviderOptions }).options,
        );
        return provider.withRateLimit(pattern, () => method.apply(this, args));
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
  } {
    const limiterTypes: Record<string, number> = {};

    for (const [key] of this.rateLimiters) {
      const parts = key.split('-');
      const algorithm = parts[parts.length - 1];
      limiterTypes[algorithm] = (limiterTypes[algorithm] || 0) + 1;
    }

    return {
      activeLimiters: this.rateLimiters.size,
      limiterTypes,
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
    // Clear rate limiter cache
    this.rateLimiters.clear();
    // Redis connections are automatically managed by Upstash
    return;
  }
}
