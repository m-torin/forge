import 'server-only';

import { upstashRedisClientSingleton } from './client';

import { RedisDatabaseAdapter } from '../types';
import { Redis } from '@upstash/redis';

/**
 * Upstash Redis adapter implementing the common DatabaseAdapter interface
 * Note: Redis is a key-value store with different semantics than traditional databases,
 * so some methods are adapted to work with Redis operations
 */
export class UpstashRedisAdapter implements RedisDatabaseAdapter {
  private client = upstashRedisClientSingleton();

  async initialize(): Promise<void> {
    // Upstash Redis doesn't require explicit initialization
    // The client is ready to use once instantiated
    // We can test the connection with a ping
    await this.client.ping();
  }

  async disconnect(): Promise<void> {
    // Upstash Redis is stateless and doesn't require explicit disconnection
  }

  getClient(): Redis {
    return this.client;
  }

  /**
   * Create/Set a key-value pair in Redis
   * @param collection - Used as key prefix in Redis
   * @param data - Data to store (must have an id field)
   */
  async create<T>(collection: string, data: any): Promise<T> {
    if (!data.id) {
      throw new Error('Data must have an "id" field for Redis storage');
    }

    const key = `${collection}:${data.id}`;
    await this.client.set(key, JSON.stringify(data));
    return data as T;
  }

  /**
   * Update a key-value pair in Redis
   * @param collection - Used as key prefix
   * @param id - Record id
   * @param data - Updated data
   */
  async update<T>(collection: string, id: string, data: any): Promise<T> {
    const key = `${collection}:${id}`;

    // Get existing data and merge with updates
    const existing = await this.client.get(key);
    let existingData: Record<string, any> = {};

    if (existing && typeof existing === 'string') {
      existingData = JSON.parse(existing);
    } else if (existing && typeof existing === 'object') {
      existingData = existing;
    }

    const updatedData = { ...existingData, ...data, id };
    await this.client.set(key, JSON.stringify(updatedData));
    return updatedData as T;
  }

  /**
   * Delete a key from Redis
   * @param collection - Used as key prefix
   * @param id - Record id to delete
   */
  async delete<T>(collection: string, id: string): Promise<T> {
    const key = `${collection}:${id}`;

    // Get the data before deletion
    const existing = await this.client.get(key);
    let existingData = null;

    if (existing && typeof existing === 'string') {
      existingData = JSON.parse(existing);
    } else if (existing && typeof existing === 'object') {
      existingData = existing;
    }

    await this.client.del(key);
    return existingData as T;
  }

  /**
   * Find a unique record by id
   * @param collection - Used as key prefix
   * @param query - Object with id property
   */
  async findUnique<T>(collection: string, query: { id: string }): Promise<T | null> {
    const key = `${collection}:${query.id}`;
    const result = await this.client.get(key);

    if (!result) return null;

    if (typeof result === 'string') {
      return JSON.parse(result) as T;
    }

    return result as T;
  }

  /**
   * Find many records by pattern matching
   * @param collection - Used as key prefix
   * @param query - Query parameters (supports pattern matching)
   */
  async findMany<T>(
    collection: string,
    query?: {
      pattern?: string;
      limit?: number;
      cursor?: string;
    },
  ): Promise<T[]> {
    const pattern = query?.pattern || `${collection}:*`;
    const limit = query?.limit || 100;

    // Use SCAN to find keys matching pattern
    const keys = await this.scanKeys(pattern, limit);

    if (keys.length === 0) return [];

    // Get all values for found keys
    const values = await this.client.mget(...keys);

    return values
      .filter((value: any) => value !== null)
      .map((value: any) => {
        if (typeof value === 'string') {
          return JSON.parse(value);
        }
        return value;
      }) as T[];
  }

  /**
   * Count keys matching a pattern
   * @param collection - Used as key prefix
   * @param query - Query parameters with optional pattern
   */
  async count(collection: string, query?: { pattern?: string }): Promise<number> {
    const pattern = query?.pattern || `${collection}:*`;
    const keys = await this.scanKeys(pattern);
    return keys.length;
  }

  /**
   * Execute raw operations on the Redis client
   * @param operation - The operation name
   * @param params - Parameters for the operation
   */
  async raw<T = any>(operation: string, params: any): Promise<T> {
    const client = this.client as any;

    if (typeof client[operation] === 'function') {
      return await client[operation](...(Array.isArray(params) ? params : [params]));
    }

    throw new Error(`Operation '${operation}' not supported on Upstash Redis client`);
  }

  // Helper method to scan keys with pattern
  private async scanKeys(pattern: string, limit = 1000): Promise<string[]> {
    const keys: string[] = [];
    let cursor = 0;

    do {
      const result = await this.client.scan(cursor, {
        count: Math.min(limit, 100), // Redis SCAN count hint
        match: pattern,
      });

      cursor = Number(result[0]);
      keys.push(...result[1]);

      if (keys.length >= limit) break;
    } while (cursor !== 0);

    return keys.slice(0, limit);
  }

  // Additional Redis-specific methods not in the base adapter interface

  /**
   * Set a key with expiration
   */
  async setWithExpiration<T>(
    collection: string,
    id: string,
    data: any,
    expirationSeconds: number,
  ): Promise<T> {
    const key = `${collection}:${id}`;
    await this.client.set(key, JSON.stringify(data), { ex: expirationSeconds });
    return { ...data, id } as T;
  }

  /**
   * Get multiple records by IDs
   */
  async getMultiple<T>(collection: string, ids: string[]): Promise<(T | null)[]> {
    const keys = ids.map((id: any) => `${collection}:${id}`);
    const values = await this.client.mget(...keys);

    return values.map((value: any) => {
      if (!value) return null;
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      return value;
    }) as (T | null)[];
  }

  /**
   * Set multiple key-value pairs
   */
  async setMultiple<T>(
    collection: string,
    records: { id: string; [key: string]: any }[],
  ): Promise<T[]> {
    const pipeline = this.client.pipeline();

    records.forEach((record: any) => {
      const key = `${collection}:${record.id}`;
      pipeline.set(key, JSON.stringify(record));
    });

    await pipeline.exec();
    return records as T[];
  }

  /**
   * Delete multiple records by IDs
   */
  async deleteMultiple<T>(collection: string, ids: string[]): Promise<T[]> {
    const keys = ids.map((id: any) => `${collection}:${id}`);

    // Get existing data before deletion
    const existingValues = await this.client.mget(...keys);

    // Delete the keys
    if (keys.length > 0) {
      await this.client.del(...keys);
    }

    return existingValues
      .filter((value: any) => value !== null)
      .map((value: any) => {
        if (typeof value === 'string') {
          return JSON.parse(value);
        }
        return value;
      }) as T[];
  }

  /**
   * Check if a key exists
   */
  async exists(collection: string, id: string): Promise<boolean> {
    const key = `${collection}:${id}`;
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Set expiration for a key
   */
  async expire(collection: string, id: string, seconds: number): Promise<boolean> {
    const key = `${collection}:${id}`;
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  /**
   * Get time to live for a key
   */
  async ttl(collection: string, id: string): Promise<number> {
    const key = `${collection}:${id}`;
    return await this.client.ttl(key);
  }

  /**
   * Increment a numeric value
   */
  async increment(collection: string, id: string, field?: string, by = 1): Promise<number> {
    const key = field ? `${collection}:${id}:${field}` : `${collection}:${id}`;
    return await this.client.incrby(key, by);
  }

  /**
   * Decrement a numeric value
   */
  async decrement(collection: string, id: string, field?: string, by = 1): Promise<number> {
    const key = field ? `${collection}:${id}:${field}` : `${collection}:${id}`;
    return await this.client.decrby(key, by);
  }

  // List operations
  async listPush<T>(collection: string, id: string, ...values: T[]): Promise<number> {
    const key = `${collection}:${id}`;
    const stringValues = values.map((v: any) => JSON.stringify(v));
    return await this.client.lpush(key, ...stringValues);
  }

  async listPop<T>(collection: string, id: string): Promise<T | null> {
    const key = `${collection}:${id}`;
    const result = await this.client.lpop(key);

    if (!result) return null;

    if (typeof result === 'string') {
      return JSON.parse(result);
    }

    return result as T;
  }

  async listRange<T>(collection: string, id: string, start = 0, end = -1): Promise<T[]> {
    const key = `${collection}:${id}`;
    const values = await this.client.lrange(key, start, end);

    return values.map((value: any) => {
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      return value;
    }) as T[];
  }

  async listLength(collection: string, id: string): Promise<number> {
    const key = `${collection}:${id}`;
    return await this.client.llen(key);
  }

  // Set operations
  async setAdd<T>(collection: string, id: string, ...members: T[]): Promise<number> {
    const key = `${collection}:${id}`;
    const stringMembers = members.map((m: any) => JSON.stringify(m));
    return await this.client.sadd(key, stringMembers);
  }

  async setRemove<T>(collection: string, id: string, ...members: T[]): Promise<number> {
    const key = `${collection}:${id}`;
    const stringMembers = members.map((m: any) => JSON.stringify(m));
    return await this.client.srem(key, stringMembers);
  }

  async setMembers<T>(collection: string, id: string): Promise<T[]> {
    const key = `${collection}:${id}`;
    const values = await this.client.smembers(key);

    return values.map((value: any) => {
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      return value;
    }) as T[];
  }

  async setIsMember<T>(collection: string, id: string, member: T): Promise<boolean> {
    const key = `${collection}:${id}`;
    const result = await this.client.sismember(key, JSON.stringify(member));
    return result === 1;
  }

  // Hash operations
  async hashSet(collection: string, id: string, field: string, value: any): Promise<number> {
    const key = `${collection}:${id}`;
    return await this.client.hset(key, { [field]: JSON.stringify(value) });
  }

  async hashGet<T>(collection: string, id: string, field: string): Promise<T | null> {
    const key = `${collection}:${id}`;
    const result = await this.client.hget(key, field);

    if (!result) return null;

    if (typeof result === 'string') {
      return JSON.parse(result);
    }

    return result as T;
  }

  async hashGetAll<T>(collection: string, id: string): Promise<Record<string, T>> {
    const key = `${collection}:${id}`;
    const result = await this.client.hgetall(key);

    const parsed: Record<string, T> = {};

    for (const [field, value] of Object.entries(result || {})) {
      if (typeof value === 'string') {
        parsed[field] = JSON.parse(value);
      } else {
        parsed[field] = value as T;
      }
    }

    return parsed;
  }

  async hashDelete(collection: string, id: string, ...fields: string[]): Promise<number> {
    const key = `${collection}:${id}`;
    return await this.client.hdel(key, ...fields);
  }

  // Sorted set operations
  async sortedSetAdd(
    collection: string,
    id: string,
    ...members: { score: number; member: any }[]
  ): Promise<number> {
    const key = `${collection}:${id}`;
    if (members.length === 0) return 0;

    // Use the first member to call zadd with the correct signature
    const first = members[0];
    const rest = members.slice(1);

    if (rest.length === 0) {
      return (await this.client.zadd(key, {
        score: first.score,
        member: JSON.stringify(first.member),
      })) as number;
    }

    // For multiple members, use the array approach
    return (await this.client.zadd(
      key,
      { score: first.score, member: JSON.stringify(first.member) },
      ...rest.map((m: any) => ({ score: m.score, member: JSON.stringify(m.member) })),
    )) as number;
  }

  async sortedSetRange<T>(
    collection: string,
    id: string,
    start: number,
    end: number,
    withScores?: boolean,
  ): Promise<any> {
    const key = `${collection}:${id}`;
    const result = await this.client.zrange(
      key,
      start,
      end,
      withScores ? { withScores: true } : undefined,
    );

    if (withScores === true) {
      const pairs = result as { member: string; score: number }[];
      return pairs.map((pair: any) => ({
        member: JSON.parse(pair.member) as T,
        score: pair.score,
      })) as { member: T; score: number }[];
    } else {
      const members = result as string[];
      return members.map((member: any) => JSON.parse(member) as T) as T[];
    }
  }

  async sortedSetScore<T>(collection: string, id: string, member: T): Promise<number | null> {
    const key = `${collection}:${id}`;
    return await this.client.zscore(key, JSON.stringify(member));
  }

  // Utility methods
  async ping(): Promise<string> {
    return await this.client.ping();
  }

  async flushAll(): Promise<string> {
    return await this.client.flushall();
  }

  async flushDb(): Promise<string> {
    return await this.client.flushdb();
  }
}
