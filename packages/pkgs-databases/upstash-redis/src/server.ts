/**
 * Server-side Upstash Redis client for Node.js environments
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import {
  createOptimizedConfig,
  detectRuntime,
  mergeConfig,
  validateConfig,
  validateRateLimitConfig,
} from './config';
import type {
  CacheOptions,
  LockOptions,
  LockResult,
  QueueMessage,
  QueueOptions,
  QueueProcessor,
  RateLimitConfig,
  RedisMetrics,
  RedisResult,
  SessionStore,
  UpstashRedisConfig,
} from './types';

/**
 * Enhanced Redis client with additional features
 */
class UpstashRedisClient {
  public redis: Redis;
  private config: UpstashRedisConfig;
  private metrics: Partial<RedisMetrics> = {};

  constructor(config: Partial<UpstashRedisConfig> = {}) {
    const runtime = detectRuntime();
    this.config = createOptimizedConfig(runtime, config);
    this.redis = new Redis(this.config);
  }

  /**
   * Basic cache operations with TTL and namespace support
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const namespacedKey = this.buildKey(key, options.namespace);
    const serializedValue = options.serialize !== false ? JSON.stringify(value) : value;

    if (options.ttl) {
      await this.redis.setex(namespacedKey, options.ttl, serializedValue);
    } else {
      await this.redis.set(namespacedKey, serializedValue);
    }
  }

  async get<T = any>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const namespacedKey = this.buildKey(key, options.namespace);
    const value = await this.redis.get(namespacedKey);

    if (value === null) return null;

    try {
      return options.serialize !== false ? JSON.parse(value as string) : (value as T);
    } catch {
      return value as T;
    }
  }

  async del(key: string, options: CacheOptions = {}): Promise<number> {
    const namespacedKey = this.buildKey(key, options.namespace);
    return await this.redis.del(namespacedKey);
  }

  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    const namespacedKey = this.buildKey(key, options.namespace);
    return (await this.redis.exists(namespacedKey)) === 1;
  }

  async expire(key: string, seconds: number, options: CacheOptions = {}): Promise<boolean> {
    const namespacedKey = this.buildKey(key, options.namespace);
    return (await this.redis.expire(namespacedKey, seconds)) === 1;
  }

  /**
   * Distributed locking
   */
  async acquireLock(resource: string, options: LockOptions = {}): Promise<LockResult> {
    const lockKey = `lock:${resource}`;
    const lockId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const ttl = options.ttl || 30;

    try {
      const result = await this.redis.set(lockKey, lockId, { ex: ttl, nx: true });

      if (result === 'OK') {
        return {
          acquired: true,
          lockId,
          ttl,
          extend: async (additionalTtl: number) => {
            const currentValue = await this.redis.get(lockKey);
            if (currentValue === lockId) {
              await this.redis.expire(lockKey, ttl + additionalTtl);
              return true;
            }
            return false;
          },
          release: async () => {
            const script = `
              if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
              else
                return 0
              end
            `;
            const released = await this.redis.eval(script, [lockKey], [lockId]);
            return released === 1;
          },
        };
      }

      return { acquired: false };
    } catch (error) {
      throw new Error(`Failed to acquire lock: ${error}`);
    }
  }

  /**
   * Session storage implementation
   */
  createSessionStore(defaultTtl = 3600): SessionStore {
    return {
      get: async (sessionId: string) => {
        return await this.get(`session:${sessionId}`);
      },

      set: async (sessionId: string, data: any, ttl = defaultTtl) => {
        await this.set(`session:${sessionId}`, data, { ttl });
      },

      destroy: async (sessionId: string) => {
        await this.del(`session:${sessionId}`);
      },

      touch: async (sessionId: string, ttl = defaultTtl) => {
        await this.expire(`session:${sessionId}`, ttl);
      },

      exists: async (sessionId: string) => {
        return await this.exists(`session:${sessionId}`);
      },
    };
  }

  /**
   * Simple queue implementation
   */
  async enqueue<T = any>(
    queueName: string,
    data: T,
    options: QueueOptions = {},
  ): Promise<QueueMessage<T>> {
    const message: QueueMessage<T> = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data,
      timestamp: Date.now(),
      attempts: 0,
      delay: options.delay,
      priority: options.priority || 0,
    };

    const queueKey = `queue:${queueName}`;
    const score = options.delay
      ? Date.now() + options.delay * 1000
      : Date.now() - (options.priority || 0); // Lower score = higher priority

    await this.redis.zadd(queueKey, { score, member: JSON.stringify(message) });

    if (options.ttl) {
      await this.redis.expire(queueKey, options.ttl);
    }

    return message;
  }

  async dequeue<T = any>(queueName: string): Promise<QueueMessage<T> | null> {
    const queueKey = `queue:${queueName}`;
    const now = Date.now();

    // Get messages that are ready to process (score <= now)
    const result = await this.redis.zpopmin(queueKey, 1);

    if (!result || result.length === 0) {
      return null;
    }

    const [messageJson] = result;

    try {
      const message: QueueMessage<T> = JSON.parse(messageJson as string);

      // Check if message is ready (delay has passed)
      if (message.delay && message.timestamp + message.delay * 1000 > now) {
        // Put it back in the queue
        await this.redis.zadd(queueKey, {
          score: message.timestamp + message.delay * 1000,
          member: messageJson,
        });
        return null;
      }

      return message;
    } catch {
      // Invalid message format, discard it
      return null;
    }
  }

  /**
   * Process queue with retry logic
   */
  async processQueue<T = any>(
    queueName: string,
    processor: QueueProcessor<T>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      batchSize?: number;
      pollInterval?: number;
    } = {},
  ): Promise<void> {
    const { maxRetries = 3, retryDelay = 1000, batchSize = 1, pollInterval = 1000 } = options;

    const processMessage = async (message: QueueMessage<T>) => {
      try {
        await processor(message);
      } catch (error) {
        message.attempts++;

        if (message.attempts < maxRetries) {
          // Retry with exponential backoff
          const delay = retryDelay * Math.pow(2, message.attempts - 1);
          await this.enqueue(queueName, message.data, {
            delay: delay / 1000,
            priority: message.priority,
          });
        }

        throw error;
      }
    };

    // Simple polling implementation
    const poll = async () => {
      for (let i = 0; i < batchSize; i++) {
        const message = await this.dequeue<T>(queueName);
        if (message) {
          try {
            await processMessage(message);
          } catch (error) {
            console.error(`Queue processing error:`, error);
          }
        }
      }

      setTimeout(poll, pollInterval);
    };

    poll();
  }

  /**
   * Pipeline operations for batch processing
   */
  pipeline() {
    return this.redis.pipeline();
  }

  /**
   * Pattern scanning with cursor support
   */
  async scanKeys(pattern: string = '*', count = 100): Promise<string[]> {
    const keys: string[] = [];
    let cursor = 0;

    do {
      const result = await this.redis.scan(cursor, { match: pattern, count });
      cursor = parseInt(result[0] as string, 10);
      keys.push(...result[1]);
    } while (cursor !== 0);

    return keys;
  }

  /**
   * Health check
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  /**
   * Get basic metrics
   */
  async getMetrics(): Promise<Partial<RedisMetrics>> {
    try {
      const info = (await this.redis.eval(`return redis.call('INFO', 'memory')`, [], [])) as string;
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const peakMemoryMatch = info.match(/used_memory_peak:(\d+)/);

      this.metrics = {
        ...this.metrics,
        memory: {
          used: memoryMatch ? parseInt(memoryMatch[1]) : 0,
          peak: peakMemoryMatch ? parseInt(peakMemoryMatch[1]) : 0,
        },
      };

      return this.metrics;
    } catch {
      return this.metrics;
    }
  }

  /**
   * Build namespaced key
   */
  private buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }
}

/**
 * Create rate limiter with different algorithms
 */
export function createRateLimit(redis: Redis, config: RateLimitConfig): Ratelimit {
  const validatedConfig = validateRateLimitConfig(config);

  let limiter;

  // Convert window to proper duration format if it's a number (milliseconds)
  const windowDuration =
    typeof validatedConfig.window === 'number'
      ? (`${Math.floor(validatedConfig.window / 1000)} s` as const)
      : (validatedConfig.window as string);

  switch (validatedConfig.algorithm) {
    case 'sliding-window':
      limiter = Ratelimit.slidingWindow(validatedConfig.requests, windowDuration as any);
      break;
    case 'fixed-window':
      limiter = Ratelimit.fixedWindow(validatedConfig.requests, windowDuration as any);
      break;
    case 'token-bucket':
      limiter = Ratelimit.tokenBucket(
        validatedConfig.requests,
        windowDuration as any,
        validatedConfig.requests,
      );
      break;
    default:
      limiter = Ratelimit.slidingWindow(validatedConfig.requests, windowDuration as any);
  }

  return new Ratelimit({
    redis,
    limiter,
    prefix: validatedConfig.prefix,
    ephemeralCache: validatedConfig.ephemeralCache,
    analytics: true,
  });
}

/**
 * Safe Redis operation wrapper
 */
export async function safeRedisOperation<T>(operation: () => Promise<T>): Promise<RedisResult<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Create server Redis client
 */
export function createServerClient(config?: Partial<UpstashRedisConfig>): UpstashRedisClient {
  return new UpstashRedisClient(config);
}

// Default server client
let defaultClient: UpstashRedisClient | null = null;

/**
 * Get or create default server client
 */
export function getServerClient(config?: Partial<UpstashRedisConfig>): UpstashRedisClient {
  if (!defaultClient || config) {
    defaultClient = createServerClient(config);
  }
  return defaultClient;
}

/**
 * Default Redis client instance
 */
export const redis = getServerClient();

// Re-export types and utilities
export { createOptimizedConfig, mergeConfig, validateConfig };
export type {
  CacheOptions,
  LockResult,
  RateLimitConfig,
  RedisResult,
  SessionStore,
  UpstashRedisConfig,
};
