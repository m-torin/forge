/**
 * @vitest-environment node
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createServerClient, safeServerOperation } from '../src/server';
import type { UpstashRedisConfig } from '../src/types';

// Mock Upstash Redis SDK
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(() => mockRedis),
}));

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  expire: vi.fn(),
  ttl: vi.fn(),
  incr: vi.fn(),
  decr: vi.fn(),
  lpush: vi.fn(),
  rpush: vi.fn(),
  lpop: vi.fn(),
  rpop: vi.fn(),
  lrange: vi.fn(),
  sadd: vi.fn(),
  srem: vi.fn(),
  smembers: vi.fn(),
  sismember: vi.fn(),
  zadd: vi.fn(),
  zrange: vi.fn(),
  zrem: vi.fn(),
  zscore: vi.fn(),
  hset: vi.fn(),
  hget: vi.fn(),
  hdel: vi.fn(),
  hgetall: vi.fn(),
  multi: vi.fn(() => mockPipeline),
  pipeline: vi.fn(() => mockPipeline),
  eval: vi.fn(),
  publish: vi.fn(),
  subscribe: vi.fn(),
};

const mockPipeline = {
  get: vi.fn(() => mockPipeline),
  set: vi.fn(() => mockPipeline),
  del: vi.fn(() => mockPipeline),
  incr: vi.fn(() => mockPipeline),
  exec: vi.fn(),
};

describe('Upstash Redis Server Client', () => {
  let client: ReturnType<typeof createServerClient>;

  const testConfig: UpstashRedisConfig = {
    url: 'https://test-redis.upstash.io',
    token: 'test-token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    client = createServerClient(testConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Client Creation', () => {
    it('should create client with config', () => {
      expect(client).toBeDefined();
      expect(typeof client.get).toBe('function');
      expect(typeof client.set).toBe('function');
    });

    it('should create client from environment', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://env-redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'env-token';

      const envClient = createServerClient();
      expect(envClient).toBeDefined();

      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });
  });

  describe('String Operations', () => {
    beforeEach(() => {
      mockRedis.get.mockResolvedValue('test-value');
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.del.mockResolvedValue(1);
      mockRedis.exists.mockResolvedValue(1);
    });

    it('should get string value', async () => {
      const result = await client.get('test-key');

      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
      expect(result).toBe('test-value');
    });

    it('should set string value', async () => {
      const result = await client.set('test-key', 'test-value');

      expect(mockRedis.set).toHaveBeenCalledWith('test-key', 'test-value');
      expect(result).toBe('OK');
    });

    it('should set with expiration', async () => {
      await client.set('test-key', 'test-value', { ex: 3600 });

      expect(mockRedis.set).toHaveBeenCalledWith('test-key', 'test-value', { ex: 3600 });
    });

    it('should delete key', async () => {
      const result = await client.del('test-key');

      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
      expect(result).toBe(1);
    });

    it('should check key existence', async () => {
      const result = await client.exists('test-key');

      expect(mockRedis.exists).toHaveBeenCalledWith('test-key');
      expect(result).toBe(1);
    });
  });

  describe('Numeric Operations', () => {
    beforeEach(() => {
      mockRedis.incr.mockResolvedValue(2);
      mockRedis.decr.mockResolvedValue(0);
    });

    it('should increment value', async () => {
      const result = await client.incr('counter');

      expect(mockRedis.incr).toHaveBeenCalledWith('counter');
      expect(result).toBe(2);
    });

    it('should decrement value', async () => {
      const result = await client.decr('counter');

      expect(mockRedis.decr).toHaveBeenCalledWith('counter');
      expect(result).toBe(0);
    });
  });

  describe('List Operations', () => {
    beforeEach(() => {
      mockRedis.lpush.mockResolvedValue(2);
      mockRedis.rpush.mockResolvedValue(3);
      mockRedis.lpop.mockResolvedValue('first');
      mockRedis.rpop.mockResolvedValue('last');
      mockRedis.lrange.mockResolvedValue(['item1', 'item2']);
    });

    it('should push to left of list', async () => {
      const result = await client.lpush('list-key', 'item1', 'item2');

      expect(mockRedis.lpush).toHaveBeenCalledWith('list-key', 'item1', 'item2');
      expect(result).toBe(2);
    });

    it('should push to right of list', async () => {
      const result = await client.rpush('list-key', 'item1');

      expect(mockRedis.rpush).toHaveBeenCalledWith('list-key', 'item1');
      expect(result).toBe(3);
    });

    it('should pop from left of list', async () => {
      const result = await client.lpop('list-key');

      expect(mockRedis.lpop).toHaveBeenCalledWith('list-key');
      expect(result).toBe('first');
    });

    it('should get range from list', async () => {
      const result = await client.lrange('list-key', 0, -1);

      expect(mockRedis.lrange).toHaveBeenCalledWith('list-key', 0, -1);
      expect(result).toEqual(['item1', 'item2']);
    });
  });

  describe('Set Operations', () => {
    beforeEach(() => {
      mockRedis.sadd.mockResolvedValue(1);
      mockRedis.srem.mockResolvedValue(1);
      mockRedis.smembers.mockResolvedValue(['member1', 'member2']);
      mockRedis.sismember.mockResolvedValue(1);
    });

    it('should add to set', async () => {
      const result = await client.sadd('set-key', 'member1');

      expect(mockRedis.sadd).toHaveBeenCalledWith('set-key', 'member1');
      expect(result).toBe(1);
    });

    it('should remove from set', async () => {
      const result = await client.srem('set-key', 'member1');

      expect(mockRedis.srem).toHaveBeenCalledWith('set-key', 'member1');
      expect(result).toBe(1);
    });

    it('should get all members', async () => {
      const result = await client.smembers('set-key');

      expect(mockRedis.smembers).toHaveBeenCalledWith('set-key');
      expect(result).toEqual(['member1', 'member2']);
    });

    it('should check membership', async () => {
      const result = await client.sismember('set-key', 'member1');

      expect(mockRedis.sismember).toHaveBeenCalledWith('set-key', 'member1');
      expect(result).toBe(1);
    });
  });

  describe('Hash Operations', () => {
    beforeEach(() => {
      mockRedis.hset.mockResolvedValue(1);
      mockRedis.hget.mockResolvedValue('value1');
      mockRedis.hdel.mockResolvedValue(1);
      mockRedis.hgetall.mockResolvedValue({ field1: 'value1', field2: 'value2' });
    });

    it('should set hash field', async () => {
      const result = await client.hset('hash-key', { field1: 'value1' });

      expect(mockRedis.hset).toHaveBeenCalledWith('hash-key', { field1: 'value1' });
      expect(result).toBe(1);
    });

    it('should get hash field', async () => {
      const result = await client.hget('hash-key', 'field1');

      expect(mockRedis.hget).toHaveBeenCalledWith('hash-key', 'field1');
      expect(result).toBe('value1');
    });

    it('should delete hash field', async () => {
      const result = await client.hdel('hash-key', 'field1');

      expect(mockRedis.hdel).toHaveBeenCalledWith('hash-key', 'field1');
      expect(result).toBe(1);
    });

    it('should get all hash fields', async () => {
      const result = await client.hgetall('hash-key');

      expect(mockRedis.hgetall).toHaveBeenCalledWith('hash-key');
      expect(result).toEqual({ field1: 'value1', field2: 'value2' });
    });
  });

  describe('Sorted Set Operations', () => {
    beforeEach(() => {
      mockRedis.zadd.mockResolvedValue(1);
      mockRedis.zrange.mockResolvedValue(['member1', 'member2']);
      mockRedis.zrem.mockResolvedValue(1);
      mockRedis.zscore.mockResolvedValue(1.5);
    });

    it('should add to sorted set', async () => {
      const result = await client.zadd('zset-key', { score: 1, member: 'member1' });

      expect(mockRedis.zadd).toHaveBeenCalledWith('zset-key', { score: 1, member: 'member1' });
      expect(result).toBe(1);
    });

    it('should get range from sorted set', async () => {
      const result = await client.zrange('zset-key', 0, -1);

      expect(mockRedis.zrange).toHaveBeenCalledWith('zset-key', 0, -1);
      expect(result).toEqual(['member1', 'member2']);
    });

    it('should remove from sorted set', async () => {
      const result = await client.zrem('zset-key', 'member1');

      expect(mockRedis.zrem).toHaveBeenCalledWith('zset-key', 'member1');
      expect(result).toBe(1);
    });

    it('should get member score', async () => {
      const result = await client.zscore('zset-key', 'member1');

      expect(mockRedis.zscore).toHaveBeenCalledWith('zset-key', 'member1');
      expect(result).toBe(1.5);
    });
  });

  describe('Pipeline Operations', () => {
    beforeEach(() => {
      mockPipeline.exec.mockResolvedValue(['OK', 'test-value', 1]);
    });

    it('should execute pipeline', async () => {
      const pipeline = client.pipeline();
      pipeline.set('key1', 'value1');
      pipeline.get('key2');
      pipeline.del('key3');

      const result = await pipeline.exec();

      expect(mockPipeline.set).toHaveBeenCalledWith('key1', 'value1');
      expect(mockPipeline.get).toHaveBeenCalledWith('key2');
      expect(mockPipeline.del).toHaveBeenCalledWith('key3');
      expect(mockPipeline.exec).toHaveBeenCalled();
      expect(result).toEqual(['OK', 'test-value', 1]);
    });

    it('should execute multi transaction', async () => {
      const multi = client.multi();
      multi.set('key1', 'value1');
      multi.get('key1');

      const result = await multi.exec();

      expect(mockPipeline.set).toHaveBeenCalledWith('key1', 'value1');
      expect(mockPipeline.get).toHaveBeenCalledWith('key1');
      expect(result).toEqual(['OK', 'test-value', 1]);
    });
  });

  describe('Pub/Sub Operations', () => {
    beforeEach(() => {
      mockRedis.publish.mockResolvedValue(1);
      mockRedis.subscribe.mockResolvedValue(undefined);
    });

    it('should publish message', async () => {
      const result = await client.publish('channel', 'message');

      expect(mockRedis.publish).toHaveBeenCalledWith('channel', 'message');
      expect(result).toBe(1);
    });
  });

  describe('Lua Script Operations', () => {
    beforeEach(() => {
      mockRedis.eval.mockResolvedValue('script-result');
    });

    it('should execute lua script', async () => {
      const script = 'return redis.call("get", KEYS[1])';
      const result = await client.eval(script, ['test-key'], []);

      expect(mockRedis.eval).toHaveBeenCalledWith(script, ['test-key'], []);
      expect(result).toBe('script-result');
    });
  });

  describe('TTL Operations', () => {
    beforeEach(() => {
      mockRedis.expire.mockResolvedValue(1);
      mockRedis.ttl.mockResolvedValue(3600);
    });

    it('should set expiration', async () => {
      const result = await client.expire('test-key', 3600);

      expect(mockRedis.expire).toHaveBeenCalledWith('test-key', 3600);
      expect(result).toBe(1);
    });

    it('should get TTL', async () => {
      const result = await client.ttl('test-key');

      expect(mockRedis.ttl).toHaveBeenCalledWith('test-key');
      expect(result).toBe(3600);
    });
  });

  describe('Safe Operations', () => {
    it('should handle successful operations', async () => {
      mockRedis.get.mockResolvedValue('test-value');

      const result = await safeServerOperation(async () => {
        return await client.get('test-key');
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test-value');
      }
    });

    it('should handle failed operations', async () => {
      mockRedis.get.mockRejectedValue(new Error('Connection error'));

      const result = await safeServerOperation(async () => {
        return await client.get('test-key');
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection error');
      }
    });

    it('should handle timeout errors', async () => {
      mockRedis.get.mockRejectedValue(new Error('Request timeout'));

      const result = await safeServerOperation(async () => {
        return await client.get('test-key');
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Request timeout');
        expect(result.isRetryable).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', async () => {
      mockRedis.get.mockRejectedValue(new Error('Connection refused'));

      await expect(async () => {
        await client.get('test-key');
      }).rejects.toThrow('Connection refused');
    });

    it('should handle authentication errors', async () => {
      mockRedis.get.mockRejectedValue(new Error('WRONGPASS invalid username-password pair'));

      await expect(async () => {
        await client.get('test-key');
      }).rejects.toThrow('WRONGPASS invalid username-password pair');
    });

    it('should handle rate limit errors', async () => {
      mockRedis.get.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(async () => {
        await client.get('test-key');
      }).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('Connection Management', () => {
    it('should maintain connection pool stats', async () => {
      // This would test the connection pooling functionality
      // In a real implementation, you'd track active connections
      expect(client).toBeDefined();
    });
  });
});
