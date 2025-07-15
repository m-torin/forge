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
    const hashStorage = new Map<string, Map<string, string>>();
    const listStorage = new Map<string, string[]>();
    const setStorage = new Map<string, Set<string>>();
    const sortedSetStorage = new Map<string, Map<string, number>>();

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
      set: vi.fn().mockImplementation(async (key: string, value: any, options?: any) => {
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
      exists: vi.fn().mockImplementation(async (...keys: string[]) => {
        return keys.filter(key => storage.has(key)).length;
      }),
      expire: vi.fn().mockResolvedValue(1),
      ttl: vi.fn().mockResolvedValue(299),
      incr: vi.fn().mockResolvedValue(1),
      decr: vi.fn().mockResolvedValue(0),
      incrby: vi.fn().mockResolvedValue(5),
      decrby: vi.fn().mockResolvedValue(-5),
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
      mset: vi.fn().mockImplementation(async (pairs: Record<string, any>) => {
        Object.entries(pairs).forEach(([key, value]) => {
          storage.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
        return 'OK';
      }),
      hset: vi.fn().mockImplementation(async (key: string, fields: Record<string, any>) => {
        if (!hashStorage.has(key)) {
          hashStorage.set(key, new Map());
        }
        const hash = hashStorage.get(key)!;
        let count = 0;
        Object.entries(fields).forEach(([field, value]) => {
          const serialized = typeof value === 'string' ? value : JSON.stringify(value);
          if (!hash.has(field)) count++;
          hash.set(field, serialized);
        });
        return count;
      }),
      hget: vi.fn().mockImplementation(async (key: string, field: string) => {
        const hash = hashStorage.get(key);
        if (!hash) return null;
        const value = hash.get(field);
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }),
      hgetall: vi.fn().mockImplementation(async (key: string) => {
        const hash = hashStorage.get(key);
        if (!hash) return {};
        const result: Record<string, any> = {};
        hash.forEach((value, field) => {
          try {
            result[field] = JSON.parse(value);
          } catch {
            result[field] = value;
          }
        });
        return result;
      }),
      hdel: vi.fn().mockImplementation(async (key: string, ...fields: string[]) => {
        const hash = hashStorage.get(key);
        if (!hash) return 0;
        let count = 0;
        fields.forEach(field => {
          if (hash.delete(field)) count++;
        });
        return count;
      }),
      lpush: vi.fn().mockImplementation(async (key: string, ...values: string[]) => {
        if (!listStorage.has(key)) {
          listStorage.set(key, []);
        }
        const list = listStorage.get(key)!;
        values.reverse().forEach(value => list.unshift(value));
        return list.length;
      }),
      rpush: vi.fn().mockImplementation(async (key: string, ...values: string[]) => {
        if (!listStorage.has(key)) {
          listStorage.set(key, []);
        }
        const list = listStorage.get(key)!;
        values.forEach(value => list.push(value));
        return list.length;
      }),
      lpop: vi.fn().mockImplementation(async (key: string) => {
        const list = listStorage.get(key);
        if (!list || list.length === 0) return null;
        const value = list.shift()!;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }),
      rpop: vi.fn().mockImplementation(async (key: string) => {
        const list = listStorage.get(key);
        if (!list || list.length === 0) return null;
        const value = list.pop()!;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }),
      lrange: vi.fn().mockImplementation(async (key: string, start: number, end: number) => {
        const list = listStorage.get(key);
        if (!list) return [];
        const slice = list.slice(start, end === -1 ? undefined : end + 1);
        return slice.map(value => {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        });
      }),
      llen: vi.fn().mockImplementation(async (key: string) => {
        const list = listStorage.get(key);
        return list ? list.length : 0;
      }),
      sadd: vi.fn().mockImplementation(async (key: string, members: string[]) => {
        if (!setStorage.has(key)) {
          setStorage.set(key, new Set());
        }
        const set = setStorage.get(key)!;
        let count = 0;
        members.forEach(member => {
          if (!set.has(member)) {
            set.add(member);
            count++;
          }
        });
        return count;
      }),
      srem: vi.fn().mockImplementation(async (key: string, members: string[]) => {
        const set = setStorage.get(key);
        if (!set) return 0;
        let count = 0;
        members.forEach(member => {
          if (set.delete(member)) count++;
        });
        return count;
      }),
      smembers: vi.fn().mockImplementation(async (key: string) => {
        const set = setStorage.get(key);
        if (!set) return [];
        return Array.from(set).map(value => {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        });
      }),
      sismember: vi.fn().mockImplementation(async (key: string, member: string) => {
        const set = setStorage.get(key);
        return set?.has(member) ? 1 : 0;
      }),
      zadd: vi.fn().mockImplementation(async (key: string, ...args: any[]) => {
        if (!sortedSetStorage.has(key)) {
          sortedSetStorage.set(key, new Map());
        }
        const zset = sortedSetStorage.get(key)!;
        let count = 0;
        
        // Handle different zadd argument formats
        if (args.length >= 2) {
          for (let i = 0; i < args.length; i += 2) {
            const score = Number(args[i]);
            const member = args[i + 1];
            const memberKey = typeof member === 'string' ? member : JSON.stringify(member);
            if (!zset.has(memberKey)) count++;
            zset.set(memberKey, score);
          }
        }
        return count;
      }),
      zrange: vi.fn().mockImplementation(async (key: string, start: number, end: number, options?: any) => {
        const zset = sortedSetStorage.get(key);
        if (!zset) return [];
        
        const sortedMembers = Array.from(zset.entries())
          .sort(([, a], [, b]) => a - b)
          .map(([member]) => member);
        
        const slice = sortedMembers.slice(start, end === -1 ? undefined : end + 1);
        
        if (options?.withScores) {
          const result: any[] = [];
          slice.forEach(member => {
            try {
              result.push(JSON.parse(member));
            } catch {
              result.push(member);
            }
            result.push(zset.get(member));
          });
          return result;
        }
        
        return slice.map(member => {
          try {
            return JSON.parse(member);
          } catch {
            return member;
          }
        });
      }),
      zscore: vi.fn().mockImplementation(async (key: string, member: string) => {
        const zset = sortedSetStorage.get(key);
        if (!zset) return null;
        
        // Check if the member exists as-is (string) or needs JSON stringification
        if (zset.has(member)) {
          return zset.get(member) ?? null;
        }
        
        // Try to find the member as a JSON string
        try {
          const jsonMember = JSON.stringify(member);
          return zset.get(jsonMember) ?? null;
        } catch {
          return null;
        }
      }),
      scan: vi.fn().mockImplementation(async (cursor: number, options?: any) => {
        const keys = Array.from(storage.keys());
        const filteredKeys = options?.match ? keys.filter(key => key.includes(options.match.replace('*', ''))) : keys;
        return [0, filteredKeys.slice(0, options?.count || 10)];
      }),
      ping: vi.fn().mockResolvedValue('PONG'),
      pipeline: vi.fn().mockImplementation(() => ({
        set: vi.fn(),
        get: vi.fn(),
        del: vi.fn(),
        exec: vi.fn().mockResolvedValue([['OK'], ['value'], [1]]),
      })),
    };

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

    it('should set with expiration options', async () => {
      const key = 'test:key';
      const value = 'test-value';
      const result = await redisOps.set(key, value, { ex: 300 });
      expect(result).toBe('OK');
      expect(mockRedisClient.set).toHaveBeenCalledWith(key, value, { ex: 300 });
    });

    it('should handle string values without JSON parsing', async () => {
      const key = 'test:key';
      const value = 'plain-string';
      await redisOps.set(key, value);
      const result = await redisOps.get(key);
      expect(result).toBe(value);
    });

    it('should handle null values in get', async () => {
      const key = 'nonexistent';
      const result = await redisOps.get(key);
      expect(result).toBeNull();
    });

    it('should handle multiple keys in exists', async () => {
      await redisOps.set('key1', 'value1');
      await redisOps.set('key2', 'value2');
      const result = await redisOps.exists('key1', 'key2', 'key3');
      expect(result).toBe(2);
    });

    it('should handle multiple keys in del', async () => {
      await redisOps.set('key1', 'value1');
      await redisOps.set('key2', 'value2');
      const result = await redisOps.del('key1', 'key2', 'key3');
      expect(result).toBe(2);
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

    it('should handle mget with nonexistent keys', async () => {
      await redisOps.set('key1', 'value1');
      const result = await redisOps.mget('key1', 'nonexistent');
      expect(result[0]).toBe('value1');
      expect(result[1]).toBeNull();
    });

    it('should handle mget with string values', async () => {
      await redisOps.set('key1', 'plain-string');
      const result = await redisOps.mget('key1');
      expect(result[0]).toBe('plain-string');
    });

    it('should handle mset with mixed types', async () => {
      const pairs = {
        'key1': 'string-value',
        'key2': { object: 'value' },
        'key3': 123
      };
      await redisOps.mset(pairs);
      
      expect(await redisOps.get('key1')).toBe('string-value');
      expect(await redisOps.get('key2')).toStrictEqual({ object: 'value' });
      expect(await redisOps.get('key3')).toBe(123);
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
      const fields = { field1: 'value1', field2: { nested: 'value2' } };
      await redisOps.hset(key, fields);
      const result = await redisOps.hgetall(key);
      expect(result).toStrictEqual(fields);
    });

    it('should delete hash fields', async () => {
      const key = 'hash:key';
      await redisOps.hset(key, { field1: 'value1', field2: 'value2' });
      const result = await redisOps.hdel(key, 'field1', 'field2');
      expect(result).toBe(2);
    });

    it('should handle hget with nonexistent key', async () => {
      const result = await redisOps.hget('nonexistent', 'field');
      expect(result).toBeNull();
    });

    it('should handle hgetall with nonexistent key', async () => {
      const result = await redisOps.hgetall('nonexistent');
      expect(result).toStrictEqual({});
    });

    it('should handle hget with string field value', async () => {
      const key = 'hash:key';
      await redisOps.hset(key, { field1: 'plain-string' });
      const result = await redisOps.hget(key, 'field1');
      expect(result).toBe('plain-string');
    });

    it('should handle hdel with nonexistent key', async () => {
      const result = await redisOps.hdel('nonexistent', 'field1');
      expect(result).toBe(0);
    });
  });

  describe('List Operations', () => {
    it('should push to left of list', async () => {
      const key = 'list:key';
      const result = await redisOps.lpush(key, 'value1', 'value2');
      expect(result).toBe(2);
    });

    it('should push to right of list', async () => {
      const key = 'list:key';
      const result = await redisOps.rpush(key, 'value1', 'value2');
      expect(result).toBe(2);
    });

    it('should pop from left of list', async () => {
      const key = 'list:key';
      await redisOps.lpush(key, 'value1');
      const result = await redisOps.lpop(key);
      expect(result).toBe('value1');
    });

    it('should get list range', async () => {
      const key = 'list:key';
      await redisOps.rpush(key, 'value1', 'value2', 'value3');
      const result = await redisOps.lrange(key, 0, 1);
      expect(result).toStrictEqual(['value1', 'value2']);
    });

    it('should get list length', async () => {
      const key = 'list:key';
      await redisOps.rpush(key, 'value1', 'value2');
      const result = await redisOps.llen(key);
      expect(result).toBe(2);
    });

    it('should handle lpush with objects', async () => {
      const key = 'list:key';
      const obj = { id: 1, name: 'test' };
      await redisOps.lpush(key, obj);
      const result = await redisOps.lpop(key);
      expect(result).toStrictEqual(obj);
    });

    it('should handle rpush with objects', async () => {
      const key = 'list:key';
      const obj = { id: 1, name: 'test' };
      await redisOps.rpush(key, obj);
      const result = await redisOps.rpop(key);
      expect(result).toStrictEqual(obj);
    });

    it('should handle lpop with empty list', async () => {
      const result = await redisOps.lpop('nonexistent');
      expect(result).toBeNull();
    });

    it('should handle rpop with empty list', async () => {
      const result = await redisOps.rpop('nonexistent');
      expect(result).toBeNull();
    });

    it('should handle lrange with nonexistent key', async () => {
      const result = await redisOps.lrange('nonexistent', 0, -1);
      expect(result).toStrictEqual([]);
    });

    it('should handle llen with nonexistent key', async () => {
      const result = await redisOps.llen('nonexistent');
      expect(result).toBe(0);
    });
  });

  describe('Set Operations', () => {
    it('should add members to set', async () => {
      const key = 'set:key';
      const result = await redisOps.sadd(key, ['member1', 'member2']);
      expect(result).toBe(2);
    });

    it('should remove members from set', async () => {
      const key = 'set:key';
      await redisOps.sadd(key, ['member1', 'member2']);
      const result = await redisOps.srem(key, ['member1']);
      expect(result).toBe(1);
    });

    it('should get set members', async () => {
      const key = 'set:key';
      await redisOps.sadd(key, ['member1', 'member2']);
      const result = await redisOps.smembers(key);
      expect(result).toEqual(expect.arrayContaining(['member1', 'member2']));
    });

    it('should check set membership', async () => {
      const key = 'set:key';
      await redisOps.sadd(key, ['member1']);
      const result = await redisOps.sismember(key, 'member1');
      expect(result).toBe(1);
    });

    it('should handle sadd with objects', async () => {
      const key = 'set:key';
      const obj = { id: 1, name: 'test' };
      await redisOps.sadd(key, [obj]);
      const result = await redisOps.smembers(key);
      expect(result).toStrictEqual([obj]);
    });

    it('should handle srem with nonexistent key', async () => {
      const result = await redisOps.srem('nonexistent', ['member1']);
      expect(result).toBe(0);
    });

    it('should handle smembers with nonexistent key', async () => {
      const result = await redisOps.smembers('nonexistent');
      expect(result).toStrictEqual([]);
    });

    it('should handle sismember with nonexistent key', async () => {
      const result = await redisOps.sismember('nonexistent', 'member1');
      expect(result).toBe(0);
    });
  });

  describe('Sorted Set Operations', () => {
    it('should add members to sorted set', async () => {
      const key = 'zset:key';
      const result = await redisOps.zadd(key, 1, 'member1', 2, 'member2');
      expect(result).toBe(2);
    });

    it('should get sorted set range', async () => {
      const key = 'zset:key';
      await redisOps.zadd(key, 1, 'member1', 2, 'member2');
      const result = await redisOps.zrange(key, 0, -1);
      expect(result).toStrictEqual(['member1', 'member2']);
    });

    it('should get sorted set range with scores', async () => {
      const key = 'zset:key';
      await redisOps.zadd(key, 1, 'member1', 2, 'member2');
      const result = await redisOps.zrange(key, 0, -1, { withScores: true });
      expect(result).toEqual(expect.arrayContaining(['member1', 1, 'member2', 2]));
    });

    it('should get member score', async () => {
      const key = 'zset:key';
      await redisOps.zadd(key, 1, 'member1');
      const result = await redisOps.zscore(key, 'member1');
      expect(result).toBe(1);
    });

    it('should handle zrange with nonexistent key', async () => {
      const result = await redisOps.zrange('nonexistent', 0, -1);
      expect(result).toStrictEqual([]);
    });

    it('should handle zscore with nonexistent key', async () => {
      const result = await redisOps.zscore('nonexistent', 'member1');
      expect(result).toBeNull();
    });

    it('should handle zscore with objects', async () => {
      const key = 'zset:key';
      const obj = { id: 1, name: 'test' };
      await redisOps.zadd(key, 1, obj);
      const result = await redisOps.zscore(key, obj);
      expect(result).toBe(1);
    });
  });

  describe('Utility Operations', () => {
    it('should scan keys', async () => {
      await redisOps.set('test:key1', 'value1');
      await redisOps.set('test:key2', 'value2');
      const result = await redisOps.scan(0, { match: 'test:*' });
      expect(result[0]).toBe(0);
      expect(result[1]).toEqual(expect.arrayContaining(['test:key1', 'test:key2']));
    });

    it('should ping server', async () => {
      const result = await redisOps.ping();
      expect(result).toBe('PONG');
    });

    it('should provide access to raw client', async () => {
      const client = redisOps.getClient();
      expect(client).toBe(mockRedisClient);
    });

    it('should create pipeline', async () => {
      const pipeline = redisOps.pipeline();
      expect(pipeline).toBeDefined();
      expect(typeof pipeline.exec).toBe('function');
    });

    it('should handle scan with options', async () => {
      const result = await redisOps.scan(0, { match: 'test:*', count: 5 });
      expect(result[0]).toBe(0);
      expect(Array.isArray(result[1])).toBe(true);
    });
  });

  describe('Constructor and Singleton Tests', () => {
    it('should create RedisOperations with custom client', () => {
      const customClient = {} as Redis;
      const ops = new RedisOperations(customClient);
      expect(ops.getClient()).toBe(customClient);
    });

    it('should create RedisOperations with default client', () => {
      const ops = new RedisOperations();
      expect(ops.getClient()).toBeDefined();
    });
  });

  describe('Environment and Client Creation', () => {
    it('should import upstashRedisClientSingleton', async () => {
      const { upstashRedisClientSingleton } = await import('../src/redis/server');
      expect(typeof upstashRedisClientSingleton).toBe('function');
    });

    it('should import createUpstashRedisFromEnv', async () => {
      const { createUpstashRedisFromEnv } = await import('../src/redis/server');
      expect(typeof createUpstashRedisFromEnv).toBe('function');
    });

    it('should import redis singleton', async () => {
      const { redis } = await import('../src/redis/server');
      expect(redis).toBeDefined();
    });

    it('should import redisOps instance', async () => {
      const { redisOps } = await import('../src/redis/server');
      expect(redisOps).toBeDefined();
      expect(redisOps.getClient).toBeDefined();
    });

    it('should create redis client from upstashRedisClientSingleton', async () => {
      const { upstashRedisClientSingleton } = await import('../src/redis/server');
      const client = upstashRedisClientSingleton();
      expect(client).toBeDefined();
      expect(client.get).toBeDefined();
    });

    it('should create redis client from createUpstashRedisFromEnv', async () => {
      const { createUpstashRedisFromEnv } = await import('../src/redis/server');
      const client = createUpstashRedisFromEnv();
      expect(client).toBeDefined();
      expect(client.get).toBeDefined();
    });
  });

  describe('Edge Cases and Non-String Values', () => {
    it('should handle lrange with non-string values', async () => {
      // Mock lrange to return non-string values
      const mockLrange = vi.fn().mockResolvedValue([123, { test: 'value' }, 'string']);
      const customClient = { ...mockRedisClient, lrange: mockLrange };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.lrange('test', 0, -1);
      expect(result).toEqual([123, { test: 'value' }, 'string']);
    });

    it('should handle zrange with non-string values', async () => {
      // Mock zrange to return non-string values
      const mockZrange = vi.fn().mockResolvedValue([123, { test: 'value' }, 'string']);
      const customClient = { ...mockRedisClient, zrange: mockZrange };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.zrange('test', 0, -1);
      expect(result).toEqual([123, { test: 'value' }, 'string']);
    });

    it('should handle smembers with non-string values', async () => {
      // Mock smembers to return non-string values
      const mockSmembers = vi.fn().mockResolvedValue([123, { test: 'value' }, 'string']);
      const customClient = { ...mockRedisClient, smembers: mockSmembers };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.smembers('test');
      expect(result).toEqual([123, { test: 'value' }, 'string']);
    });

    it('should handle rpop with non-string values', async () => {
      // Mock rpop to return non-string values
      const mockRpop = vi.fn().mockResolvedValue(123);
      const customClient = { ...mockRedisClient, rpop: mockRpop };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.rpop('test');
      expect(result).toBe(123);
    });

    it('should handle lpop with non-string values', async () => {
      // Mock lpop to return non-string values
      const mockLpop = vi.fn().mockResolvedValue({ test: 'value' });
      const customClient = { ...mockRedisClient, lpop: mockLpop };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.lpop('test');
      expect(result).toEqual({ test: 'value' });
    });

    it('should handle hget with non-string values', async () => {
      // Mock hget to return non-string values
      const mockHget = vi.fn().mockResolvedValue(123);
      const customClient = { ...mockRedisClient, hget: mockHget };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.hget('test', 'field');
      expect(result).toBe(123);
    });

    it('should handle hgetall with non-string values', async () => {
      // Mock hgetall to return non-string values
      const mockHgetall = vi.fn().mockResolvedValue({ field1: 123, field2: { test: 'value' } });
      const customClient = { ...mockRedisClient, hgetall: mockHgetall };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.hgetall('test');
      expect(result).toEqual({ field1: 123, field2: { test: 'value' } });
    });

    it('should handle get with non-string values', async () => {
      // Mock get to return non-string values
      const mockGet = vi.fn().mockResolvedValue(123);
      const customClient = { ...mockRedisClient, get: mockGet };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.get('test');
      expect(result).toBe(123);
    });

    it('should handle mget with non-string values', async () => {
      // Mock mget to return non-string values
      const mockMget = vi.fn().mockResolvedValue([123, { test: 'value' }, 'string']);
      const customClient = { ...mockRedisClient, mget: mockMget };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.mget('key1', 'key2', 'key3');
      expect(result).toEqual([123, { test: 'value' }, 'string']);
    });

    it('should handle set with undefined options', async () => {
      const key = 'test:key';
      const value = 'test-value';
      const result = await redisOps.set(key, value);
      expect(result).toBe('OK');
      expect(mockRedisClient.set).toHaveBeenCalledWith(key, value, undefined);
    });

    it('should handle set with null options', async () => {
      const key = 'test:key';
      const value = 'test-value';
      const result = await redisOps.set(key, value, null as any);
      expect(result).toBe('OK');
      expect(mockRedisClient.set).toHaveBeenCalledWith(key, value, undefined);
    });

    it('should handle rpop with malformed JSON string', async () => {
      // Mock rpop to return a malformed JSON string
      const mockRpop = vi.fn().mockResolvedValue('{"invalid": json}');
      const customClient = { ...mockRedisClient, rpop: mockRpop };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.rpop('test');
      expect(result).toBe('{"invalid": json}');
    });

    it('should handle rpop with non-string non-null value', async () => {
      // Mock rpop to return a non-string value (like a number)
      const mockRpop = vi.fn().mockResolvedValue(42);
      const customClient = { ...mockRedisClient, rpop: mockRpop };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.rpop('test');
      expect(result).toBe(42);
    });

    it('should handle lpop with malformed JSON string', async () => {
      // Mock lpop to return a malformed JSON string
      const mockLpop = vi.fn().mockResolvedValue('{"invalid": json}');
      const customClient = { ...mockRedisClient, lpop: mockLpop };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.lpop('test');
      expect(result).toBe('{"invalid": json}');
    });

    it('should handle hget with malformed JSON string', async () => {
      // Mock hget to return a malformed JSON string
      const mockHget = vi.fn().mockResolvedValue('{"invalid": json}');
      const customClient = { ...mockRedisClient, hget: mockHget };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.hget('test', 'field');
      expect(result).toBe('{"invalid": json}');
    });

    it('should handle get with malformed JSON string', async () => {
      // Mock get to return a malformed JSON string
      const mockGet = vi.fn().mockResolvedValue('{"invalid": json}');
      const customClient = { ...mockRedisClient, get: mockGet };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.get('test');
      expect(result).toBe('{"invalid": json}');
    });

    it('should handle mget with malformed JSON strings', async () => {
      // Mock mget to return malformed JSON strings
      const mockMget = vi.fn().mockResolvedValue(['{"invalid": json}', '{"another": invalid}']);
      const customClient = { ...mockRedisClient, mget: mockMget };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.mget('key1', 'key2');
      expect(result).toEqual(['{"invalid": json}', '{"another": invalid}']);
    });

    it('should handle hgetall with malformed JSON strings', async () => {
      // Mock hgetall to return malformed JSON strings
      const mockHgetall = vi.fn().mockResolvedValue({ 
        field1: '{"invalid": json}', 
        field2: '{"another": invalid}' 
      });
      const customClient = { ...mockRedisClient, hgetall: mockHgetall };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.hgetall('test');
      expect(result).toEqual({ 
        field1: '{"invalid": json}', 
        field2: '{"another": invalid}' 
      });
    });

    it('should handle lrange with malformed JSON strings', async () => {
      // Mock lrange to return malformed JSON strings
      const mockLrange = vi.fn().mockResolvedValue(['{"invalid": json}', '{"another": invalid}']);
      const customClient = { ...mockRedisClient, lrange: mockLrange };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.lrange('test', 0, -1);
      expect(result).toEqual(['{"invalid": json}', '{"another": invalid}']);
    });

    it('should handle zrange with malformed JSON strings', async () => {
      // Mock zrange to return malformed JSON strings
      const mockZrange = vi.fn().mockResolvedValue(['{"invalid": json}', '{"another": invalid}']);
      const customClient = { ...mockRedisClient, zrange: mockZrange };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.zrange('test', 0, -1);
      expect(result).toEqual(['{"invalid": json}', '{"another": invalid}']);
    });

    it('should handle smembers with malformed JSON strings', async () => {
      // Mock smembers to return malformed JSON strings
      const mockSmembers = vi.fn().mockResolvedValue(['{"invalid": json}', '{"another": invalid}']);
      const customClient = { ...mockRedisClient, smembers: mockSmembers };
      const customOps = new RedisOperations(customClient as any);
      
      const result = await customOps.smembers('test');
      expect(result).toEqual(['{"invalid": json}', '{"another": invalid}']);
    });
  });

  describe('Convenience Function Exports', () => {
    it('should export convenience functions', async () => {
      const {
        set, get, del, exists, expire, ttl, mget, mset, incr, incrby, decr, decrby,
        scan, ping, hset, hget, hgetall, hdel, lpush, rpush, lpop, rpop, lrange, llen,
        sadd, srem, smembers, sismember, zadd, zrange, zscore, pipeline, getClient
      } = await import('../src/redis/server');

      expect(typeof set).toBe('function');
      expect(typeof get).toBe('function');
      expect(typeof del).toBe('function');
      expect(typeof exists).toBe('function');
      expect(typeof expire).toBe('function');
      expect(typeof ttl).toBe('function');
      expect(typeof mget).toBe('function');
      expect(typeof mset).toBe('function');
      expect(typeof incr).toBe('function');
      expect(typeof incrby).toBe('function');
      expect(typeof decr).toBe('function');
      expect(typeof decrby).toBe('function');
      expect(typeof scan).toBe('function');
      expect(typeof ping).toBe('function');
      expect(typeof hset).toBe('function');
      expect(typeof hget).toBe('function');
      expect(typeof hgetall).toBe('function');
      expect(typeof hdel).toBe('function');
      expect(typeof lpush).toBe('function');
      expect(typeof rpush).toBe('function');
      expect(typeof lpop).toBe('function');
      expect(typeof rpop).toBe('function');
      expect(typeof lrange).toBe('function');
      expect(typeof llen).toBe('function');
      expect(typeof sadd).toBe('function');
      expect(typeof srem).toBe('function');
      expect(typeof smembers).toBe('function');
      expect(typeof sismember).toBe('function');
      expect(typeof zadd).toBe('function');
      expect(typeof zrange).toBe('function');
      expect(typeof zscore).toBe('function');
      expect(typeof pipeline).toBe('function');
      expect(typeof getClient).toBe('function');
    });
  });
});
