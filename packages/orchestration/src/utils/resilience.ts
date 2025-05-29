import { type Redis } from '@upstash/redis';
import { formatTimestamp, generateKey, getDomain, sleep } from './helpers';

import type { CircuitBreakerConfig, CircuitBreakerState, RateLimiterConfig } from './types';

// ===== Circuit Breaker =====

export class CircuitBreaker {
  private failures = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private state: CircuitBreakerState = 'CLOSED';

  private readonly failureThreshold: number;
  private readonly recoveryTimeout: number;
  private readonly successThreshold: number;

  constructor(config: CircuitBreakerConfig = {}) {
    this.failureThreshold = config.failureThreshold ?? 5;
    this.recoveryTimeout = config.recoveryTimeout ?? 60000; // 1 minute
    this.successThreshold = config.successThreshold ?? 2;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error(
          `Circuit breaker is OPEN. Will retry after ${formatTimestamp(this.lastFailureTime + this.recoveryTimeout)}`,
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.successCount = 0;
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getStats() {
    return {
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      nextRetryTime:
        this.state === 'OPEN'
          ? formatTimestamp(this.lastFailureTime + this.recoveryTimeout)
          : null,
      state: this.state,
    };
  }

  reset(): void {
    this.failures = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}

// ===== Rate Limiter =====

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
    const key = generateKey(this.config.keyPrefix, identifier);
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
    const key = generateKey(this.config.keyPrefix, identifier);
    await this.redis.del(key);
  }

  async waitForSlot(identifier: string): Promise<void> {
    let result = await this.checkLimit(identifier);

    while (!result.allowed) {
      const waitTime = result.resetAt.getTime() - Date.now();
      if (waitTime > 0) {
        await sleep(Math.min(waitTime, 1000));
      }
      result = await this.checkLimit(identifier);
    }
  }
}

// ===== Domain-based Rate Limiter =====

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
    const domain = getDomain(url);

    if (!this.limiters.has(domain)) {
      this.limiters.set(
        domain,
        new RateLimiter(this.redis, {
          keyPrefix: generateKey('domain-rate-limit', domain),
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
    const domain = getDomain(url);

    if (!this.limiters.has(domain)) {
      this.limiters.set(
        domain,
        new RateLimiter(this.redis, {
          keyPrefix: generateKey('domain-rate-limit', domain),
          maxRequests: maxRequestsPerMinute,
          windowMs: 60000,
        }),
      );
    }

    const limiter = this.limiters.get(domain)!;
    await limiter.waitForSlot(domain);
  }
}