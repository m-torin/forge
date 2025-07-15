// ratelimit/types.ts
import type { MiddlewareOptions, MiddlewareContext } from '../base';

export interface RateLimitOptions extends MiddlewareOptions {
  limit: number;
  window: number; // in ms
  strategy?: 'fixed' | 'sliding';
  errorOnLimit?: boolean;
  keyPrefix?: string;
  getKey?: (context: MiddlewareContext) => string;
}

export interface RateLimitInfo {
  remaining: number;
  reset: number;
  total: number;
}

export interface RateLimiter {
  tryAcquire(key: string): Promise<boolean>;
  getRemainingTokens(key: string): Promise<number>;
  getResetTime(key: string): Promise<number>;
}
