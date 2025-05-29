import { type Redis } from '@upstash/redis';

import type { RateLimiterConfig } from '../types';

export class RateLimiter {
  private redis: Redis;
  private config: Required<RateLimiterConfig>;

  constructor(redis: Redis, config: RateLimiterConfig) {
    this.redis = redis;
    this.config = {
      keyPrefix: config.keyPrefix ?? 'rate-limit',
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
    };
  }

  async checkLimit(
    identifier: string,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Remove old entries
    await this.redis.zremrangebyscore(key, '-inf' as any, windowStart);

    // Count current requests in window
    const count = await this.redis.zcard(key);

    if (count >= this.config.maxRequests) {
      // Get oldest entry to determine reset time
      const oldestEntry = await this.redis.zrange(key, 0, 0, { withScores: true });
      const resetAt =
        oldestEntry.length > 0 && oldestEntry[0]
          ? new Date(Number((oldestEntry[0] as any).score || oldestEntry[0]) + this.config.windowMs)
          : new Date(now + this.config.windowMs);

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Add current request
    await this.redis.zadd(key, { member: `${now}-${Math.random()}`, score: now });
    await this.redis.expire(key, Math.ceil(this.config.windowMs / 1000));

    return {
      allowed: true,
      remaining: this.config.maxRequests - count - 1,
      resetAt: new Date(now + this.config.windowMs),
    };
  }

  async reset(identifier: string): Promise<void> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    await this.redis.del(key);
  }

  async waitForSlot(identifier: string): Promise<void> {
    let result = await this.checkLimit(identifier);

    while (!result.allowed) {
      const waitTime = result.resetAt.getTime() - Date.now();
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, Math.min(waitTime, 1000)));
      }
      result = await this.checkLimit(identifier);
    }
  }
}

// Domain-based rate limiter for web scraping
export class DomainRateLimiter {
  private limiters = new Map<string, RateLimiter>();
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async checkDomainLimit(
    url: string,
    maxRequestsPerMinute = 60,
  ): Promise<{ allowed: boolean; domain: string; remaining: number; resetAt: Date }> {
    const domain = new URL(url).hostname;

    if (!this.limiters.has(domain)) {
      this.limiters.set(
        domain,
        new RateLimiter(this.redis, {
          keyPrefix: `domain-rate-limit:${domain}`,
          maxRequests: maxRequestsPerMinute,
          windowMs: 60000, // 1 minute
        }),
      );
    }

    const limiter = this.limiters.get(domain)!;
    const result = await limiter.checkLimit(domain);

    return {
      ...result,
      domain,
    };
  }

  async waitForDomainSlot(url: string, maxRequestsPerMinute = 60): Promise<void> {
    const domain = new URL(url).hostname;

    if (!this.limiters.has(domain)) {
      this.limiters.set(
        domain,
        new RateLimiter(this.redis, {
          keyPrefix: `domain-rate-limit:${domain}`,
          maxRequests: maxRequestsPerMinute,
          windowMs: 60000,
        }),
      );
    }

    const limiter = this.limiters.get(domain)!;
    await limiter.waitForSlot(domain);
  }
}
