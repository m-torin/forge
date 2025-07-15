/**
 * Redis server implementation for high-performance caching and data operations
 * Provides singleton Redis client with comprehensive operations for server environments
 *
 * @example
 * ```typescript
 * import { redis, redisOps, set, get } from '@repo/database/redis/server';
 *
 * // Direct Redis client usage
 * const user = await redis.get('user:123');
 * await redis.set('user:123', JSON.stringify(userData), { ex: 3600 });
 *
 * // Using convenience functions
 * await set('session:abc', sessionData, { ex: 1800 });
 * const session = await get('session:abc');
 *
 * // Using RedisOperations class
 * const ops = new RedisOperations();
 * await ops.hset('user:profiles', { 'user:123': profileData });
 * const profiles = await ops.hgetall('user:profiles');
 *
 * // Pipeline operations for batch processing
 * const pipeline = redisOps.pipeline();
 * pipeline.set('key1', 'value1');
 * pipeline.set('key2', 'value2');
 * const results = await pipeline.exec();
 * ```
 *
 * Features:
 * - Singleton pattern for connection pooling
 * - Hot-reload support in development
 * - Type-safe operations with JSON serialization
 * - Comprehensive Redis command coverage
 * - Pipeline support for batch operations
 * - Environment-based configuration
 */

import 'server-only';

import { Redis } from '@upstash/redis';
import { safeEnv } from '../../env';

// ============================================================================
// TYPES
// ============================================================================

// Global type for Redis client singleton
const globalForRedis = global as unknown as { redis?: Redis };

// ============================================================================
// SINGLETON FACTORY
// ============================================================================

/**
 * Create a singleton instance of the Redis client
 * Ensures only one connection pool per application
 */
export const upstashRedisClientSingleton = () => {
  const env = safeEnv();
  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
};

/**
 * Redis client singleton instance
 * Use this for direct Redis operations in server environments
 */
export const redis = globalForRedis.redis ?? upstashRedisClientSingleton();

// In development, attach to global to prevent multiple instances during hot-reload
if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// ============================================================================
// CLIENT FACTORY
// ============================================================================

/**
 * Environment-based Redis client creation
 * Creates new Redis instance from environment variables with validation
 */
export function createUpstashRedisFromEnv(): Redis {
  const env = safeEnv();
  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Re-export all Redis types and functions from @upstash/redis
export * from '@upstash/redis';

// ============================================================================
// REDIS OPERATIONS CLASS
// ============================================================================

/**
 * Comprehensive Redis operations wrapper with type-safe JSON serialization
 * Provides high-level methods for all Redis data types and operations
 */
export class RedisOperations {
  private client: Redis;

  constructor(client?: Redis) {
    this.client = client || redis;
  }

  // ==========================================================================
  // BASIC KEY-VALUE OPERATIONS
  // ==========================================================================

  /**
   * Set a key-value pair with optional expiration
   */
  async set(key: string, value: any, options?: { ex?: number }): Promise<string> {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    let setOptions: any = undefined;
    if (options?.ex !== undefined) {
      setOptions = { ex: options.ex };
    }
    const result = await this.client.set(key, serializedValue, setOptions);
    return result as string;
  }

  /**
   * Get a value by key
   */
  async get<T = any>(key: string): Promise<T | null> {
    const result = await this.client.get(key);
    if (!result) return null;

    if (typeof result === 'string') {
      try {
        return JSON.parse(result) as T;
      } catch {
        return result as T;
      }
    }

    return result as T;
  }

  /**
   * Delete one or more keys
   */
  async del(...keys: string[]): Promise<number> {
    return await this.client.del(...keys);
  }

  /**
   * Check if a key exists
   */
  async exists(...keys: string[]): Promise<number> {
    return await this.client.exists(...keys);
  }

  /**
   * Set expiration for a key
   */
  async expire(key: string, seconds: number): Promise<number> {
    return await this.client.expire(key, seconds);
  }

  /**
   * Get time to live for a key
   */
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================

  /**
   * Get multiple values by keys
   */
  async mget<T = any>(...keys: string[]): Promise<(T | null)[]> {
    const values = await this.client.mget(...keys);
    return values.map((value: any) => {
      if (!value) return null;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T;
        }
      }
      return value as T;
    });
  }

  /**
   * Set multiple key-value pairs
   */
  async mset(pairs: Record<string, any>): Promise<string> {
    const serializedPairs: Record<string, string> = {};
    for (const [key, value] of Object.entries(pairs)) {
      serializedPairs[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return await this.client.mset(serializedPairs);
  }

  /**
   * Increment a numeric value
   */
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  /**
   * Increment by a specific amount
   */
  async incrby(key: string, increment: number): Promise<number> {
    return await this.client.incrby(key, increment);
  }

  /**
   * Decrement a numeric value
   */
  async decr(key: string): Promise<number> {
    return await this.client.decr(key);
  }

  /**
   * Decrement by a specific amount
   */
  async decrby(key: string, decrement: number): Promise<number> {
    return await this.client.decrby(key, decrement);
  }

  // ==========================================================================
  // UTILITY OPERATIONS
  // ==========================================================================

  /**
   * Scan keys with pattern
   */
  async scan(
    cursor: number,
    options?: { match?: string; count?: number },
  ): Promise<[number, string[]]> {
    const result = await this.client.scan(cursor, options || {});
    return [Number(result[0]), result[1] as string[]];
  }

  /**
   * Test connection
   */
  async ping(): Promise<string> {
    return await this.client.ping();
  }

  // ==========================================================================
  // HASH OPERATIONS
  // ==========================================================================

  /**
   * Set hash field values
   */
  async hset(key: string, fieldValues: Record<string, any>): Promise<number> {
    const serialized: Record<string, string> = {};
    for (const [field, value] of Object.entries(fieldValues)) {
      serialized[field] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return await this.client.hset(key, serialized);
  }

  async hget<T = any>(key: string, field: string): Promise<T | null> {
    const result = await this.client.hget(key, field);
    if (!result) return null;

    if (typeof result === 'string') {
      try {
        return JSON.parse(result) as T;
      } catch {
        return result as T;
      }
    }

    return result as T;
  }

  async hgetall<T = any>(key: string): Promise<Record<string, T>> {
    const result = await this.client.hgetall(key);
    const parsed: Record<string, T> = {};

    for (const [field, value] of Object.entries(result || {})) {
      if (typeof value === 'string') {
        try {
          parsed[field] = JSON.parse(value);
        } catch {
          parsed[field] = value as T;
        }
      } else {
        parsed[field] = value as T;
      }
    }

    return parsed;
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    return await this.client.hdel(key, ...fields);
  }

  // ==========================================================================
  // LIST OPERATIONS
  // ==========================================================================

  /**
   * Push values to the left (beginning) of a list
   */
  async lpush<T = any>(key: string, ...values: T[]): Promise<number> {
    const stringValues = values.map(v => (typeof v === 'string' ? v : JSON.stringify(v)));
    return await this.client.lpush(key, ...stringValues);
  }

  async rpush<T = any>(key: string, ...values: T[]): Promise<number> {
    const stringValues = values.map(v => (typeof v === 'string' ? v : JSON.stringify(v)));
    return await this.client.rpush(key, ...stringValues);
  }

  async lpop<T = any>(key: string): Promise<T | null> {
    const result = await this.client.lpop(key);
    if (!result) return null;

    if (typeof result === 'string') {
      try {
        return JSON.parse(result) as T;
      } catch {
        return result as T;
      }
    }

    return result as T;
  }

  async rpop<T = any>(key: string): Promise<T | null> {
    const result = await this.client.rpop(key);
    if (!result) return null;

    if (typeof result === 'string') {
      try {
        return JSON.parse(result) as T;
      } catch {
        return result as T;
      }
    }

    return result as T;
  }

  async lrange<T = any>(key: string, start: number, end: number): Promise<T[]> {
    const values = await this.client.lrange(key, start, end);
    return values.map((value: any) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T;
        }
      }
      return value as T;
    });
  }

  async llen(key: string): Promise<number> {
    return await this.client.llen(key);
  }

  // ==========================================================================
  // SET OPERATIONS
  // ==========================================================================

  /**
   * Add members to a set
   */
  async sadd<T = any>(key: string, members: T[]): Promise<number> {
    const stringMembers = members.map(m => (typeof m === 'string' ? m : JSON.stringify(m)));
    return await this.client.sadd(key, stringMembers);
  }

  async srem<T = any>(key: string, members: T[]): Promise<number> {
    const stringMembers = members.map(m => (typeof m === 'string' ? m : JSON.stringify(m)));
    return await this.client.srem(key, stringMembers);
  }

  async smembers<T = any>(key: string): Promise<T[]> {
    const values = await this.client.smembers(key);
    return values.map((value: any) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T;
        }
      }
      return value as T;
    });
  }

  async sismember<T = any>(key: string, member: T): Promise<number> {
    const stringMember = typeof member === 'string' ? member : JSON.stringify(member);
    return await this.client.sismember(key, stringMember);
  }

  // ==========================================================================
  // SORTED SET OPERATIONS
  // ==========================================================================

  /**
   * Add members with scores to a sorted set
   */
  async zadd(key: string, ...args: any[]): Promise<number | null> {
    return await (this.client.zadd as any)(key, ...args);
  }

  async zrange<T = any>(key: string, start: number, end: number, options?: any): Promise<T[]> {
    const result = await this.client.zrange(key, start, end, options);

    if (options?.withScores) {
      return result as T[];
    }

    return (result as string[]).map((value: any) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T;
        }
      }
      return value as T;
    });
  }

  async zscore<T = any>(key: string, member: T): Promise<number | null> {
    const stringMember = typeof member === 'string' ? member : JSON.stringify(member);
    return await this.client.zscore(key, stringMember);
  }

  // ==========================================================================
  // ADVANCED OPERATIONS
  // ==========================================================================

  /**
   * Create a pipeline for batch operations
   */
  pipeline() {
    return this.client.pipeline();
  }

  /**
   * Get raw Redis client for advanced operations
   */
  getClient(): Redis {
    return this.client;
  }
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Default RedisOperations instance for immediate use
 */
export const redisOps = new RedisOperations();

/**
 * Convenience function exports for direct usage without class instantiation
 */
export const {
  set,
  get,
  del,
  exists,
  expire,
  ttl,
  mget,
  mset,
  incr,
  incrby,
  decr,
  decrby,
  scan,
  ping,
  hset,
  hget,
  hgetall,
  hdel,
  lpush,
  rpush,
  lpop,
  rpop,
  lrange,
  llen,
  sadd,
  srem,
  smembers,
  sismember,
  zadd,
  zrange,
  zscore,
  pipeline,
  getClient,
} = redisOps;
