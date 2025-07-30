// ratelimit/middleware.ts
import {
  createMiddleware,
  type MiddlewareContext,
  type NextFunction,
} from '../base';
import type { RateLimitOptions, RateLimiter } from './types';

class MemoryRateLimiter implements RateLimiter {
  private windows = new Map<string, { tokens: number; reset: number }>();

  constructor(
    private limit: number,
    private windowMs: number,
  ) {}

  async tryAcquire(key: string): Promise<boolean> {
    const now = Date.now();
    const window = this.windows.get(key);

    if (!window || now > window.reset) {
      this.windows.set(key, {
        tokens: this.limit - 1,
        reset: now + this.windowMs,
      });
      return true;
    }

    if (window.tokens > 0) {
      window.tokens--;
      return true;
    }

    return false;
  }

  async getRemainingTokens(key: string): Promise<number> {
    const window = this.windows.get(key);
    return window?.tokens ?? this.limit;
  }

  async getResetTime(key: string): Promise<number> {
    const window = this.windows.get(key);
    return window?.reset ?? Date.now() + this.windowMs;
  }
}

export const createRateLimitMiddleware = (
  options: RateLimitOptions,
  customLimiter?: RateLimiter,
) => {
  const {
    limit,
    window,
    strategy: _strategy = 'sliding',
    errorOnLimit = true,
    keyPrefix = 'ratelimit',
    getKey = (ctx) => `${keyPrefix}:${ctx.operation}`,
  } = options;

  const limiter = customLimiter ?? new MemoryRateLimiter(limit, window);

  return createMiddleware(
    async (context: MiddlewareContext, next: NextFunction) => {
      const key = getKey(context);
      const allowed = await limiter.tryAcquire(key);

      if (!allowed && errorOnLimit) {
        throw new Error('Rate limit exceeded');
      }

      const result = await next();

      // Add rate limit info to result metadata
      result.metadata.rateLimit = {
        remaining: await limiter.getRemainingTokens(key),
        reset: await limiter.getResetTime(key),
        total: limit,
      };

      return result;
    },
    options,
  );
};
