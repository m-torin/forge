/**
 * Client-side Upstash Redis functionality
 * Browser-compatible Redis operations
 */

import { getDefaultConfig, validateConfig } from './config';
import type { RedisResult, UpstashRedisConfig } from './types';

/**
 * Browser-compatible Redis client
 * Uses Upstash Redis REST API for browser compatibility
 */
class BrowserRedisClient {
  private config: UpstashRedisConfig;
  private baseUrl: string;

  constructor(config: Partial<UpstashRedisConfig> = {}) {
    const defaultConfig = getDefaultConfig();
    this.config = { ...defaultConfig, ...config } as UpstashRedisConfig;
    if (!this.config.url || !this.config.token) {
      throw new Error('Upstash Redis URL and token are required');
    }
    this.baseUrl = this.config.url.replace(/\/$/, '');
  }

  /**
   * Make authenticated request to Upstash Redis REST API
   */
  private async makeRequest(path: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Redis API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.result;
  }

  /**
   * Execute Redis command via REST API
   */
  private async command(...args: (string | number)[]): Promise<any> {
    return this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify(args),
    });
  }

  // Basic string operations
  async get(key: string): Promise<string | null> {
    return this.command('GET', key);
  }

  async set(
    key: string,
    value: string,
    options?: { ex?: number; px?: number; nx?: boolean; xx?: boolean },
  ): Promise<string> {
    const args = ['SET', key, value];
    if (options?.ex) args.push('EX', options.ex);
    if (options?.px) args.push('PX', options.px);
    if (options?.nx) args.push('NX');
    if (options?.xx) args.push('XX');
    return this.command(...args);
  }

  async del(...keys: string[]): Promise<number> {
    return this.command('DEL', ...keys);
  }

  async exists(...keys: string[]): Promise<number> {
    return this.command('EXISTS', ...keys);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.command('EXPIRE', key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.command('TTL', key);
  }

  // Numeric operations
  async incr(key: string): Promise<number> {
    return this.command('INCR', key);
  }

  async decr(key: string): Promise<number> {
    return this.command('DECR', key);
  }

  async incrby(key: string, increment: number): Promise<number> {
    return this.command('INCRBY', key, increment);
  }

  // List operations
  async lpush(key: string, ...elements: string[]): Promise<number> {
    return this.command('LPUSH', key, ...elements);
  }

  async rpush(key: string, ...elements: string[]): Promise<number> {
    return this.command('RPUSH', key, ...elements);
  }

  async lpop(key: string): Promise<string | null> {
    return this.command('LPOP', key);
  }

  async rpop(key: string): Promise<string | null> {
    return this.command('RPOP', key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.command('LRANGE', key, start, stop);
  }

  async llen(key: string): Promise<number> {
    return this.command('LLEN', key);
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.command('SADD', key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.command('SREM', key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.command('SMEMBERS', key);
  }

  async sismember(key: string, member: string): Promise<number> {
    return this.command('SISMEMBER', key, member);
  }

  async scard(key: string): Promise<number> {
    return this.command('SCARD', key);
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number>;
  async hset(key: string, hash: Record<string, string>): Promise<number>;
  async hset(
    key: string,
    fieldOrHash: string | Record<string, string>,
    value?: string,
  ): Promise<number> {
    if (typeof fieldOrHash === 'string' && value !== undefined) {
      return this.command('HSET', key, fieldOrHash, value);
    } else if (typeof fieldOrHash === 'object') {
      const args = ['HSET', key];
      for (const [field, val] of Object.entries(fieldOrHash)) {
        args.push(field, val);
      }
      return this.command(...args);
    }
    throw new Error('Invalid arguments for HSET');
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.command('HGET', key, field);
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    return this.command('HDEL', key, ...fields);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const result = await this.command('HGETALL', key);
    // Convert array to object
    const obj: Record<string, string> = {};
    for (let i = 0; i < result.length; i += 2) {
      obj[result[i]] = result[i + 1];
    }
    return obj;
  }

  async hlen(key: string): Promise<number> {
    return this.command('HLEN', key);
  }

  async hkeys(key: string): Promise<string[]> {
    return this.command('HKEYS', key);
  }

  async hvals(key: string): Promise<string[]> {
    return this.command('HVALS', key);
  }

  // Sorted set operations
  async zadd(key: string, score: number, member: string): Promise<number>;
  async zadd(key: string, ...scoreMembers: (number | string)[]): Promise<number>;
  async zadd(
    key: string,
    scoreOrMember: number | string,
    ...rest: (number | string)[]
  ): Promise<number> {
    return this.command('ZADD', key, scoreOrMember, ...rest);
  }

  async zrange(
    key: string,
    start: number,
    stop: number,
    options?: { withScores?: boolean },
  ): Promise<string[]> {
    const args = ['ZRANGE', key, start, stop];
    if (options?.withScores) args.push('WITHSCORES');
    return this.command(...args);
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    return this.command('ZREM', key, ...members);
  }

  async zscore(key: string, member: string): Promise<number | null> {
    return this.command('ZSCORE', key, member);
  }

  async zcard(key: string): Promise<number> {
    return this.command('ZCARD', key);
  }

  // Pub/Sub (limited in browser)
  async publish(channel: string, message: string): Promise<number> {
    return this.command('PUBLISH', channel, message);
  }

  // Utility commands
  async ping(): Promise<string> {
    return this.command('PING');
  }

  async echo(message: string): Promise<string> {
    return this.command('ECHO', message);
  }

  async flushall(): Promise<string> {
    if (!confirm('Are you sure you want to flush all data? This cannot be undone.')) {
      throw new Error('Flush cancelled by user');
    }
    return this.command('FLUSHALL');
  }
}

/**
 * Browser-optimized Redis cache operations
 */
export class ClientCacheOperations {
  private client: BrowserRedisClient;
  private localCache = new Map<string, { value: any; expires: number }>();

  constructor(config?: Partial<UpstashRedisConfig>) {
    this.client = new BrowserRedisClient(config);
  }

  /**
   * Get with local cache fallback
   */
  async get(key: string, options?: { useLocalCache?: boolean; localTtl?: number }): Promise<any> {
    // Check local cache first
    if (options?.useLocalCache !== false) {
      const cached = this.localCache.get(key);
      if (cached && Date.now() < cached.expires) {
        return cached.value;
      }
    }

    try {
      const value = await this.client.get(key);
      const parsed = value ? JSON.parse(value) : null;

      // Update local cache
      if (parsed && options?.useLocalCache !== false) {
        const localTtl = options?.localTtl || 60000; // 1 minute default
        this.localCache.set(key, {
          value: parsed,
          expires: Date.now() + localTtl,
        });
      }

      return parsed;
    } catch (error) {
      // Return local cache on network error
      const cached = this.localCache.get(key);
      if (cached) return cached.value;
      throw error;
    }
  }

  /**
   * Set with local cache update
   */
  async set(
    key: string,
    value: any,
    options?: {
      ex?: number;
      updateLocalCache?: boolean;
      localTtl?: number;
    },
  ): Promise<void> {
    const serialized = JSON.stringify(value);
    await this.client.set(key, serialized, { ex: options?.ex });

    // Update local cache
    if (options?.updateLocalCache !== false) {
      const localTtl = options?.localTtl || 60000;
      this.localCache.set(key, {
        value,
        expires: Date.now() + localTtl,
      });
    }
  }

  /**
   * Delete with local cache cleanup
   */
  async delete(key: string): Promise<void> {
    await this.client.del(key);
    this.localCache.delete(key);
  }

  /**
   * Clear local cache
   */
  clearLocalCache(): void {
    this.localCache.clear();
  }

  /**
   * Get Redis client
   */
  getClient(): BrowserRedisClient {
    return this.client;
  }
}

/**
 * Safe client operation wrapper
 */
export async function safeClientOperation<T>(operation: () => Promise<T>): Promise<RedisResult<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: message,
      isRetryable: message.includes('timeout') || message.includes('network'),
    };
  }
}

/**
 * Create browser Redis client
 */
export function createClient(config?: Partial<UpstashRedisConfig>): BrowserRedisClient {
  return new BrowserRedisClient(config);
}

/**
 * Create client cache operations helper
 */
export function createClientCache(config?: Partial<UpstashRedisConfig>): ClientCacheOperations {
  return new ClientCacheOperations(config);
}

// Default client
let defaultClient: BrowserRedisClient | null = null;

/**
 * Get or create default client
 */
export function getClient(config?: Partial<UpstashRedisConfig>): BrowserRedisClient {
  if (!defaultClient || config) {
    defaultClient = createClient(config);
  }
  return defaultClient;
}

// Re-export types and utilities
export { getDefaultConfig, validateConfig };
export type { RedisResult, UpstashRedisConfig };
