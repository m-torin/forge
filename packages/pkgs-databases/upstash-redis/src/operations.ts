/**
 * Domain-specific Upstash Redis operations
 * Higher-level abstractions for common patterns
 */

import type { RedisResult, SessionStore, UpstashRedisClient } from './types';

/**
 * Cache management operations
 */
export class CacheOperations {
  constructor(private client: UpstashRedisClient) {}

  /**
   * Cache with automatic serialization and TTL
   */
  async cache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      namespace?: string;
      tags?: string[];
      staleWhileRevalidate?: boolean;
    } = {},
  ): Promise<RedisResult<T>> {
    try {
      const cacheKey = options.namespace ? `${options.namespace}:${key}` : key;

      // Try to get from cache first
      const cached = await this.client.get<T>(cacheKey);
      if (cached !== null) {
        return { success: true, data: cached };
      }

      // Not in cache, fetch fresh data
      const freshData = await fetcher();

      // Cache the result
      await this.client.set(cacheKey, freshData, {
        ttl: options.ttl || 3600,
        namespace: options.namespace,
      });

      // Store cache tags for invalidation
      if (options.tags?.length) {
        await this.tagCache(cacheKey, options.tags);
      }

      return { success: true, data: freshData };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Cache with stale-while-revalidate pattern
   */
  async cacheWithSWR<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      staleTtl?: number;
      namespace?: string;
    } = {},
  ): Promise<RedisResult<T>> {
    try {
      const cacheKey = options.namespace ? `${options.namespace}:${key}` : key;
      const staleKey = `${cacheKey}:stale`;

      // Try fresh cache first
      const cached = await this.client.get<T>(cacheKey);
      if (cached !== null) {
        return { success: true, data: cached };
      }

      // Try stale cache
      const stale = await this.client.get<T>(staleKey);

      // Background refresh (don't await)
      const refreshPromise = this.refreshCache(cacheKey, staleKey, fetcher, options);

      if (stale !== null) {
        // Return stale data immediately, refresh happens in background
        refreshPromise.catch(console.error);
        return { success: true, data: stale };
      }

      // No cache at all, wait for fresh data
      const freshData = await refreshPromise;
      return { success: true, data: freshData };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<RedisResult<number>> {
    try {
      let totalInvalidated = 0;

      for (const tag of tags) {
        const cacheKeys = await this.client.redis.smembers(`tag:${tag}`);

        if (cacheKeys.length > 0) {
          const deleted = await this.client.redis.del(...cacheKeys);
          totalInvalidated += deleted;

          // Clean up tag set
          await this.client.redis.del(`tag:${tag}`);
        }
      }

      return { success: true, data: totalInvalidated };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<
    RedisResult<{
      totalKeys: number;
      memoryUsed: string;
      hitRatio: number;
    }>
  > {
    try {
      const pipeline = this.client.pipeline();

      // Get total keys (approximate)
      const keys = await this.client.scanKeys('*', 1000);

      // Get memory info
      const info = (await this.client.redis.eval(
        `
        local info = redis.call('INFO', 'memory')
        local memory = string.match(info, 'used_memory_human:([^\\r\\n]+)')
        return memory or '0B'
      `,
        [],
        [],
      )) as string;

      return {
        success: true,
        data: {
          totalKeys: keys.length,
          memoryUsed: info,
          hitRatio: 0, // Would need to track hits/misses
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Warm up cache with multiple keys
   */
  async warmupCache<T>(
    entries: Array<{
      key: string;
      fetcher: () => Promise<T>;
      ttl?: number;
      namespace?: string;
    }>,
  ): Promise<RedisResult<void>> {
    try {
      const promises = entries.map(async ({ key, fetcher, ttl, namespace }) => {
        const cacheKey = namespace ? `${namespace}:${key}` : key;

        // Skip if already cached
        const exists = await this.client.exists(cacheKey);
        if (exists) return;

        const data = await fetcher();
        await this.client.set(cacheKey, data, { ttl: ttl || 3600, namespace });
      });

      await Promise.all(promises);
      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Tag cache keys for group invalidation
   */
  private async tagCache(cacheKey: string, tags: string[]): Promise<void> {
    const pipeline = this.client.pipeline();

    for (const tag of tags) {
      pipeline.sadd(`tag:${tag}`, cacheKey);
      pipeline.expire(`tag:${tag}`, 86400); // Tags expire in 24h
    }

    await pipeline.exec();
  }

  /**
   * Refresh cache with stale backup
   */
  private async refreshCache<T>(
    cacheKey: string,
    staleKey: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      staleTtl?: number;
    },
  ): Promise<T> {
    const freshData = await fetcher();

    // Move current cache to stale
    const current = await this.client.get(cacheKey);
    if (current !== null) {
      await this.client.set(staleKey, current, {
        ttl: options.staleTtl || 3600,
      });
    }

    // Set fresh cache
    await this.client.set(cacheKey, freshData, {
      ttl: options.ttl || 3600,
    });

    return freshData;
  }
}

/**
 * Rate limiting operations
 */
export class RateLimitOperations {
  constructor(private client: UpstashRedisClient) {}

  /**
   * Check rate limit with custom windows
   */
  async checkLimit(
    identifier: string,
    limits: Array<{
      requests: number;
      window: string; // '1m', '1h', '1d'
      burst?: number;
    }>,
  ): Promise<
    RedisResult<{
      allowed: boolean;
      limit: number;
      remaining: number;
      resetTime: Date;
      retryAfter?: number;
    }>
  > {
    try {
      for (const limit of limits) {
        const windowMs = this.parseWindow(limit.window);
        const now = Date.now();
        const windowStart = Math.floor(now / windowMs) * windowMs;
        const key = `ratelimit:${identifier}:${limit.window}:${windowStart}`;

        const current = await this.client.redis.incr(key);

        if (current === 1) {
          await this.client.redis.expire(key, Math.ceil(windowMs / 1000));
        }

        const remaining = Math.max(0, limit.requests - current);
        const resetTime = new Date(windowStart + windowMs);

        if (current > limit.requests) {
          const retryAfter = Math.ceil((resetTime.getTime() - now) / 1000);

          return {
            success: true,
            data: {
              allowed: false,
              limit: limit.requests,
              remaining: 0,
              resetTime,
              retryAfter,
            },
          };
        }
      }

      // All limits passed
      return {
        success: true,
        data: {
          allowed: true,
          limit: limits[0]?.requests || 0,
          remaining: limits[0] ? limits[0].requests - 1 : 0,
          resetTime: new Date(),
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Reset rate limit for identifier
   */
  async resetLimit(identifier: string): Promise<RedisResult<void>> {
    try {
      const pattern = `ratelimit:${identifier}:*`;
      const keys = await this.client.scanKeys(pattern);

      if (keys.length > 0) {
        await this.client.redis.del(...keys);
      }

      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Get rate limit status
   */
  async getLimitStatus(
    identifier: string,
    window: string,
  ): Promise<
    RedisResult<{
      requests: number;
      remaining: number;
      resetTime: Date;
    }>
  > {
    try {
      const windowMs = this.parseWindow(window);
      const now = Date.now();
      const windowStart = Math.floor(now / windowMs) * windowMs;
      const key = `ratelimit:${identifier}:${window}:${windowStart}`;

      const current = (await this.client.redis.get(key)) || '0';
      const requests = parseInt(current as string, 10);
      const resetTime = new Date(windowStart + windowMs);

      return {
        success: true,
        data: {
          requests,
          remaining: Math.max(0, 100 - requests), // Assuming default limit of 100
          resetTime,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Parse window string to milliseconds
   */
  private parseWindow(window: string): number {
    const match = window.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid window format: ${window}`);

    const [, amount, unit] = match;
    const num = parseInt(amount, 10);

    switch (unit) {
      case 's':
        return num * 1000;
      case 'm':
        return num * 60 * 1000;
      case 'h':
        return num * 60 * 60 * 1000;
      case 'd':
        return num * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Invalid time unit: ${unit}`);
    }
  }
}

/**
 * Session management operations
 */
export class SessionOperations {
  private sessionStore: SessionStore;

  constructor(
    private client: UpstashRedisClient,
    ttl = 86400,
  ) {
    this.sessionStore = client.createSessionStore(ttl);
  }

  /**
   * Create user session with metadata
   */
  async createSession(data: {
    userId: string;
    userAgent?: string;
    ip?: string;
    metadata?: Record<string, any>;
    ttl?: number;
  }): Promise<RedisResult<{ sessionId: string; expiresAt: Date }>> {
    try {
      const sessionId = this.generateSessionId();
      const expiresAt = new Date(Date.now() + (data.ttl || 86400) * 1000);

      const sessionData = {
        userId: data.userId,
        userAgent: data.userAgent,
        ip: data.ip,
        metadata: data.metadata || {},
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        lastAccess: new Date().toISOString(),
      };

      await this.sessionStore.set(sessionId, sessionData, data.ttl);

      // Track active sessions for user
      await this.client.redis.sadd(`user:${data.userId}:sessions`, sessionId);
      await this.client.redis.expire(`user:${data.userId}:sessions`, data.ttl || 86400);

      return {
        success: true,
        data: { sessionId, expiresAt },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Get session with automatic touch
   */
  async getSession(sessionId: string): Promise<RedisResult<any>> {
    try {
      const session = await this.sessionStore.get(sessionId);

      if (!session) {
        return { success: false, error: 'Session not found' };
      }

      // Update last access time
      session.lastAccess = new Date().toISOString();
      await this.sessionStore.set(sessionId, session);

      return { success: true, data: session };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Update session data
   */
  async updateSession(sessionId: string, updates: Record<string, any>): Promise<RedisResult<void>> {
    try {
      const session = await this.sessionStore.get(sessionId);

      if (!session) {
        return { success: false, error: 'Session not found' };
      }

      const updatedSession = {
        ...session,
        ...updates,
        lastAccess: new Date().toISOString(),
      };

      await this.sessionStore.set(sessionId, updatedSession);

      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Destroy session and cleanup
   */
  async destroySession(sessionId: string): Promise<RedisResult<void>> {
    try {
      const session = await this.sessionStore.get(sessionId);

      if (session?.userId) {
        // Remove from user's active sessions
        await this.client.redis.srem(`user:${session.userId}:sessions`, sessionId);
      }

      await this.sessionStore.destroy(sessionId);

      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Get all active sessions for user
   */
  async getUserSessions(userId: string): Promise<RedisResult<any[]>> {
    try {
      const sessionIds = await this.client.redis.smembers(`user:${userId}:sessions`);
      const sessions = [];

      for (const sessionId of sessionIds) {
        const session = await this.sessionStore.get(sessionId);
        if (session) {
          sessions.push({ sessionId, ...session });
        } else {
          // Clean up orphaned session ID
          await this.client.redis.srem(`user:${userId}:sessions`, sessionId);
        }
      }

      return { success: true, data: sessions };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Generate cryptographically secure session ID
   */
  private generateSessionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Real-time operations with pub/sub
 */
export class RealtimeOperations {
  constructor(private client: UpstashRedisClient) {}

  /**
   * Publish message to channel
   */
  async publish(
    channel: string,
    message: any,
    options: {
      namespace?: string;
      persist?: boolean;
      persistTtl?: number;
    } = {},
  ): Promise<RedisResult<number>> {
    try {
      const channelKey = options.namespace ? `${options.namespace}:${channel}` : channel;
      const serializedMessage = JSON.stringify({
        data: message,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9),
      });

      const subscribers = await this.client.redis.publish(channelKey, serializedMessage);

      // Persist message if requested
      if (options.persist) {
        const historyKey = `${channelKey}:history`;
        await this.client.redis.lpush(historyKey, serializedMessage);
        await this.client.redis.ltrim(historyKey, 0, 99); // Keep last 100 messages

        if (options.persistTtl) {
          await this.client.redis.expire(historyKey, options.persistTtl);
        }
      }

      return { success: true, data: subscribers };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Get message history for channel
   */
  async getHistory(
    channel: string,
    options: {
      namespace?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<RedisResult<any[]>> {
    try {
      const channelKey = options.namespace ? `${options.namespace}:${channel}` : channel;
      const historyKey = `${channelKey}:history`;

      const start = options.offset || 0;
      const end = start + (options.limit || 50) - 1;

      const messages = await this.client.redis.lrange(historyKey, start, end);

      const parsed = messages.map(msg => {
        try {
          return JSON.parse(msg as string);
        } catch {
          return { data: msg, timestamp: 0 };
        }
      });

      return { success: true, data: parsed };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Subscribe to channel (conceptual - actual implementation would use websockets)
   */
  async createSubscription(
    channels: string[],
    callback: (channel: string, message: any) => void,
    options: {
      namespace?: string;
    } = {},
  ): Promise<RedisResult<() => void>> {
    try {
      const channelKeys = channels.map(channel =>
        options.namespace ? `${options.namespace}:${channel}` : channel,
      );

      // In a real implementation, this would set up a pub/sub connection
      // For now, we'll return a mock unsubscribe function
      const unsubscribe = () => {
        console.log('Unsubscribed from channels:', channelKeys);
      };

      return { success: true, data: unsubscribe };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }
}

/**
 * Analytics and metrics operations
 */
export class MetricsOperations {
  constructor(private client: UpstashRedisClient) {}

  /**
   * Increment counter with time-based buckets
   */
  async incrementCounter(
    metric: string,
    value = 1,
    options: {
      buckets?: ('minute' | 'hour' | 'day' | 'month')[];
      tags?: Record<string, string>;
    } = {},
  ): Promise<RedisResult<void>> {
    try {
      const now = new Date();
      const buckets = options.buckets || ['hour', 'day'];
      const tagSuffix = options.tags
        ? ':' +
          Object.entries(options.tags)
            .map(([k, v]) => `${k}=${v}`)
            .join(',')
        : '';

      const pipeline = this.client.pipeline();

      for (const bucket of buckets) {
        let bucketKey = '';
        let ttl = 0;

        switch (bucket) {
          case 'minute':
            bucketKey = `metrics:${metric}:${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}:${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}${tagSuffix}`;
            ttl = 3600; // 1 hour
            break;
          case 'hour':
            bucketKey = `metrics:${metric}:${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}:${now.getHours().toString().padStart(2, '0')}${tagSuffix}`;
            ttl = 86400 * 7; // 7 days
            break;
          case 'day':
            bucketKey = `metrics:${metric}:${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}${tagSuffix}`;
            ttl = 86400 * 30; // 30 days
            break;
          case 'month':
            bucketKey = `metrics:${metric}:${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}${tagSuffix}`;
            ttl = 86400 * 365; // 1 year
            break;
        }

        pipeline.incrby(bucketKey, value);
        pipeline.expire(bucketKey, ttl);
      }

      await pipeline.exec();

      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Get metric data for time range
   */
  async getMetrics(
    metric: string,
    options: {
      from: Date;
      to: Date;
      bucket: 'minute' | 'hour' | 'day' | 'month';
      tags?: Record<string, string>;
    },
  ): Promise<RedisResult<Array<{ timestamp: string; value: number }>>> {
    try {
      const tagSuffix = options.tags
        ? ':' +
          Object.entries(options.tags)
            .map(([k, v]) => `${k}=${v}`)
            .join(',')
        : '';

      const bucketKeys = this.generateBucketKeys(
        metric,
        options.from,
        options.to,
        options.bucket,
        tagSuffix,
      );

      const pipeline = this.client.pipeline();
      bucketKeys.forEach(key => pipeline.get(key));

      const results = await pipeline.exec();

      const metrics = bucketKeys.map((key, index) => ({
        timestamp: this.extractTimestampFromKey(key, options.bucket),
        value: parseInt((results[index] as string) || '0', 10),
      }));

      return { success: true, data: metrics };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Generate bucket keys for time range
   */
  private generateBucketKeys(
    metric: string,
    from: Date,
    to: Date,
    bucket: 'minute' | 'hour' | 'day' | 'month',
    tagSuffix: string,
  ): string[] {
    const keys = [];
    const current = new Date(from);

    while (current <= to) {
      let key = '';

      switch (bucket) {
        case 'minute':
          key = `metrics:${metric}:${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}:${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}${tagSuffix}`;
          current.setMinutes(current.getMinutes() + 1);
          break;
        case 'hour':
          key = `metrics:${metric}:${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}:${current.getHours().toString().padStart(2, '0')}${tagSuffix}`;
          current.setHours(current.getHours() + 1);
          break;
        case 'day':
          key = `metrics:${metric}:${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}${tagSuffix}`;
          current.setDate(current.getDate() + 1);
          break;
        case 'month':
          key = `metrics:${metric}:${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}${tagSuffix}`;
          current.setMonth(current.getMonth() + 1);
          break;
      }

      keys.push(key);
    }

    return keys;
  }

  /**
   * Extract timestamp from bucket key
   */
  private extractTimestampFromKey(key: string, bucket: string): string {
    const parts = key.split(':');
    const timePart = parts[2]; // metrics:metric_name:timestamp_part
    return timePart.split(',')[0]; // Remove tags
  }
}

/**
 * Combined operations factory
 */
export function createRedisOperations(client: UpstashRedisClient) {
  return {
    cache: new CacheOperations(client),
    rateLimit: new RateLimitOperations(client),
    sessions: new SessionOperations(client),
    realtime: new RealtimeOperations(client),
    metrics: new MetricsOperations(client),
  };
}
