import { setupVitestUpstashMocks } from '@repo/qa/vitest/mocks/providers/upstash/redis';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Test imports for new four-file pattern
import { RedisOperations } from '#/redis/server';

const { redis: mockRedisClient } = setupVitestUpstashMocks();

describe('Redis Four-File Pattern', () => {
  let redisOps: RedisOperations;

  beforeEach(() => {
    mockRedisClient.reset();
    redisOps = new RedisOperations(mockRedisClient);
  });

  afterEach(() => {
    mockRedisClient.reset();
  });

  describe('Basic Key-Value Operations', () => {
    it('should set and get a value', async () => {
      const key = 'test:key';
      const value = { id: 1, name: 'Test' };

      await redisOps.set(key, value);
      expect(mockRedisClient.set).toHaveBeenCalledWith(key, JSON.stringify(value), undefined);

      const result = await redisOps.get(key);
      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
    });

    it('should delete a key', async () => {
      const result = await redisOps.del('test:key');
      expect(mockRedisClient.del).toHaveBeenCalledWith('test:key');
      expect(result).toBe(1);
    });

    it('should check if key exists', async () => {
      const result = await redisOps.exists('test:key');
      expect(mockRedisClient.exists).toHaveBeenCalledWith('test:key');
      expect(result).toBe(1);
    });

    it('should set expiration', async () => {
      const result = await redisOps.expire('test:key', 300);
      expect(mockRedisClient.expire).toHaveBeenCalledWith('test:key', 300);
      expect(result).toBe(1);
    });

    it('should get TTL', async () => {
      const result = await redisOps.ttl('test:key');
      expect(mockRedisClient.ttl).toHaveBeenCalledWith('test:key');
      expect(result).toBe(300);
    });
  });

  describe('Multiple Key Operations', () => {
    it('should get multiple values', async () => {
      const result = await redisOps.mget('key1', 'key2');
      expect(mockRedisClient.mget).toHaveBeenCalledWith('key1', 'key2');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should set multiple values', async () => {
      const pairs = { key1: 'value1', key2: { nested: 'value2' } };
      const result = await redisOps.mset(pairs);
      expect(mockRedisClient.mset).toHaveBeenCalledWith({
        key1: 'value1',
        key2: JSON.stringify({ nested: 'value2' }),
      });
      expect(result).toBe('OK');
    });
  });

  describe('Numeric Operations', () => {
    it('should increment a value', async () => {
      const result = await redisOps.incr('counter');
      expect(mockRedisClient.incr).toHaveBeenCalledWith('counter');
      expect(result).toBe(1);
    });

    it('should increment by amount', async () => {
      const result = await redisOps.incrby('counter', 5);
      expect(mockRedisClient.incrby).toHaveBeenCalledWith('counter', 5);
      expect(result).toBe(5);
    });

    it('should decrement a value', async () => {
      const result = await redisOps.decr('counter');
      expect(mockRedisClient.decr).toHaveBeenCalledWith('counter');
      expect(result).toBe(0);
    });

    it('should decrement by amount', async () => {
      const result = await redisOps.decrby('counter', 5);
      expect(mockRedisClient.decrby).toHaveBeenCalledWith('counter', 5);
      expect(result).toBe(-5);
    });
  });

  describe('Hash Operations', () => {
    it('should set hash fields', async () => {
      const fields = { field1: 'value1', field2: { nested: 'value2' } };
      const result = await redisOps.hset('hash:key', fields);
      expect(mockRedisClient.hset).toHaveBeenCalledWith('hash:key', {
        field1: 'value1',
        field2: JSON.stringify({ nested: 'value2' }),
      });
      expect(result).toBe(1);
    });

    it('should get hash field', async () => {
      const result = await redisOps.hget('hash:key', 'field1');
      expect(mockRedisClient.hget).toHaveBeenCalledWith('hash:key', 'field1');
    });

    it('should get all hash fields', async () => {
      const result = await redisOps.hgetall('hash:key');
      expect(mockRedisClient.hgetall).toHaveBeenCalledWith('hash:key');
      expect(typeof result).toBe('object');
    });

    it('should delete hash fields', async () => {
      const result = await redisOps.hdel('hash:key', 'field1', 'field2');
      expect(mockRedisClient.hdel).toHaveBeenCalledWith('hash:key', 'field1', 'field2');
      expect(result).toBe(1);
    });
  });

  describe('List Operations', () => {
    it('should push to left of list', async () => {
      const result = await redisOps.lpush('list:key', { item: 1 }, { item: 2 });
      expect(mockRedisClient.lpush).toHaveBeenCalledWith(
        'list:key',
        JSON.stringify({ item: 1 }),
        JSON.stringify({ item: 2 }),
      );
      expect(result).toBe(1);
    });

    it('should push to right of list', async () => {
      const result = await redisOps.rpush('list:key', { item: 1 });
      expect(mockRedisClient.rpush).toHaveBeenCalledWith('list:key', JSON.stringify({ item: 1 }));
      expect(result).toBe(1);
    });

    it('should pop from left of list', async () => {
      const result = await redisOps.lpop('list:key');
      expect(mockRedisClient.lpop).toHaveBeenCalledWith('list:key');
    });

    it('should get list range', async () => {
      const result = await redisOps.lrange('list:key', 0, -1);
      expect(mockRedisClient.lrange).toHaveBeenCalledWith('list:key', 0, -1);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get list length', async () => {
      const result = await redisOps.llen('list:key');
      expect(mockRedisClient.llen).toHaveBeenCalledWith('list:key');
      expect(result).toBe(2);
    });
  });

  describe('Utility Operations', () => {
    it('should scan keys', async () => {
      const result = await redisOps.scan(0, { match: 'user:*', count: 10 });
      expect(mockRedisClient.scan).toHaveBeenCalledWith(0, { match: 'user:*', count: 10 });
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('should ping server', async () => {
      const result = await redisOps.ping();
      expect(mockRedisClient.ping).toHaveBeenCalled();
      expect(result).toBe('PONG');
    });

    it('should provide access to raw client', () => {
      const client = redisOps.getClient();
      expect(client).toBe(mockRedisClient);
    });

    it('should create pipeline', () => {
      const pipeline = redisOps.pipeline();
      expect(mockRedisClient.pipeline).toHaveBeenCalled();
      expect(pipeline).toBeDefined();
    });
  });
});
