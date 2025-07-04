import { vi } from 'vitest';

// Define types locally to avoid circular dependency
interface MockRedisValue {
  expiration?: number;
  value: string;
}

interface MockPipelineCommand {
  args: any[];
  command: string;
}

// In-memory storage for mock Redis database
class MockRedisStorage {
  private data = new Map<string, MockRedisValue>();
  private lists = new Map<string, string[]>();
  private sets = new Map<string, Set<string>>();
  private hashes = new Map<string, Map<string, string>>();
  private sortedSets = new Map<string, Map<string, number>>();

  // String operations
  set(key: string, value: string, options?: { ex?: number; px?: number }): string {
    const expiration = options?.ex
      ? Date.now() + options.ex * 1000
      : options?.px
        ? Date.now() + options.px
        : undefined;

    this.data.set(key, { expiration, value });
    return 'OK';
  }

  get(key: string): string | null {
    const item = this.data.get(key);
    if (!item) return null;

    if (item.expiration && Date.now() > item.expiration) {
      this.data.delete(key);
      return null;
    }

    return item.value;
  }

  del(...keys: string[]): number {
    let deleted = 0;
    keys.forEach((key) => {
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
      (key) =>
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
    return keys.map((key) => this.get(key));
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
    members.forEach((member) => set.add(member));
    return set.size - initialSize;
  }

  srem(key: string, ...members: string[]): number {
    const set = this.sets.get(key);
    if (!set) return 0;

    let removed = 0;
    members.forEach((member) => {
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
    return fields.map((field) => (hash ? hash.get(field) || null : null));
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
    fields.forEach((field) => {
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

  // Utility operations
  scan(cursor: number, options?: { match?: string; count?: number }): [number, string[]] {
    const allKeys = [
      ...this.data.keys(),
      ...this.lists.keys(),
      ...this.sets.keys(),
      ...this.hashes.keys(),
      ...this.sortedSets.keys(),
    ];

    const match = options?.match;
    const count = options?.count || 10;

    let filteredKeys = allKeys;
    if (match) {
      const pattern = match.replace(/\*/g, '.*');
      filteredKeys = allKeys.filter((key) => {
        const patternParts = pattern.split('*');
        if (patternParts.length === 1) {
          return key === pattern;
        }
        if (patternParts.length === 2) {
          return key.startsWith(patternParts[0]) && key.endsWith(patternParts[1]);
        }
        return key.includes(pattern.replace(/\*/g, ''));
      });
    }

    const start = cursor;
    const end = Math.min(start + count, filteredKeys.length);
    const keys = filteredKeys.slice(start, end);
    const nextCursor = end >= filteredKeys.length ? 0 : end;

    return [nextCursor, keys];
  }

  ping(message?: string): string {
    return message || 'PONG';
  }

  flushall(): string {
    this.data.clear();
    this.lists.clear();
    this.sets.clear();
    this.hashes.clear();
    this.sortedSets.clear();
    return 'OK';
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

// Mock Pipeline class
class MockPipeline {
  private commands: MockPipelineCommand[] = [];

  set(key: string, value: string, options?: { ex?: number }): this {
    this.commands.push({ args: [key, value, options], command: 'set' });
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

  async exec(): Promise<any[]> {
    const results = [];

    for (const { args, command } of this.commands) {
      try {
        const method = (mockStorage as any)[command];
        if (typeof method === 'function') {
          const result = method.apply(mockStorage, args);
          results.push(result);
        } else {
          results.push(new Error(`Unknown command: ${command}`));
        }
      } catch (error) {
        results.push(error);
      }
    }

    this.commands = []; // Clear commands after execution
    return results;
  }
}

// Mock Redis client
export class MockUpstashRedis {
  private storage = mockStorage;

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
    return this.storage.scan(cursor, options);
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
    return values.filter((value) => value !== null).map((value) => JSON.parse(value!)) as T[];
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
  keys.forEach((key) => {
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
