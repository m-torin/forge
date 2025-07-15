/**
 * Next.js server-side Redis functionality
 * This provides Next.js-specific Redis features with server-only imports
 */

import 'server-only';

// Next.js specific server functionality
import { headers } from 'next/headers';
import { cache } from 'react';
import { redis, upstashRedisClientSingleton } from './server';

// Re-export all base server functionality
export * from './server';

// Cached Redis operations for React Server Components
export const getCachedRedisData = cache(async (key: string) => {
  return await redis.get(key);
});

export const getCachedRedisHash = cache(async (key: string) => {
  return await redis.hgetall(key);
});

export const getCachedRedisHashField = cache(async (key: string, field: string) => {
  return await redis.hget(key, field);
});

export const getCachedRedisList = cache(async (key: string, start = 0, end = -1) => {
  return await redis.lrange(key, start, end);
});

export const getCachedRedisSet = cache(async (key: string) => {
  return await redis.smembers(key);
});

export const getCachedRedisSortedSet = cache(async (key: string, start = 0, end = -1) => {
  return await redis.zrange(key, start, end);
});

/**
 * Next.js-specific Redis utilities
 */
export async function getRedisWithHeaders() {
  const headerList = await headers();
  const userAgent = headerList.get('user-agent') || 'unknown';
  const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown';

  return {
    redis: upstashRedisClientSingleton(),
    headers: {
      userAgent,
      ip,
    },
  };
}

/**
 * Session management utilities for Next.js
 */
export async function getSessionFromRedis(sessionId: string) {
  return getCachedRedisData(`session:${sessionId}`);
}

export async function setSessionInRedis(
  sessionId: string,
  sessionData: any,
  expirationSeconds = 3600,
) {
  const key = `session:${sessionId}`;
  await redis.set(key, JSON.stringify(sessionData), { ex: expirationSeconds });
}

export async function deleteSessionFromRedis(sessionId: string) {
  const key = `session:${sessionId}`;
  await redis.del(key);
}

/**
 * Caching utilities for Next.js
 */
export async function cachePageData(pageKey: string, data: any, expirationSeconds = 300) {
  const key = `page:${pageKey}`;
  await redis.set(key, JSON.stringify(data), { ex: expirationSeconds });
}

export async function getCachedPageData(pageKey: string) {
  const key = `page:${pageKey}`;
  const data = await getCachedRedisData(key);
  return data ? JSON.parse(data as string) : null;
}

export async function invalidatePageCache(pageKeyPattern: string) {
  const client = upstashRedisClientSingleton();

  // Use SCAN to find matching keys
  let cursor = 0;
  const keysToDelete: string[] = [];

  do {
    const result = await client.scan(cursor, {
      match: `page:${pageKeyPattern}`,
      count: 100,
    });

    cursor = Number(result[0]);
    keysToDelete.push(...result[1]);
  } while (cursor !== 0);

  if (keysToDelete.length > 0) {
    await client.del(...keysToDelete);
  }

  return keysToDelete.length;
}

/**
 * Rate limiting utilities for Next.js
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Remove old entries and count current requests
  await redis.zremrangebyscore(key, 0, windowStart);
  const currentCount = await redis.zcard(key);

  if (currentCount >= limit) {
    const oldestEntry = await redis.zrange(key, 0, 0, { withScores: true });
    const resetTime =
      oldestEntry.length > 0
        ? Math.ceil((Number((oldestEntry[0] as any).score) + windowSeconds * 1000) / 1000)
        : Math.ceil((now + windowSeconds * 1000) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetTime,
    };
  }

  // Add current request
  await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  await redis.expire(key, windowSeconds);

  return {
    allowed: true,
    remaining: limit - currentCount - 1,
    resetTime: Math.ceil((now + windowSeconds * 1000) / 1000),
  };
}

/**
 * Feature flag utilities for Next.js
 */
export async function getFeatureFlag(flagName: string, defaultValue = false): Promise<boolean> {
  const key = `feature_flag:${flagName}`;
  const value = await getCachedRedisData(key);

  if (value === null) {
    return defaultValue;
  }

  return value === 'true' || value === '1';
}

export async function setFeatureFlag(flagName: string, enabled: boolean): Promise<void> {
  const key = `feature_flag:${flagName}`;
  await redis.set(key, enabled ? 'true' : 'false');
}

/**
 * Analytics and metrics utilities
 */
export async function incrementCounter(counterName: string, by = 1): Promise<number> {
  const key = `counter:${counterName}`;
  return await redis.incrby(key, by);
}

export async function getCounter(counterName: string): Promise<number> {
  const key = `counter:${counterName}`;
  const value = await getCachedRedisData(key);
  return value ? parseInt(value as string, 10) : 0;
}

export async function recordEvent(eventName: string, data?: any): Promise<void> {
  const key = `events:${eventName}`;
  const timestamp = Date.now();
  const eventData = {
    timestamp,
    data,
  };

  await redis.lpush(key, JSON.stringify(eventData));

  // Keep only the last 1000 events per type
  await redis.ltrim(key, 0, 999);
}

export async function getRecentEvents(eventName: string, count = 10): Promise<any[]> {
  const key = `events:${eventName}`;
  const events = await getCachedRedisList(key, 0, count - 1);

  return events.map(event => JSON.parse(event));
}
