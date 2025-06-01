import { Ratelimit, type RatelimitConfig } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import { keys } from './keys';

let redis: Redis | null = null;
let hasLoggedWarning = false;

const getRedis = () => {
  const { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } = keys();

  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    if (!hasLoggedWarning) {
      console.warn('[Rate Limit] Upstash Redis not configured. Rate limiting is disabled.');
      hasLoggedWarning = true;
    }
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
};

export const createRateLimiter = (props: Omit<RatelimitConfig, 'redis'>): Ratelimit => {
  const redisClient = getRedis();

  if (!redisClient) {
    // Return a no-op rate limiter
    return {
      getRemaining: async () => 999999,
      limit: async () => ({ limit: 999999, remaining: 999999, reset: 0, success: true }),
      resetUsedTokens: async () => {},
    } as unknown as Ratelimit;
  }

  return new Ratelimit({
    limiter: props.limiter ?? Ratelimit.slidingWindow(10, '10 s'),
    prefix: props.prefix ?? 'forge',
    redis: redisClient,
  });
};

export const { slidingWindow } = Ratelimit;