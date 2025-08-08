import { setupVitestUpstashMocks } from '@repo/qa/vitest/mocks/providers/upstash/redis';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Use centralized Upstash Redis mock from QA
const { redis: mockRedis, pipeline: mockPipeline } = setupVitestUpstashMocks();

describe('Redis Database Connection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Connection Management', () => {
    it('should create Redis client successfully', async () => {
      const { createUpstashRedisFromEnv } = await import('../../src/redis/server');

      const client = createUpstashRedisFromEnv();

      expect(client).toBeDefined();
    });

    it('should ping Redis successfully', async () => {
      const { redis } = await import('../../src/redis/server');

      mockRedis.ping.mockResolvedValue('PONG');

      const result = await redis.ping();

      expect(mockRedis.ping).toHaveBeenCalled();
      expect(result).toBe('PONG');
    });
  });

  describe('Basic Operations', () => {
    it('should set and get string values', async () => {
      const { RedisOperations } = await import('../../src/redis/server');

      const ops = new RedisOperations();
      const key = 'test:string';
      const value = 'Hello Redis!';

      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(value);

      await ops.set(key, value);
      const result = await ops.get(key);

      expect(mockRedis.set).toHaveBeenCalledWith(key, value, undefined);
      expect(mockRedis.get).toHaveBeenCalledWith(key);
      expect(result).toBe(value);
    });

    it('should set values with expiration', async () => {
      const { RedisOperations } = await import('../../src/redis/server');

      const ops = new RedisOperations();
      const key = 'test:expiring';
      const value = 'expires soon';
      const ttl = 3600;

      mockRedis.set.mockResolvedValue('OK');

      await ops.set(key, value, { ex: ttl });

      expect(mockRedis.set).toHaveBeenCalledWith(key, value, { ex: ttl });
    });

    it('should handle JSON serialization automatically', async () => {
      const { RedisOperations } = await import('../../src/redis/server');

      const ops = new RedisOperations();
      const key = 'test:json';
      const value = { id: '123', name: 'Test User', email: 'test@example.com' };

      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(JSON.stringify(value));

      await ops.set(key, value);
      const result = await ops.get(key);

      expect(mockRedis.set).toHaveBeenCalledWith(key, JSON.stringify(value), undefined);
      expect(result).toStrictEqual(value);
    });

    it('should delete keys', async () => {
      const { RedisOperations } = await import('../../src/redis/server');

      const ops = new RedisOperations();
      const key = 'test:delete';

      mockRedis.del.mockResolvedValue(1);

      const result = await ops.del(key);

      expect(mockRedis.del).toHaveBeenCalledWith(key);
      expect(result).toBe(1);
    });

    it('should check key existence', async () => {
      const { RedisOperations } = await import('../../src/redis/server');

      const ops = new RedisOperations();
      const key = 'test:exists';

      mockRedis.exists.mockResolvedValue(1);

      const result = await ops.exists(key);

      expect(mockRedis.exists).toHaveBeenCalledWith(key);
      expect(result).toBe(1);
    });
  });

  describe('Hash Operations', () => {
    it('should set and get hash fields', async () => {
      const { RedisOperations } = await import('../../src/redis/server');

      const ops = new RedisOperations();
      const key = 'test:hash';
      const field = 'name';
      const value = 'John Doe';

      mockRedis.hset.mockResolvedValue(1);
      mockRedis.hget.mockResolvedValue(value);

      await ops.hset(key, { [field]: value });
      const result = await ops.hget(key, field);

      expect(mockRedis.hset).toHaveBeenCalledWith(key, { [field]: value });
      expect(result).toBe(value);
    });

    it('should get all hash fields', async () => {
      const { RedisOperations } = await import('../../src/redis/server');

      const ops = new RedisOperations();
      const key = 'test:hash:all';
      const hash = { name: 'John', age: 30, city: 'NYC' };

      mockRedis.hgetall.mockResolvedValue(hash);

      const result = await ops.hgetall(key);

      expect(mockRedis.hgetall).toHaveBeenCalledWith(key);
      expect(result).toStrictEqual(hash);
    });
  });

  describe('List Operations', () => {
    it('should push and pop from lists', async () => {
      const { RedisOperations } = await import('../../src/redis/server');

      const ops = new RedisOperations();
      const key = 'test:list';
      const value = 'list item';

      mockRedis.lpush.mockResolvedValue(1);
      mockRedis.rpop.mockResolvedValue(value);

      await ops.lpush(key, value);
      const result = await ops.rpop(key);

      expect(mockRedis.lpush).toHaveBeenCalledWith(key, value);
      expect(result).toBe(value);
    });

    it('should get list range', async () => {
      const { RedisOperations } = await import('../../src/redis/server');

      const ops = new RedisOperations();
      const key = 'test:list:range';
      const items = ['item1', 'item2', 'item3'];

      mockRedis.lrange.mockResolvedValue(items);

      const result = await ops.lrange(key, 0, -1);

      expect(mockRedis.lrange).toHaveBeenCalledWith(key, 0, -1);
      expect(result).toStrictEqual(items);
    });
  });

  describe('Sorted Set Operations', () => {
    it('should add members to sorted set', async () => {
      const { RedisOperations } = await import('../../src/redis/server');

      const ops = new RedisOperations();
      const key = 'test:zset';
      const score = 100;
      const member = 'player1';

      mockRedis.zadd.mockResolvedValue(1);

      await ops.zadd(key, { score, value: member });

      expect(mockRedis.zadd).toHaveBeenCalledWith(key, { score, value: member });
    });

    it('should get sorted set range', async () => {
      const { RedisOperations } = await import('../../src/redis/server');

      const ops = new RedisOperations();
      const key = 'test:zset:range';
      const members = ['player1', 'player2', 'player3'];

      mockRedis.zrange.mockResolvedValue(members);

      const result = await ops.zrange(key, 0, -1);

      expect(mockRedis.zrange).toHaveBeenCalledWith(key, 0, -1, undefined);
      expect(result).toStrictEqual(members);
    });
  });

  describe('Pipeline Operations', () => {
    it('should execute pipeline commands efficiently', async () => {
      const { RedisOperations } = await import('../../src/redis/server');

      const ops = new RedisOperations();

      mockPipeline.exec.mockResolvedValue([
        ['OK', null],
        ['OK', null],
        ['OK', null],
      ]);

      const pipeline = ops.pipeline();
      pipeline.set('batch:1', 'value1');
      pipeline.set('batch:2', 'value2');
      pipeline.set('batch:3', 'value3');
      const results = await pipeline.exec();

      expect(mockRedis.pipeline).toHaveBeenCalled();
      expect(mockPipeline.set).toHaveBeenCalledTimes(3);
      expect(mockPipeline.exec).toHaveBeenCalled();
      expect(results?.length).toBe(3);
    });
  });
});
