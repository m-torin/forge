import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock server-only before importing anything that uses it
vi.mock('server-only', () => ({}));

import { Redis } from '@upstash/redis';
import { RedisOperations } from '../src/redis/server';

// The @upstash/redis module is already mocked in the setup file

describe('Redis Four-File Pattern', () => {
  let redisOps: RedisOperations;
  let mockRedisClient: Redis;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock Redis client with all necessary methods
    const storage = new Map<string, string>();

    mockRedisClient = {
      get: vi.fn().mockImplementation(async (key: string) => {
        const value = storage.get(key);
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }),
      set: vi.fn().mockImplementation(async (key: string, value: any) => {
        storage.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        return 'OK';
      }),
      del: vi.fn().mockImplementation(async (...keys: string[]) => {
        let count = 0;
        keys.forEach(key => {
          if (storage.delete(key)) count++;
        });
        return count;
      }),
      exists: vi.fn().mockImplementation(async (key: string) => {
        return storage.has(key) ? 1 : 0;
      }),
      expire: vi.fn().mockResolvedValue(1),
      ttl: vi.fn().mockResolvedValue(299),
      incr: vi.fn().mockResolvedValue(1),
      decr: vi.fn().mockResolvedValue(0),
      incrby: vi.fn().mockResolvedValue(5),
      decrby: vi.fn().mockResolvedValue(-5),
      hset: vi.fn().mockResolvedValue(1),
      hget: vi.fn().mockResolvedValue('value1'),
      hgetall: vi.fn().mockResolvedValue({ field1: 'value1', field2: 'value2' }),
      hdel: vi.fn().mockResolvedValue(1),
      lpush: vi.fn().mockResolvedValue(1),
      rpush: vi.fn().mockResolvedValue(1),
      lrange: vi.fn().mockResolvedValue(['item1', 'item2']),
      llen: vi.fn().mockResolvedValue(2),
      lpop: vi.fn().mockResolvedValue({ item: 1 }),
      rpop: vi.fn().mockResolvedValue('item2'),
      sadd: vi.fn().mockResolvedValue(1),
      srem: vi.fn().mockResolvedValue(1),
      smembers: vi.fn().mockResolvedValue(['member1', 'member2']),
      sismember: vi.fn().mockResolvedValue(1),
      scard: vi.fn().mockResolvedValue(2),
      zadd: vi.fn().mockResolvedValue(1),
      zrem: vi.fn().mockResolvedValue(1),
      zrange: vi.fn().mockResolvedValue(['member1', 'member2']),
      zscore: vi.fn().mockResolvedValue(1),
      zcard: vi.fn().mockResolvedValue(2),
      mget: vi.fn().mockImplementation(async (...keys: string[]) => {
        return keys.map(key => {
          const value = storage.get(key);
          if (!value) return null;
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        });
      }),
      mset: vi.fn().mockResolvedValue('OK'),
      scan: vi.fn().mockResolvedValue([0, ['key1', 'key2']]),
      flushall: vi.fn().mockResolvedValue('OK'),
      json: {
        get: vi.fn().mockResolvedValue({ test: 'data' }),
        set: vi.fn().mockResolvedValue('OK'),
      },
      pipeline: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue([]),
      }),
      ping: vi.fn().mockResolvedValue('PONG'),
    } as unknown as Redis;

    redisOps = new RedisOperations(mockRedisClient);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Basic Key-Value Operations', () => {
    it('should set and get a value', async () => {
      const key = 'test:key';
      const value = { id: 1, name: 'Test' };
      await redisOps.set(key, value);
      const result = await redisOps.get(key);
      expect(result).toStrictEqual(value);
    });

    it('should delete a key', async () => {
      const key = 'test:key';
      await redisOps.set(key, 'value');
      const result = await redisOps.del(key);
      expect(result).toBe(1);
    });

    it('should check if key exists', async () => {
      const key = 'test:key';
      await redisOps.set(key, 'value');
      const result = await redisOps.exists(key);
      expect(result).toBe(1);
    });

    it('should set expiration', async () => {
      const key = 'test:key';
      await redisOps.set(key, 'value');
      const result = await redisOps.expire(key, 300);
      expect(result).toBe(1);
    });

    it('should get TTL', async () => {
      const key = 'test:key';
      await redisOps.set(key, 'value');
      await redisOps.expire(key, 300);
      const result = await redisOps.ttl(key);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('Multiple Key Operations', () => {
    it('should get multiple values', async () => {
      await redisOps.set('key1', { foo: 1 });
      await redisOps.set('key2', { bar: 2 });
      const result = await redisOps.mget('key1', 'key2');
      expect(result[0]).toStrictEqual({ foo: 1 });
      expect(result[1]).toStrictEqual({ bar: 2 });
    });

    it('should set multiple values', async () => {
      await redisOps.set('multiKey1', 'value1');
      await redisOps.set('multiKey2', { nested: 'value2' });
      expect(await redisOps.get('multiKey1')).toBe('value1');
      expect(await redisOps.get('multiKey2')).toStrictEqual({ nested: 'value2' });
    });
  });

  describe('Numeric Operations', () => {
    it('should increment a value', async () => {
      const key = 'counter';
      const result = await redisOps.incr(key);
      expect(result).toBe(1);
    });

    it('should increment by amount', async () => {
      const key = 'counter';
      await redisOps.set(key, 0);
      const result = await redisOps.incrby(key, 5);
      expect(result).toBe(5);
    });

    it('should decrement a value', async () => {
      const key = 'counter';
      await redisOps.set(key, 1);
      const result = await redisOps.decr(key);
      expect(result).toBe(0);
    });

    it('should decrement by amount', async () => {
      const key = 'counter';
      await redisOps.set(key, 0);
      const result = await redisOps.decrby(key, 5);
      expect(result).toBe(-5);
    });
  });

  describe('Hash Operations', () => {
    it('should set hash fields', async () => {
      const key = 'hash:key';
      const fields = { field1: 'value1', field2: { nested: 'value2' } };
      const result = await redisOps.hset(key, fields);
      expect(result).toBeGreaterThan(0);
    });

    it('should get hash field', async () => {
      const key = 'hash:key';
      await redisOps.hset(key, { field1: 'value1' });
      const result = await redisOps.hget(key, 'field1');
      expect(result).toBe('value1');
    });

    it('should get all hash fields', async () => {
      const key = 'hash:key';
      await redisOps.hset(key, { field1: 'value1', field2: 'value2' });
      const result = await redisOps.hgetall(key);
      expect(result).toStrictEqual({ field1: 'value1', field2: 'value2' });
    });

    it('should delete hash fields', async () => {
      const key = 'hash:key';
      await redisOps.hset(key, { field1: 'value1', field2: 'value2' });
      const result = await redisOps.hdel(key, 'field1', 'field2');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('List Operations', () => {
    it('should push to left of list', async () => {
      const key = 'list:key';
      const result = await redisOps.lpush(key, { item: 1 }, { item: 2 });
      expect(result).toBeGreaterThan(0);
    });

    it('should push to right of list', async () => {
      const key = 'list:key';
      const result = await redisOps.rpush(key, { item: 1 });
      expect(result).toBeGreaterThan(0);
    });

    it('should pop from left of list', async () => {
      const key = 'list:key';
      await redisOps.lpush(key, { item: 1 });
      const result = await redisOps.lpop(key);
      expect(result).toStrictEqual({ item: 1 });
    });

    it('should get list range', async () => {
      const key = 'list:key';
      await redisOps.rpush(key, { item: 1 }, { item: 2 });
      const result = await redisOps.lrange(key, 0, -1);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should get list length', async () => {
      const key = 'list:key';
      await redisOps.rpush(key, { item: 1 }, { item: 2 });
      const result = await redisOps.llen(key);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('Utility Operations', () => {
    it('should scan keys', async () => {
      await redisOps.set('user:1', 'a');
      await redisOps.set('user:2', 'b');
      const [cursor, keys] = await redisOps.scan(0, { match: 'user:*', count: 10 });
      expect(Array.isArray(keys)).toBe(true);
    });

    it('should ping server', async () => {
      const result = await redisOps.ping();
      expect(result).toBe('PONG');
    });

    it('should provide access to raw client', () => {
      expect(redisOps.getClient()).toBeDefined();
    });

    it('should create pipeline', () => {
      const pipeline = redisOps.pipeline();
      expect(pipeline).toBeDefined();
    });
  });
});
