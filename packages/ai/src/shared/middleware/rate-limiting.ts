/**
 * AI SDK Rate Limiting Middleware
 * Provides rate limiting functionality for AI operations
 */

export interface RateLimitConfig {
  enabled: boolean;
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitState {
  requests: number;
  resetTime: number;
}

/**
 * Default rate limit configuration
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  enabled: process.env.DISABLE_AI_RATE_LIMITING !== 'true',
  maxRequests: parseInt(process.env.AI_MAX_REQUESTS_PER_MINUTE || '60', 10),
  windowMs: 60 * 1000, // 1 minute
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
};

/**
 * Simple in-memory rate limiter
 */
class MemoryRateLimiter {
  private states = new Map<string, RateLimitState>();

  check(
    key: string,
    config: RateLimitConfig,
  ): { allowed: boolean; resetTime: number; remaining: number } {
    if (!config.enabled) {
      return { allowed: true, resetTime: 0, remaining: config.maxRequests };
    }

    const now = Date.now();
    const state = this.states.get(key);

    if (!state || now >= state.resetTime) {
      // Reset or initialize
      const newState: RateLimitState = {
        requests: 1,
        resetTime: now + config.windowMs,
      };
      this.states.set(key, newState);
      return {
        allowed: true,
        resetTime: newState.resetTime,
        remaining: config.maxRequests - 1,
      };
    }

    if (state.requests >= config.maxRequests) {
      return {
        allowed: false,
        resetTime: state.resetTime,
        remaining: 0,
      };
    }

    state.requests++;
    return {
      allowed: true,
      resetTime: state.resetTime,
      remaining: config.maxRequests - state.requests,
    };
  }

  reset(key?: string) {
    if (key) {
      this.states.delete(key);
    } else {
      this.states.clear();
    }
  }
}

/**
 * Create rate limiting middleware
 */
export function createRateLimitMiddleware(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config };
  const limiter = new MemoryRateLimiter();

  return {
    checkLimit: (identifier: string) => {
      return limiter.check(identifier, finalConfig);
    },

    reset: (identifier?: string) => {
      limiter.reset(identifier);
    },

    middleware: (identifier: string) => {
      const result = limiter.check(identifier, finalConfig);

      if (!result.allowed) {
        const error = new Error('Rate limit exceeded');
        (error as any).statusCode = 429;
        (error as any).resetTime = result.resetTime;
        throw error;
      }

      return result;
    },
  };
}

/**
 * Default rate limiter instance
 */
export const aiRateLimiter = createRateLimitMiddleware();
