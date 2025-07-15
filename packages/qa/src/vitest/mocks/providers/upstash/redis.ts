import { vi } from 'vitest';

/**
 * @fileoverview Mock implementation of Upstash Redis client with comprehensive Redis operations.
 * Provides in-memory storage that mimics Redis behavior for testing purposes.
 *
 * @example
 * ```ts
 * import { setupVitestUpstashMocks } from '@repo/qa/vitest/mocks/providers/upstash/redis';
 *
 * const { redis } = setupVitestUpstashMocks();
 * await redis.set('key', 'value');
 * const value = await redis.get('key'); // 'value'
 * ```
 */

// Define types locally to avoid circular dependency with enhanced type safety
interface MockRedisValue {
  /** Optional expiration timestamp in milliseconds */
  expiration?: number;
  /** The stored value as a string */
  value: string;
}

interface MockPipelineCommand {
  /** Command arguments */
  args: readonly unknown[];
  /** Redis command name */
  command: string;
}

/** Redis scan cursor result type */
type ScanResult = readonly [cursor: number, keys: readonly string[]];

/** Redis sorted set member with score */
interface SortedSetMember {
  member: string;
  score: number;
}

/**
 * In-memory storage implementation that mimics Redis behavior.
 *
 * @description Provides comprehensive Redis operations including strings,
 * lists, sets, hashes, and sorted sets with proper expiration handling.
 * Thread-safe for testing scenarios.
 */
class MockRedisStorage {
  private readonly data = new Map<string, MockRedisValue>();
  private readonly lists = new Map<string, string[]>();
  private readonly sets = new Map<string, Set<string>>();
  private readonly hashes = new Map<string, Map<string, string>>();
  private readonly sortedSets = new Map<string, Map<string, number>>();

  /** Track operations for debugging and testing validation */
  private readonly operationLog: Array<{ operation: string; key: string; timestamp: number }> = [];

  /**
   * Log an operation for debugging and testing validation.
   * Only keeps the last 100 operations to prevent memory leaks.
   */
  private logOperation(operation: string, key: string): void {
    this.operationLog.push({ operation, key, timestamp: Date.now() });
    if (this.operationLog.length > 100) {
      this.operationLog.shift();
    }
  }

  /**
   * Get recent operations for testing validation.
   */
  getOperationLog(): ReadonlyArray<{ operation: string; key: string; timestamp: number }> {
    return [...this.operationLog];
  }

  // String operations with enhanced type safety and validation
  /**
   * Set a key-value pair with optional expiration.
   *
   * @param key - The key to set
   * @param value - The value to store
   * @param options - Optional expiration settings
   * @returns 'OK' on success
   */
  set(key: string, value: string, options?: { ex?: number; px?: number }): string {
    // Validate input parameters
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw new Error('Invalid key or value type');
    }

    if (options?.ex !== undefined && (options.ex <= 0 || !Number.isInteger(options.ex))) {
      throw new Error('Invalid expiration time: ex must be a positive integer');
    }

    if (options?.px !== undefined && (options.px <= 0 || !Number.isInteger(options.px))) {
      throw new Error('Invalid expiration time: px must be a positive integer');
    }

    const expiration = options?.ex
      ? Date.now() + options.ex * 1000
      : options?.px
        ? Date.now() + options.px
        : undefined;

    this.data.set(key, { expiration, value });
    this.logOperation('SET', key);
    return 'OK';
  }

  /**
   * Get a value by key, handling expiration automatically.
   *
   * @param key - The key to retrieve
   * @returns The value or null if not found/expired
   */
  get(key: string): string | null {
    if (typeof key !== 'string') {
      throw new Error('Invalid key type');
    }

    const item = this.data.get(key);
    if (!item) {
      this.logOperation('GET_MISS', key);
      return null;
    }

    if (item.expiration && Date.now() > item.expiration) {
      this.data.delete(key);
      this.logOperation('GET_EXPIRED', key);
      return null;
    }

    this.logOperation('GET_HIT', key);
    return item.value;
  }

  del(...keys: string[]): number {
    let deleted = 0;
    keys.forEach(key => {
      if (this.data.delete(key)) deleted++;
      if (this.lists.delete(key)) deleted++;
      if (this.sets.delete(key)) deleted++;
      if (this.hashes.delete(key)) deleted++;
      if (this.sortedSets.delete(key)) deleted++;
    });
    return deleted;
  }

  exists(...keys: string[]): number {
    return keys.filter(
      key =>
        this.data.has(key) ||
        this.lists.has(key) ||
        this.sets.has(key) ||
        this.hashes.has(key) ||
        this.sortedSets.has(key),
    ).length;
  }

  expire(key: string, seconds: number): number {
    const item = this.data.get(key);
    if (!item) return 0;

    item.expiration = Date.now() + seconds * 1000;
    return 1;
  }

  ttl(key: string): number {
    const item = this.data.get(key);
    if (!item) return -2;
    if (!item.expiration) return -1;

    const remaining = Math.ceil((item.expiration - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  incr(key: string): number {
    return this.incrby(key, 1);
  }

  incrby(key: string, increment: number): number {
    const current = parseInt(this.get(key) || '0', 10);
    const newValue = current + increment;
    this.set(key, newValue.toString());
    return newValue;
  }

  decr(key: string): number {
    return this.decrby(key, 1);
  }

  decrby(key: string, decrement: number): number {
    return this.incrby(key, -decrement);
  }

  mget(...keys: string[]): (string | null)[] {
    return keys.map(key => this.get(key));
  }

  mset(...keyValues: string[]): string {
    for (let i = 0; i < keyValues.length; i += 2) {
      this.set(keyValues[i], keyValues[i + 1]);
    }
    return 'OK';
  }

  // List operations
  lpush(key: string, ...values: string[]): number {
    if (!this.lists.has(key)) {
      this.lists.set(key, []);
    }
    const list = this.lists.get(key)!;
    list.unshift(...values.reverse());
    return list.length;
  }

  rpush(key: string, ...values: string[]): number {
    if (!this.lists.has(key)) {
      this.lists.set(key, []);
    }
    const list = this.lists.get(key)!;
    list.push(...values);
    return list.length;
  }

  lpop(key: string): string | null {
    const list = this.lists.get(key);
    if (!list || list.length === 0) return null;
    return list.shift() || null;
  }

  rpop(key: string): string | null {
    const list = this.lists.get(key);
    if (!list || list.length === 0) return null;
    return list.pop() || null;
  }

  lrange(key: string, start: number, stop: number): string[] {
    const list = this.lists.get(key);
    if (!list) return [];

    const normalizedStart = start < 0 ? Math.max(0, list.length + start) : start;
    const normalizedStop = stop < 0 ? list.length + stop + 1 : stop + 1;

    return list.slice(normalizedStart, normalizedStop);
  }

  llen(key: string): number {
    const list = this.lists.get(key);
    return list ? list.length : 0;
  }

  // Set operations
  sadd(key: string, ...members: string[]): number {
    if (!this.sets.has(key)) {
      this.sets.set(key, new Set());
    }
    const set = this.sets.get(key)!;
    const initialSize = set.size;
    members.forEach(member => set.add(member));
    return set.size - initialSize;
  }

  srem(key: string, ...members: string[]): number {
    const set = this.sets.get(key);
    if (!set) return 0;

    let removed = 0;
    members.forEach(member => {
      if (set.delete(member)) removed++;
    });
    return removed;
  }

  smembers(key: string): string[] {
    const set = this.sets.get(key);
    return set ? Array.from(set) : [];
  }

  sismember(key: string, member: string): number {
    const set = this.sets.get(key);
    return set && set.has(member) ? 1 : 0;
  }

  spop(key: string, count = 1): string | string[] | null {
    const set = this.sets.get(key);
    if (!set || set.size === 0) return null;

    const members = Array.from(set);
    const popped: string[] = [];

    for (let i = 0; i < Math.min(count, members.length); i++) {
      const randomIndex = Math.floor(Math.random() * members.length);
      const member = members.splice(randomIndex, 1)[0];
      set.delete(member);
      popped.push(member);
    }

    return count === 1 ? popped[0] || null : popped;
  }

  scard(key: string): number {
    const set = this.sets.get(key);
    return set ? set.size : 0;
  }

  // Hash operations
  hset(key: string, field: string, value: string): number;
  hset(key: string, fieldValues: Record<string, string>): number;
  hset(key: string, fieldOrObject: string | Record<string, string>, value?: string): number {
    if (!this.hashes.has(key)) {
      this.hashes.set(key, new Map());
    }
    const hash = this.hashes.get(key)!;

    if (typeof fieldOrObject === 'string' && value !== undefined) {
      const existed = hash.has(fieldOrObject);
      hash.set(fieldOrObject, value);
      return existed ? 0 : 1;
    } else if (typeof fieldOrObject === 'object') {
      let newFields = 0;
      Object.entries(fieldOrObject).forEach(([field, val]) => {
        if (!hash.has(field)) newFields++;
        hash.set(field, val);
      });
      return newFields;
    }

    return 0;
  }

  hget(key: string, field: string): string | null {
    const hash = this.hashes.get(key);
    return hash ? hash.get(field) || null : null;
  }

  hmget(key: string, ...fields: string[]): (string | null)[] {
    const hash = this.hashes.get(key);
    return fields.map(field => (hash ? hash.get(field) || null : null));
  }

  hgetall(key: string): Record<string, string> {
    const hash = this.hashes.get(key);
    if (!hash) return {};

    const result: Record<string, string> = {};
    hash.forEach((value, field) => {
      result[field] = value;
    });
    return result;
  }

  hdel(key: string, ...fields: string[]): number {
    const hash = this.hashes.get(key);
    if (!hash) return 0;

    let deleted = 0;
    fields.forEach(field => {
      if (hash.delete(field)) deleted++;
    });
    return deleted;
  }

  // Sorted set operations
  zadd(key: string, ...scoreMembers: { score: number; member: string }[]): number {
    if (!this.sortedSets.has(key)) {
      this.sortedSets.set(key, new Map());
    }
    const zset = this.sortedSets.get(key)!;

    let added = 0;
    scoreMembers.forEach(({ member, score }) => {
      if (!zset.has(member)) added++;
      zset.set(member, score);
    });
    return added;
  }

  zrange(
    key: string,
    start: number,
    stop: number,
    options?: { withScores?: boolean },
  ): string[] | { member: string; score: number }[] {
    const zset = this.sortedSets.get(key);
    if (!zset) return [];

    const sortedMembers = Array.from(zset.entries())
      .sort(([, a], [, b]) => a - b)
      .map(([member, score]) => ({ member, score }));

    const normalizedStart = start < 0 ? Math.max(0, sortedMembers.length + start) : start;
    const normalizedStop = stop < 0 ? sortedMembers.length + stop + 1 : stop + 1;

    const slice = sortedMembers.slice(normalizedStart, normalizedStop);

    if (options?.withScores) {
      return slice;
    } else {
      return slice.map(({ member }) => member);
    }
  }

  zscore(key: string, member: string): number | null {
    const zset = this.sortedSets.get(key);
    return zset ? zset.get(member) || null : null;
  }

  zcard(key: string): number {
    const zset = this.sortedSets.get(key);
    return zset ? zset.size : 0;
  }

  // Utility operations with enhanced security and performance
  /**
   * Scan for keys matching a pattern (Redis SCAN command).
   *
   * @param cursor - Scan cursor position
   * @param options - Scan options (pattern and count)
   * @returns Tuple of [nextCursor, matchingKeys]
   */
  scan(cursor: number, options?: { match?: string; count?: number }): ScanResult {
    const allKeys = [
      ...this.data.keys(),
      ...this.lists.keys(),
      ...this.sets.keys(),
      ...this.hashes.keys(),
      ...this.sortedSets.keys(),
    ];

    // Validate cursor parameter
    if (typeof cursor !== 'number' || cursor < 0 || !Number.isInteger(cursor)) {
      throw new Error('Invalid cursor: must be a non-negative integer');
    }

    const match = options?.match;
    const count = Math.max(1, Math.min(options?.count || 10, 1000)); // Limit count to prevent abuse

    let filteredKeys = allKeys;
    if (match) {
      // Enhanced security: validate pattern before processing
      if (typeof match !== 'string' || match.length > 100) {
        throw new Error('Invalid match pattern: must be a string with length <= 100');
      }

      // Use secure pattern matching without RegExp for security
      filteredKeys = allKeys.filter(key => this.matchesPattern(key, match));
    }

    const start = cursor;
    const end = Math.min(start + count, filteredKeys.length);
    const keys = filteredKeys.slice(start, end);
    const nextCursor = end >= filteredKeys.length ? 0 : end;

    this.logOperation('SCAN', `cursor:${cursor}`);
    return [nextCursor, keys] as const;
  }

  ping(message?: string): string {
    return message || 'PONG';
  }

  /**
   * Clear all data from the mock Redis instance.
   *
   * @returns 'OK' on success
   */
  flushall(): string {
    const keyCount =
      this.data.size + this.lists.size + this.sets.size + this.hashes.size + this.sortedSets.size;

    this.data.clear();
    this.lists.clear();
    this.sets.clear();
    this.hashes.clear();
    this.sortedSets.clear();
    this.operationLog.length = 0; // Clear operation log as well

    this.logOperation('FLUSHALL', `cleared:${keyCount}`);
    return 'OK';
  }

  /**
   * Secure pattern matching without RegExp to prevent ReDoS attacks.
   * Supports Redis glob patterns: *, ?, [abc], [a-z]
   */
  private matchesPattern(key: string, pattern: string): boolean {
    // Simple glob pattern matching without regex
    if (pattern === '*') return true;
    if (pattern === key) return true;

    // For complex patterns, use a simple character-by-character approach
    let keyIndex = 0;
    let patternIndex = 0;

    while (keyIndex < key.length && patternIndex < pattern.length) {
      const patternChar = pattern[patternIndex];

      if (patternChar === '*') {
        // Handle wildcard - match any sequence
        if (patternIndex === pattern.length - 1) return true; // Pattern ends with *

        // Find the next non-wildcard character in pattern
        const nextChar = pattern[patternIndex + 1];
        const nextIndex = key.indexOf(nextChar, keyIndex);
        if (nextIndex === -1) return false;

        keyIndex = nextIndex;
        patternIndex += 2;
      } else if (patternChar === '?') {
        // Match any single character
        keyIndex++;
        patternIndex++;
      } else if (patternChar === key[keyIndex]) {
        // Exact character match
        keyIndex++;
        patternIndex++;
      } else {
        return false;
      }
    }

    // Check if we've consumed both strings completely
    return keyIndex === key.length && patternIndex === pattern.length;
  }

  flushdb(): string {
    return this.flushall();
  }

  clear(): void {
    this.flushall();
  }
}

// Global mock storage instance
const mockStorage = new MockRedisStorage();

/**
 * Mock Redis pipeline for batching commands.
 *
 * @description Allows batching multiple Redis commands for execution
 * in a single operation, improving performance in test scenarios.
 */
class MockPipeline {
  private readonly commands: MockPipelineCommand[] = [];
  private readonly maxCommands = 1000; // Prevent memory abuse

  /**
   * Add a SET command to the pipeline.
   */
  set(key: string, value: string, options?: { ex?: number }): this {
    if (this.commands.length >= this.maxCommands) {
      throw new Error(`Pipeline command limit exceeded: ${this.maxCommands}`);
    }
    this.commands.push({ args: [key, value, options] as const, command: 'set' });
    return this;
  }

  get(key: string): this {
    this.commands.push({ args: [key], command: 'get' });
    return this;
  }

  incr(key: string): this {
    this.commands.push({ args: [key], command: 'incr' });
    return this;
  }

  incrby(key: string, increment: number): this {
    this.commands.push({ args: [key, increment], command: 'incrby' });
    return this;
  }

  decrby(key: string, decrement: number): this {
    this.commands.push({ args: [key, decrement], command: 'decrby' });
    return this;
  }

  del(...keys: string[]): this {
    this.commands.push({ args: keys, command: 'del' });
    return this;
  }

  /**
   * Execute all commands in the pipeline.
   *
   * @returns Array of results corresponding to each command
   */
  async exec(): Promise<readonly unknown[]> {
    const results: unknown[] = [];

    for (const { args, command } of this.commands) {
      try {
        // Type-safe method lookup
        const method = (mockStorage as unknown as Record<string, unknown>)[command];
        if (typeof method === 'function') {
          const result = method.apply(mockStorage, args as unknown[]);
          results.push(result);
        } else {
          results.push(new Error(`Unknown command: ${command}`));
        }
      } catch (error) {
        results.push(error instanceof Error ? error : new Error(String(error)));
      }
    }

    this.commands.length = 0; // Clear commands after execution
    return results;
  }
}

/**
 * Mock Upstash Redis client implementation.
 *
 * @description Provides a complete Redis-compatible interface for testing
 * with in-memory storage and proper async behavior.
 */
export class MockUpstashRedis {
  private readonly storage = mockStorage;

  /**
   * Get operation log for testing validation.
   */
  getOperationLog(): ReadonlyArray<{ operation: string; key: string; timestamp: number }> {
    return this.storage.getOperationLog();
  }

  // String operations
  async set(key: string, value: string, options?: { ex?: number; px?: number }): Promise<string> {
    return this.storage.set(key, value, options);
  }

  async get(key: string): Promise<string | null> {
    return this.storage.get(key);
  }

  async del(...keys: string[]): Promise<number> {
    return this.storage.del(...keys);
  }

  async exists(...keys: string[]): Promise<number> {
    return this.storage.exists(...keys);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.storage.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.storage.ttl(key);
  }

  async incr(key: string): Promise<number> {
    return this.storage.incr(key);
  }

  async incrby(key: string, increment: number): Promise<number> {
    return this.storage.incrby(key, increment);
  }

  async decr(key: string): Promise<number> {
    return this.storage.decr(key);
  }

  async decrby(key: string, decrement: number): Promise<number> {
    return this.storage.decrby(key, decrement);
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    return this.storage.mget(...keys);
  }

  async mset(...keyValues: string[]): Promise<string> {
    return this.storage.mset(...keyValues);
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.storage.lpush(key, ...values);
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    return this.storage.rpush(key, ...values);
  }

  async lpop(key: string): Promise<string | null> {
    return this.storage.lpop(key);
  }

  async rpop(key: string): Promise<string | null> {
    return this.storage.rpop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.storage.lrange(key, start, stop);
  }

  async llen(key: string): Promise<number> {
    return this.storage.llen(key);
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.storage.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.storage.srem(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.storage.smembers(key);
  }

  async sismember(key: string, member: string): Promise<number> {
    return this.storage.sismember(key, member);
  }

  async spop(key: string, count?: number): Promise<string | string[] | null> {
    return this.storage.spop(key, count);
  }

  async scard(key: string): Promise<number> {
    return this.storage.scard(key);
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number>;
  async hset(key: string, fieldValues: Record<string, string>): Promise<number>;
  async hset(
    key: string,
    fieldOrObject: string | Record<string, string>,
    value?: string,
  ): Promise<number> {
    return this.storage.hset(key, fieldOrObject as any, value as any);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.storage.hget(key, field);
  }

  async hmget(key: string, ...fields: string[]): Promise<(string | null)[]> {
    return this.storage.hmget(key, ...fields);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.storage.hgetall(key);
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    return this.storage.hdel(key, ...fields);
  }

  // Sorted set operations
  async zadd(key: string, ...scoreMembers: { score: number; member: string }[]): Promise<number> {
    return this.storage.zadd(key, ...scoreMembers);
  }

  async zrange(
    key: string,
    start: number,
    stop: number,
    options?: { withScores?: boolean },
  ): Promise<string[] | { member: string; score: number }[]> {
    return this.storage.zrange(key, start, stop, options);
  }

  async zscore(key: string, member: string): Promise<number | null> {
    return this.storage.zscore(key, member);
  }

  async zcard(key: string): Promise<number> {
    return this.storage.zcard(key);
  }

  // Utility operations
  async scan(
    cursor: number,
    options?: { match?: string; count?: number },
  ): Promise<[number, string[]]> {
    const result = this.storage.scan(cursor, options);
    return [result[0], [...result[1]]];
  }

  async ping(message?: string): Promise<string> {
    return this.storage.ping(message);
  }

  async flushall(): Promise<string> {
    return this.storage.flushall();
  }

  async flushdb(): Promise<string> {
    return this.storage.flushdb();
  }

  // Pipeline support
  pipeline(): MockPipeline {
    return new MockPipeline();
  }

  // Static method for creating from env
  static fromEnv(): MockUpstashRedis {
    return new MockUpstashRedis();
  }
}

// Mock instances
export const mockUpstashRedisClient = new MockUpstashRedis();

// Mock Upstash Redis adapter
export const mockUpstashRedisAdapter = {
  client: mockUpstashRedisClient,

  async initialize(): Promise<void> {
    await mockUpstashRedisClient.ping();
  },

  async disconnect(): Promise<void> {
    // Mock disconnection
  },

  getClient() {
    return mockUpstashRedisClient;
  },

  async create<T>(collection: string, data: any): Promise<T> {
    if (!data.id) {
      throw new Error('Data must have an "id" field for Redis storage');
    }

    const key = `${collection}:${data.id}`;
    await mockUpstashRedisClient.set(key, JSON.stringify(data));
    return data as T;
  },

  async update<T>(collection: string, id: string, data: any): Promise<T> {
    const key = `${collection}:${id}`;
    const existing = await mockUpstashRedisClient.get(key);
    const existingData = existing ? JSON.parse(existing) : {};
    const updatedData = { ...existingData, ...data, id };

    await mockUpstashRedisClient.set(key, JSON.stringify(updatedData));
    return updatedData as T;
  },

  async delete<T>(collection: string, id: string): Promise<T> {
    const key = `${collection}:${id}`;
    const existing = await mockUpstashRedisClient.get(key);
    const existingData = existing ? JSON.parse(existing) : null;

    await mockUpstashRedisClient.del(key);
    return existingData as T;
  },

  async findUnique<T>(collection: string, query: { id: string }): Promise<T | null> {
    const key = `${collection}:${query.id}`;
    const result = await mockUpstashRedisClient.get(key);
    return result ? JSON.parse(result) : null;
  },

  async findMany<T>(
    collection: string,
    query?: { pattern?: string; limit?: number },
  ): Promise<T[]> {
    const pattern = query?.pattern || `${collection}:*`;
    const limit = query?.limit || 100;

    let cursor = 0;
    const keys: string[] = [];

    do {
      const [nextCursor, foundKeys] = await mockUpstashRedisClient.scan(cursor, {
        count: Math.min(limit, 100),
        match: pattern,
      });

      cursor = nextCursor;
      keys.push(...foundKeys);

      if (keys.length >= limit) break;
    } while (cursor !== 0);

    if (keys.length === 0) return [];

    const values = await mockUpstashRedisClient.mget(...keys.slice(0, limit));
    return values.filter(value => value !== null).map(value => JSON.parse(value!)) as T[];
  },

  async count(collection: string, query?: { pattern?: string }): Promise<number> {
    const pattern = query?.pattern || `${collection}:*`;

    let cursor = 0;
    let count = 0;

    do {
      const [nextCursor, keys] = await mockUpstashRedisClient.scan(cursor, {
        count: 100,
        match: pattern,
      });

      cursor = nextCursor;
      count += keys.length;
    } while (cursor !== 0);

    return count;
  },

  async raw<T = any>(operation: string, params: any): Promise<T> {
    const client = mockUpstashRedisClient as any;
    if (typeof client[operation] === 'function') {
      const args = Array.isArray(params) ? params : [params];
      return await client[operation](...args);
    }
    throw new Error(`Operation '${operation}' not supported on mock Upstash Redis client`);
  },

  // Redis-specific methods would be here...
  async setWithExpiration<T>(
    collection: string,
    id: string,
    data: any,
    expirationSeconds: number,
  ): Promise<T> {
    const key = `${collection}:${id}`;
    await mockUpstashRedisClient.set(key, JSON.stringify(data), { ex: expirationSeconds });
    return { ...data, id } as T;
  },

  async ping(): Promise<string> {
    return await mockUpstashRedisClient.ping();
  },

  async flushAll(): Promise<string> {
    return await mockUpstashRedisClient.flushall();
  },
};

// SRH (Serverless Redis HTTP) integration
// This uses the actual SRH package when available, falling back to mocks when not
export const srhUpstashRedisAdapter = {
  client: null as any,

  async initialize(): Promise<void> {
    try {
      // Try to import the real Upstash Redis client
      let module;
      try {
        const moduleName = '@upstash/redis';
        module = await import(/* @vite-ignore */ moduleName);
      } catch {
        // @upstash/redis not available, use mock
        this.client = mockUpstashRedisClient;
        console.log('Using mock Redis client (@upstash/redis not available)');
        return;
      }

      if (!module) {
        this.client = mockUpstashRedisClient;
        return;
      }
      const { Redis } = module;

      // Check if we're in an SRH environment (localhost or srh in URL)
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;

      if (url && token && (url.includes('localhost') || url.includes('srh'))) {
        // Use real Upstash Redis client with SRH
        this.client = new Redis({
          url,
          token,
        });

        // Test the connection
        await this.client.ping();
        console.log('Connected to SRH (Serverless Redis HTTP)');
      } else {
        // Fall back to mock client
        this.client = mockUpstashRedisClient;
        console.log('Using mock Redis client');
      }
    } catch (error) {
      // If import fails or connection fails, use mock
      console.warn('Failed to connect to SRH, using mock Redis client:', error);
      this.client = mockUpstashRedisClient;
    }
  },

  async disconnect(): Promise<void> {
    if (this.client && typeof this.client.disconnect === 'function') {
      await this.client.disconnect();
    }
    this.client = null;
  },

  getClient() {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call initialize() first.');
    }
    return this.client;
  },

  async create<T>(collection: string, data: any): Promise<T> {
    if (!data.id) {
      throw new Error('Data must have an "id" field for Redis storage');
    }

    const key = `${collection}:${data.id}`;
    await this.getClient().set(key, JSON.stringify(data));
    return data as T;
  },

  async update<T>(collection: string, id: string, data: any): Promise<T> {
    const key = `${collection}:${id}`;
    const existing = await this.getClient().get(key);
    const existingData = existing ? JSON.parse(existing) : {};
    const updatedData = { ...existingData, ...data, id };

    await this.getClient().set(key, JSON.stringify(updatedData));
    return updatedData as T;
  },

  async delete<T>(collection: string, id: string): Promise<T> {
    const key = `${collection}:${id}`;
    const existing = await this.getClient().get(key);
    const existingData = existing ? JSON.parse(existing) : null;

    await this.getClient().del(key);
    return existingData as T;
  },

  async findUnique<T>(collection: string, query: { id: string }): Promise<T | null> {
    const key = `${collection}:${query.id}`;
    const result = await this.getClient().get(key);
    return result ? JSON.parse(result) : null;
  },

  async findMany<T>(
    collection: string,
    query?: { pattern?: string; limit?: number },
  ): Promise<T[]> {
    const pattern = query?.pattern || `${collection}:*`;
    const limit = query?.limit || 100;

    let cursor = 0;
    const keys: string[] = [];

    do {
      const [nextCursor, foundKeys] = await this.getClient().scan(cursor, {
        count: Math.min(limit, 100),
        match: pattern,
      });

      cursor = nextCursor;
      keys.push(...foundKeys);

      if (keys.length >= limit) break;
    } while (cursor !== 0);

    if (keys.length === 0) return [];

    const values = await this.getClient().mget(...keys.slice(0, limit));
    return values
      .filter((value: any) => value !== null)
      .map((value: any) => JSON.parse(value!)) as T[];
  },

  async count(collection: string, query?: { pattern?: string }): Promise<number> {
    const pattern = query?.pattern || `${collection}:*`;

    let cursor = 0;
    let count = 0;

    do {
      const [nextCursor, keys] = await this.getClient().scan(cursor, {
        count: 100,
        match: pattern,
      });

      cursor = nextCursor;
      count += keys.length;
    } while (cursor !== 0);

    return count;
  },

  async raw<T = any>(operation: string, params: any): Promise<T> {
    const client = this.getClient() as any;
    if (typeof client[operation] === 'function') {
      const args = Array.isArray(params) ? params : [params];
      return await client[operation](...args);
    }
    throw new Error(`Operation '${operation}' not supported on Redis client`);
  },

  // Redis-specific methods
  async setWithExpiration<T>(
    collection: string,
    id: string,
    data: any,
    expirationSeconds: number,
  ): Promise<T> {
    const key = `${collection}:${id}`;
    await this.getClient().set(key, JSON.stringify(data), { ex: expirationSeconds });
    return { ...data, id } as T;
  },

  async ping(): Promise<string> {
    return await this.getClient().ping();
  },

  async flushAll(): Promise<string> {
    return await this.getClient().flushall();
  },
};

// Vitest mocks
export const mockUpstashRedis = {
  fromEnv: vi.fn().mockReturnValue(mockUpstashRedisClient),
  Redis: vi.fn().mockImplementation(() => mockUpstashRedisClient),
};

// Helper functions
export const resetMockRedisStorage = (): void => {
  mockStorage.clear();
};

export const seedMockRedisData = (data: Record<string, any>): void => {
  Object.entries(data).forEach(([key, value]) => {
    mockStorage.set(key, typeof value === 'string' ? value : JSON.stringify(value));
  });
};

export const getMockRedisState = (): Record<string, string> => {
  const state: Record<string, string> = {};

  // Get all keys and their values
  const [, keys] = mockStorage.scan(0, { count: 1000 });
  keys.forEach(key => {
    const value = mockStorage.get(key);
    if (value !== null) {
      state[key] = value;
    }
  });

  return state;
};

export const setupMockRedisEnvironment = (): void => {
  process.env.UPSTASH_REDIS_REST_URL = 'https://mock-redis.upstash.io';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-token';
};

export const cleanupMockRedisEnvironment = (): void => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  resetMockRedisStorage();
};

// SRH-specific helper functions
export const setupSRHRedisEnvironment = (): void => {
  process.env.UPSTASH_REDIS_REST_URL = 'http://localhost:8080';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'srh-token';
};

export const cleanupSRHRedisEnvironment = (): void => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
};

// Factory function to create Redis client based on environment
export const createRedisClient = async (): Promise<any> => {
  try {
    let module;
    try {
      const moduleName = '@upstash/redis';
      module = await import(/* @vite-ignore */ moduleName);
    } catch {
      // @upstash/redis not available, use mock
      return new MockUpstashRedis();
    }

    if (!module) {
      return new MockUpstashRedis();
    }
    const { Redis } = module;
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    // If SRH environment is detected, use real Upstash Redis client
    if (url && token && (url.includes('localhost') || url.includes('srh'))) {
      return new Redis({ url, token });
    }
  } catch (error) {
    console.warn('Failed to import @upstash/redis, using mock client:', error);
  }

  // Otherwise use mock client
  return new MockUpstashRedis();
};

// Factory function to create Redis adapter based on environment
export const createRedisAdapter = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // If SRH environment is detected, use SRH adapter
  if (url && token && (url.includes('localhost') || url.includes('srh'))) {
    return srhUpstashRedisAdapter;
  }

  // Otherwise use mock adapter
  return mockUpstashRedisAdapter;
};

/**
 * Create a Vitest-compatible Redis mock client with enhanced type safety.
 *
 * @description Creates a mock Redis client optimized for Vitest testing
 * with proper mock functions and memory management.
 *
 * @returns Mock Redis client with Vitest spies
 */
export const createVitestCompatibleRedisClient = () => {
  // Mock storage for testing - single source of truth with type safety
  const storage = new Map<string, unknown>();
  const operationLog: Array<{ operation: string; key: string; timestamp: number }> = [];

  const logOperation = (operation: string, key: string): void => {
    operationLog.push({ operation, key, timestamp: Date.now() });
    if (operationLog.length > 100) {
      operationLog.shift();
    }
  };

  const client = {
    // String operations
    get: vi.fn().mockImplementation((key: string) => {
      const value = storage.get(key);
      return Promise.resolve(value || null);
    }),
    set: vi.fn().mockImplementation((key: string, value: string, options?: { ex?: number }) => {
      storage.set(key, value);
      return Promise.resolve('OK');
    }),
    del: vi.fn().mockImplementation((...keys: string[]) => {
      let deleted = 0;
      keys.forEach(key => {
        if (storage.delete(key)) deleted++;
      });
      return Promise.resolve(deleted);
    }),

    // Hash operations
    hget: vi.fn().mockResolvedValue(null),
    hset: vi.fn().mockResolvedValue(1),
    hdel: vi.fn().mockResolvedValue(1),
    hgetall: vi.fn().mockResolvedValue({}),

    // Sorted set operations
    zadd: vi.fn().mockImplementation((key: string, scoreMembers: any) => {
      const setKey = `zset:${key}`;
      if (!storage.has(setKey)) {
        storage.set(setKey, new Map());
      }
      const zset = storage.get(setKey);

      if (typeof scoreMembers === 'object' && 'score' in scoreMembers && zset instanceof Map) {
        zset.set(scoreMembers.member, scoreMembers.score);
      }
      return Promise.resolve(1);
    }),
    zrange: vi.fn().mockImplementation((key: string) => {
      const setKey = `zset:${key}`;
      const zset = storage.get(setKey);
      if (zset instanceof Map) {
        // Return sorted members
        const members = Array.from(zset.keys()).sort((a, b) => {
          const scoreA = zset.get(a) || 0;
          const scoreB = zset.get(b) || 0;
          return scoreA - scoreB;
        });
        return Promise.resolve(members);
      }
      return Promise.resolve([]);
    }),
    zrem: vi.fn().mockResolvedValue(1),
    zremrangebyrank: vi.fn().mockResolvedValue(1),

    // List operations
    lpush: vi.fn().mockResolvedValue(1),
    rpush: vi.fn().mockResolvedValue(1),
    lpop: vi.fn().mockResolvedValue(null),
    rpop: vi.fn().mockResolvedValue(null),
    lrange: vi.fn().mockResolvedValue([]),

    // Set operations
    sadd: vi.fn().mockResolvedValue(1),
    srem: vi.fn().mockResolvedValue(1),
    smembers: vi.fn().mockResolvedValue([]),

    // Generic operations
    exists: vi.fn().mockResolvedValue(0),
    expire: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(-1),
    keys: vi.fn().mockImplementation((pattern: string) => {
      const keys = Array.from(storage.keys());
      if (pattern === '*') return Promise.resolve(keys);

      // Simple pattern matching for workflow:* patterns
      // Use string methods instead of RegExp for security
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        return Promise.resolve(keys.filter(key => key.startsWith(prefix)));
      }
      if (pattern.startsWith('*')) {
        const suffix = pattern.slice(1);
        return Promise.resolve(keys.filter(key => key.endsWith(suffix)));
      }
      // Exact match
      return Promise.resolve(keys.filter(key => key === pattern));
    }),
    ping: vi.fn().mockResolvedValue('PONG'),

    // Pipeline operations
    pipeline: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnThis(),
      get: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([]),
    }),

    // Internal testing helpers - same storage reference with enhanced debugging
    _getStorage: () => ({
      set: (key: string, value: unknown) => {
        storage.set(key, value);
        logOperation('INTERNAL_SET', key);
      },
      get: (key: string) => storage.get(key),
      delete: (key: string) => {
        const result = storage.delete(key);
        logOperation('INTERNAL_DELETE', key);
        return result;
      },
      clear: () => {
        const size = storage.size;
        storage.clear();
        operationLog.length = 0;
        logOperation('INTERNAL_CLEAR', `cleared:${size}`);
      },
      size: () => storage.size,
    }),
    _clear: () => {
      const size = storage.size;
      storage.clear();
      operationLog.length = 0;
      logOperation('CLEAR', `cleared:${size}`);
    },
    _getOperationLog: () => [...operationLog],
  };

  return client;
};

// Global setup functions for compatibility with existing tests
export const setupUpstashMocks = () => {
  const mockRedis = mockUpstashRedisClient;

  // Mock @upstash/redis
  vi.doMock('@upstash/redis', () => ({
    Redis: vi.fn().mockImplementation(() => mockRedis),
  }));

  return {
    redis: mockRedis,
  };
};

// Vitest-compatible setup function for testing
export const setupVitestUpstashMocks = () => {
  const mockRedis = createVitestCompatibleRedisClient();

  // Mock @upstash/redis
  vi.doMock('@upstash/redis', () => ({
    Redis: vi.fn().mockImplementation(() => mockRedis),
  }));

  return {
    redis: mockRedis,
  };
};

/**
 * Reset all Upstash Redis mocks to clean state.
 *
 * @param mocks - Optional mock objects to reset
 */
export const resetUpstashMocks = (mocks?: { redis?: { _clear?(): void } }) => {
  vi.clearAllMocks();
  resetMockRedisStorage();

  if (mocks?.redis?._clear) {
    mocks.redis._clear();
  }
};

// Mock the @upstash/redis module with proper type safety
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => new MockUpstashRedis()),
  // Add other exports if needed
  Pipeline: vi.fn().mockImplementation(() => new MockPipeline()),
}));
