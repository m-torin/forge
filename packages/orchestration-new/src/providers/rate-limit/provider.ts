/**
 * Rate Limit Provider
 * Implements rate limiting using Upstash Redis
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import { createProviderError, RateLimitError } from '../../shared/utils/errors.js';

import type { RateLimitConfig, RateLimitPattern } from '../../shared/types/index.js';

export interface RateLimitProviderOptions {
  /** Rate limit algorithm */
  algorithm?: 'sliding-window' | 'fixed-window' | 'token-bucket';
  /** Default rate limit settings */
  defaultLimit?: {
    requests: number;
    window: number;
  };
  /** Prefix for Redis keys */
  keyPrefix?: string;
  /** Redis configuration */
  redis: {
    url: string;
    token?: string;
  };
}

export class RateLimitProvider {
  public readonly name = 'rate-limit';
  public readonly version = '1.0.0';

  private redis: Redis;
  private rateLimiters = new Map<string, Ratelimit>();
  private options: RateLimitProviderOptions;

  constructor(options: RateLimitProviderOptions) {
    this.options = {
      algorithm: 'sliding-window',
      defaultLimit: { requests: 10, window: 60 },
      keyPrefix: 'rl',
      ...options,
    };

    this.redis = new Redis({
      url: options.redis.url,
      token: options.redis.token,
    });
  }

  /**
   * Create provider from configuration
   */
  static fromConfig(config: RateLimitConfig): RateLimitProvider {
    return new RateLimitProvider({
      algorithm: config.config.algorithm,
      defaultLimit: config.config.defaultLimit,
      redis: {
        url: config.config.redisUrl,
        token: config.config.redisToken,
      },
    });
  }

  /**
   * Create or get a rate limiter for a specific identifier
   */
  private getRateLimiter(pattern: RateLimitPattern): Ratelimit {
    const key = `${pattern.identifier}-${pattern.tokens}-${pattern.interval}-${pattern.algorithm}`;
    
    if (this.rateLimiters.has(key)) {
      return this.rateLimiters.get(key)!;
    }

    let ratelimit: Ratelimit;

    switch (pattern.algorithm) {
      case 'sliding-window':
        ratelimit = new Ratelimit({
          limiter: Ratelimit.slidingWindow(pattern.tokens, `${pattern.interval}ms`),
          prefix: this.options.keyPrefix,
          redis: this.redis,
        });
        break;

      case 'fixed-window':
        ratelimit = new Ratelimit({
          limiter: Ratelimit.fixedWindow(pattern.tokens, `${pattern.interval}ms`),
          prefix: this.options.keyPrefix,
          redis: this.redis,
        });
        break;

      case 'token-bucket':
        ratelimit = new Ratelimit({
          limiter: Ratelimit.tokenBucket(pattern.tokens, `${pattern.interval}ms`, pattern.tokens),
          prefix: this.options.keyPrefix,
          redis: this.redis,
        });
        break;

      default:
        throw new Error(`Unsupported rate limit algorithm: ${pattern.algorithm}`);
    }

    this.rateLimiters.set(key, ratelimit);
    return ratelimit;
  }

  /**
   * Check if an operation is rate limited
   */
  async checkRateLimit(pattern: RateLimitPattern, context?: any): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: Date;
  }> {
    try {
      const rateLimiter = this.getRateLimiter(pattern);
      const key = pattern.keyGenerator ? pattern.keyGenerator(context) : pattern.identifier;
      
      const result = await rateLimiter.limit(key);
      
      const response = {
        allowed: result.success,
        limit: result.limit,
        remaining: result.remaining,
        resetTime: new Date(result.reset),
      };

      if (!result.success && pattern.throwOnLimit) {
        throw new RateLimitError(
          `Rate limit exceeded for ${pattern.identifier}`,
          pattern.tokens,
          pattern.interval,
          Math.ceil((result.reset - Date.now()) / 1000)
        );
      }

      return response;
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      
      throw createProviderError(
        `Failed to check rate limit for ${pattern.identifier}`,
        this.name,
        'rate-limit',
        { originalError: error as Error }
      );
    }
  }

  /**
   * Apply rate limiting to a function
   */
  async withRateLimit<T>(
    pattern: RateLimitPattern,
    fn: () => Promise<T>,
    context?: any
  ): Promise<T> {
    const check = await this.checkRateLimit(pattern, context);
    
    if (!check.allowed) {
      if (pattern.throwOnLimit) {
        throw new RateLimitError(
          `Rate limit exceeded for ${pattern.identifier}`,
          pattern.tokens,
          pattern.interval,
          Math.ceil((check.resetTime.getTime() - Date.now()) / 1000)
        );
      } else {
        throw new RateLimitError(
          `Rate limit exceeded for ${pattern.identifier}`,
          pattern.tokens,
          pattern.interval,
          Math.ceil((check.resetTime.getTime() - Date.now()) / 1000)
        );
      }
    }

    return await fn();
  }

  /**
   * Reset rate limit for a specific key
   */
  async resetRateLimit(identifier: string, key?: string): Promise<void> {
    try {
      const fullKey = key || identifier;
      await this.redis.del(`${this.options.keyPrefix}:${fullKey}`);
    } catch (error) {
      throw createProviderError(
        `Failed to reset rate limit for ${identifier}`,
        this.name,
        'rate-limit',
        { originalError: error as Error }
      );
    }
  }

  /**
   * Get rate limit status for a key
   */
  async getRateLimitStatus(pattern: RateLimitPattern, context?: any): Promise<{
    current: number;
    limit: number;
    resetTime: Date;
  } | null> {
    try {
      const rateLimiter = this.getRateLimiter(pattern);
      const key = pattern.keyGenerator ? pattern.keyGenerator(context) : pattern.identifier;
      
      // This would require additional methods from Upstash Ratelimit
      // For now, we'll use the limit check to get current status
      const result = await rateLimiter.limit(key);
      
      return {
        current: result.limit - result.remaining,
        limit: result.limit,
        resetTime: new Date(result.reset),
      };
    } catch (error) {
      throw createProviderError(
        `Failed to get rate limit status for ${pattern.identifier}`,
        this.name,
        'rate-limit',
        { originalError: error as Error }
      );
    }
  }

  /**
   * Create a rate limiting decorator
   */
  createRateLimitDecorator(pattern: RateLimitPattern) {
    return function rateLimitDecorator<T extends (...args: any[]) => Promise<any>>(
      target: any,
      propertyName: string,
      descriptor: PropertyDescriptor
    ) {
      const method = descriptor.value;
      
      descriptor.value = async function (this: any, ...args: any[]) {
        const provider = new RateLimitProvider((this as any).options);
        return provider.withRateLimit(pattern, () => method.apply(this, args));
      };
      
      return descriptor;
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime: number; timestamp: Date; details?: any }> {
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
    } catch (error) {
      return {
        details: {
          activeLimiters: this.rateLimiters.size,
          error: error instanceof Error ? error.message : 'Unknown error',
          redis: 'unhealthy',
        },
        responseTime: Date.now() - startTime,
        status: 'unhealthy',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Clear all rate limiters
   */
  clearCache(): void {
    this.rateLimiters.clear();
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
}