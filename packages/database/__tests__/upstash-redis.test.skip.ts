import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  mockUpstashRedisClient,
  mockUpstashRedisAdapter,
  resetMockRedisStorage,
  seedMockRedisData,
  RedisDatabaseTestHelper,
  testDatabaseOperations,
  testDatabaseErrors,
  createTestUser,
  createTestUsers,
} from '@repo/testing/database';

// Mock the Upstash Redis module
vi.mock('@upstash/redis', async () => {
  const { mockUpstashRedis } = await import('@repo/testing/database');
  return mockUpstashRedis;
});

describe('Upstash Redis Adapter', () => {
  let helper: RedisDatabaseTestHelper;

  beforeEach(async () => {
    resetMockRedisStorage();
    helper = new RedisDatabaseTestHelper(mockUpstashRedisAdapter as any);
    await helper.setup();
  });

  afterEach(async () => {
    resetMockRedisStorage();
    await helper.cleanup();
  });

  describe('Basic CRUD Operations', () => {
    it('should perform complete CRUD operations', async () => {
      await testDatabaseOperations(helper, 'users');
    });

    it('should create a record with JSON serialization', async () => {
      const testData = createTestUser();
      const result = await mockUpstashRedisAdapter.create('users', testData);

      expect(result).toMatchObject(testData);

      // Verify it's stored in Redis
      const key = `users:${testData.id}`;
      const stored = await mockUpstashRedisClient.get(key);
      expect(JSON.parse(stored!)).toMatchObject(testData);
    });

    it('should find a unique record', async () => {
      const testData = createTestUser();
      await mockUpstashRedisAdapter.create('users', testData);

      const found = await mockUpstashRedisAdapter.findUnique('users', { id: testData.id });
      expect(found).toMatchObject(testData);
    });

    it('should update a record with merge', async () => {
      const testData = createTestUser();
      await mockUpstashRedisAdapter.create('users', testData);

      const updateData = { name: 'Updated Name', active: false };
      const updated = await mockUpstashRedisAdapter.update('users', testData.id, updateData);

      expect(updated).toMatchObject({ ...testData, ...updateData });
    });

    it('should delete a record', async () => {
      const testData = createTestUser();
      await mockUpstashRedisAdapter.create('users', testData);

      const deleted = await mockUpstashRedisAdapter.delete('users', testData.id);
      expect(deleted).toMatchObject(testData);

      const found = await mockUpstashRedisAdapter.findUnique('users', { id: testData.id });
      expect(found).toBeNull();
    });

    it('should find many records with pattern matching', async () => {
      const users = createTestUsers(3);
      
      for (const user of users) {
        await mockUpstashRedisAdapter.create('users', user);
      }

      const found = await mockUpstashRedisAdapter.findMany('users');
      expect(found).toHaveLength(3);
      
      const foundIds = found.map((u: any) => u.id);
      const expectedIds = users.map(u => u.id);
      expect(foundIds).toEqual(expect.arrayContaining(expectedIds));
    });

    it('should count records with pattern matching', async () => {
      const users = createTestUsers(5);
      
      for (const user of users) {
        await mockUpstashRedisAdapter.create('users', user);
      }

      const count = await mockUpstashRedisAdapter.count('users');
      expect(count).toBe(5);
    });
  });

  describe('Redis String Operations', () => {
    it('should set and get values directly', async () => {
      await mockUpstashRedisClient.set('test-key', 'test-value');
      const value = await mockUpstashRedisClient.get('test-key');
      expect(value).toBe('test-value');
    });

    it('should set values with expiration', async () => {
      const testData = createTestUser();
      const result = await mockUpstashRedisAdapter.setWithExpiration(
        'sessions', 
        testData.id, 
        testData, 
        3600
      );

      expect(result).toMatchObject(testData);
      await helper.assertTTL(`sessions:${testData.id}`, 3600);
    });

    it('should check if keys exist', async () => {
      const testData = createTestUser();
      await mockUpstashRedisAdapter.create('users', testData);

      await helper.assertKeyExists(`users:${testData.id}`);
    });

    it('should handle TTL operations', async () => {
      await mockUpstashRedisClient.set('temp-key', 'value', { ex: 1800 });
      const ttl = await mockUpstashRedisClient.ttl('temp-key');
      
      expect(ttl).toBeGreaterThan(1700);
      expect(ttl).toBeLessThanOrEqual(1800);
    });
  });

  describe('Redis Numeric Operations', () => {
    it('should increment counters', async () => {
      const result1 = await mockUpstashRedisAdapter.increment('counters', 'page-views');
      expect(result1).toBe(1);

      const result2 = await mockUpstashRedisAdapter.increment('counters', 'page-views', undefined, 5);
      expect(result2).toBe(6);
    });

    it('should decrement counters', async () => {
      // Set initial value
      await mockUpstashRedisAdapter.increment('counters', 'credits', undefined, 10);
      
      const result = await mockUpstashRedisAdapter.decrement('counters', 'credits', undefined, 3);
      expect(result).toBe(7);
    });
  });

  describe('Redis List Operations', () => {
    it('should push and pop items from lists', async () => {
      const items = ['item1', 'item2', 'item3'];
      
      // Push items
      const length = await mockUpstashRedisAdapter.listPush('queue', 'tasks', ...items);
      expect(length).toBe(3);

      await helper.assertListLength('queue', 'tasks', 3);

      // Pop item
      const popped = await mockUpstashRedisAdapter.listPop('queue', 'tasks');
      expect(popped).toBe('item3'); // LIFO order

      await helper.assertListLength('queue', 'tasks', 2);
    });

    it('should get list range', async () => {
      const emails = [
        { to: 'user1@example.com', subject: 'Welcome' },
        { to: 'user2@example.com', subject: 'Newsletter' },
        { to: 'user3@example.com', subject: 'Update' },
      ];

      await mockUpstashRedisAdapter.listPush('queue', 'emails', ...emails);
      const range = await mockUpstashRedisAdapter.listRange('queue', 'emails', 0, -1);
      
      expect(range).toHaveLength(3);
      expect(range[0]).toEqual(emails[2]); // Last pushed is first
    });

    it('should get list length', async () => {
      await mockUpstashRedisAdapter.listPush('queue', 'jobs', 'job1', 'job2');
      const length = await mockUpstashRedisAdapter.listLength('queue', 'jobs');
      expect(length).toBe(2);
    });
  });

  describe('Redis Set Operations', () => {
    it('should add and remove set members', async () => {
      const tags = ['javascript', 'redis', 'database'];
      
      const added = await mockUpstashRedisAdapter.setAdd('tags', 'post1', ...tags);
      expect(added).toBe(3);

      await helper.assertSetMember('tags', 'post1', 'javascript');

      const removed = await mockUpstashRedisAdapter.setRemove('tags', 'post1', 'redis');
      expect(removed).toBe(1);

      const members = await mockUpstashRedisAdapter.setMembers('tags', 'post1');
      expect(members).toHaveLength(2);
      expect(members).toContain('javascript');
      expect(members).toContain('database');
      expect(members).not.toContain('redis');
    });

    it('should check set membership', async () => {
      await mockUpstashRedisAdapter.setAdd('categories', 'article1', 'tech', 'programming');
      
      const isMember = await mockUpstashRedisAdapter.setIsMember('categories', 'article1', 'tech');
      expect(isMember).toBe(true);

      const isNotMember = await mockUpstashRedisAdapter.setIsMember('categories', 'article1', 'cooking');
      expect(isNotMember).toBe(false);
    });
  });

  describe('Redis Hash Operations', () => {
    it('should set and get hash fields', async () => {
      await mockUpstashRedisAdapter.hashSet('profiles', 'user1', 'name', 'John Doe');
      await mockUpstashRedisAdapter.hashSet('profiles', 'user1', 'email', 'john@example.com');

      await helper.assertHashField('profiles', 'user1', 'name', 'John Doe');
      await helper.assertHashField('profiles', 'user1', 'email', 'john@example.com');
    });

    it('should get all hash fields', async () => {
      const userData = { name: 'Jane Doe', age: 30, city: 'New York' };
      
      for (const [field, value] of Object.entries(userData)) {
        await mockUpstashRedisAdapter.hashSet('profiles', 'user2', field, value);
      }

      const profile = await mockUpstashRedisAdapter.hashGetAll('profiles', 'user2');
      expect(profile.name).toBe('Jane Doe');
      expect(profile.age).toBe(30);
      expect(profile.city).toBe('New York');
    });

    it('should delete hash fields', async () => {
      await mockUpstashRedisAdapter.hashSet('temp', 'data', 'field1', 'value1');
      await mockUpstashRedisAdapter.hashSet('temp', 'data', 'field2', 'value2');

      const deleted = await mockUpstashRedisAdapter.hashDelete('temp', 'data', 'field1');
      expect(deleted).toBe(1);

      const remaining = await mockUpstashRedisAdapter.hashGet('temp', 'data', 'field1');
      expect(remaining).toBeNull();

      const existing = await mockUpstashRedisAdapter.hashGet('temp', 'data', 'field2');
      expect(existing).toBe('value2');
    });
  });

  describe('Redis Sorted Set Operations', () => {
    it('should add members with scores', async () => {
      const players = [
        { score: 1000, member: { userId: 'user1', name: 'Alice' } },
        { score: 950, member: { userId: 'user2', name: 'Bob' } },
        { score: 1050, member: { userId: 'user3', name: 'Charlie' } },
      ];

      const added = await mockUpstashRedisAdapter.sortedSetAdd('leaderboard', 'game1', ...players);
      expect(added).toBe(3);
    });

    it('should get sorted set range', async () => {
      const players = [
        { score: 100, member: { name: 'Player1' } },
        { score: 200, member: { name: 'Player2' } },
        { score: 300, member: { name: 'Player3' } },
      ];

      await mockUpstashRedisAdapter.sortedSetAdd('scores', 'daily', ...players);

      // Get top 2 players (highest scores)
      const topPlayers = await mockUpstashRedisAdapter.sortedSetRange('scores', 'daily', 0, 1, true);
      expect(topPlayers).toHaveLength(2);
      
      if (Array.isArray(topPlayers) && topPlayers.length > 0 && 'score' in topPlayers[0]) {
        expect((topPlayers[0] as any).score).toBe(100); // Lowest score first in ascending order
      }
    });

    it('should get member score', async () => {
      const player = { name: 'TestPlayer', id: 'player1' };
      await mockUpstashRedisAdapter.sortedSetAdd('rankings', 'weekly', 
        { score: 750, member: player }
      );

      await helper.assertSortedSetScore('rankings', 'weekly', player, 750);
    });
  });

  describe('Batch Operations', () => {
    it('should set multiple records', async () => {
      const users = createTestUsers(3);
      const result = await mockUpstashRedisAdapter.setMultiple('users', users);
      
      expect(result).toHaveLength(3);
      
      // Verify all users were stored
      for (const user of users) {
        const found = await mockUpstashRedisAdapter.findUnique('users', { id: user.id });
        expect(found).toMatchObject(user);
      }
    });

    it('should get multiple records', async () => {
      const users = createTestUsers(3);
      await mockUpstashRedisAdapter.setMultiple('users', users);
      
      const ids = users.map(u => u.id);
      const results = await mockUpstashRedisAdapter.getMultiple('users', ids);
      
      expect(results).toHaveLength(3);
      results.forEach((result: any, index: number) => {
        if (result) {
          expect(result).toMatchObject(users[index]);
        }
      });
    });

    it('should delete multiple records', async () => {
      const users = createTestUsers(3);
      await mockUpstashRedisAdapter.setMultiple('users', users);
      
      const ids = users.map(u => u.id);
      const deleted = await mockUpstashRedisAdapter.deleteMultiple('users', ids);
      
      expect(deleted).toHaveLength(3);
      
      // Verify all users were deleted
      for (const id of ids) {
        const found = await mockUpstashRedisAdapter.findUnique('users', { id });
        expect(found).toBeNull();
      }
    });
  });

  describe('Pipeline Operations', () => {
    it('should execute pipeline operations', async () => {
      const pipeline = mockUpstashRedisClient.pipeline();
      
      pipeline.set('key1', 'value1');
      pipeline.set('key2', 'value2');
      pipeline.incr('counter');
      
      const results = await pipeline.exec();
      
      expect(results).toHaveLength(3);
      expect(results[0]).toBe('OK');
      expect(results[1]).toBe('OK');
      expect(results[2]).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle common error scenarios', async () => {
      await testDatabaseErrors(helper, 'users');
    });

    it('should handle missing data field for create', async () => {
      await expect(
        mockUpstashRedisAdapter.create('users', { name: 'No ID' })
      ).rejects.toThrow('must have an "id" field');
    });

    it('should handle non-existent keys', async () => {
      const found = await mockUpstashRedisAdapter.findUnique('users', { 
        id: 'non-existent' 
      });
      expect(found).toBeNull();
    });

    it('should handle empty collections', async () => {
      const results = await mockUpstashRedisAdapter.findMany('empty-collection');
      expect(results).toEqual([]);
      
      const count = await mockUpstashRedisAdapter.count('empty-collection');
      expect(count).toBe(0);
    });
  });

  describe('Raw Operations', () => {
    it('should execute raw Redis commands', async () => {
      const result = await mockUpstashRedisAdapter.raw('set', ['raw-key', 'raw-value']);
      expect(result).toBe('OK');
      
      const value = await mockUpstashRedisAdapter.raw('get', 'raw-key');
      expect(value).toBe('raw-value');
    });

    it('should handle raw operations with array params', async () => {
      const result = await mockUpstashRedisAdapter.raw('mset', ['key1', 'value1', 'key2', 'value2']);
      expect(result).toBe('OK');
      
      const values = await mockUpstashRedisAdapter.raw('mget', ['key1', 'key2']);
      expect(values).toEqual(['value1', 'value2']);
    });

    it('should throw error for unsupported raw operation', async () => {
      await expect(
        mockUpstashRedisAdapter.raw('unsupported', {})
      ).rejects.toThrow('not supported');
    });
  });

  describe('Utility Operations', () => {
    it('should ping successfully', async () => {
      const pong = await mockUpstashRedisAdapter.ping();
      expect(pong).toBe('PONG');
    });

    it('should flush all data', async () => {
      // Add some data first
      await mockUpstashRedisAdapter.create('users', createTestUser());
      await mockUpstashRedisClient.set('test-key', 'test-value');
      
      const result = await mockUpstashRedisAdapter.flushAll();
      expect(result).toBe('OK');
      
      // Verify data is gone
      const count = await mockUpstashRedisAdapter.count('users');
      expect(count).toBe(0);
      
      const value = await mockUpstashRedisClient.get('test-key');
      expect(value).toBeNull();
    });
  });

  describe('Adapter Interface Compliance', () => {
    it('should implement all required RedisDatabaseAdapter methods', () => {
      const adapter = mockUpstashRedisAdapter;
      
      // Base adapter methods
      expect(typeof adapter.initialize).toBe('function');
      expect(typeof adapter.disconnect).toBe('function');
      expect(typeof adapter.getClient).toBe('function');
      expect(typeof adapter.create).toBe('function');
      expect(typeof adapter.update).toBe('function');
      expect(typeof adapter.delete).toBe('function');
      expect(typeof adapter.findUnique).toBe('function');
      expect(typeof adapter.findMany).toBe('function');
      expect(typeof adapter.count).toBe('function');
      expect(typeof adapter.raw).toBe('function');

      // Redis-specific methods
      expect(typeof adapter.setWithExpiration).toBe('function');
      expect(typeof adapter.getMultiple).toBe('function');
      expect(typeof adapter.setMultiple).toBe('function');
      expect(typeof adapter.deleteMultiple).toBe('function');
      expect(typeof adapter.exists).toBe('function');
      expect(typeof adapter.expire).toBe('function');
      expect(typeof adapter.ttl).toBe('function');
      expect(typeof adapter.increment).toBe('function');
      expect(typeof adapter.decrement).toBe('function');
      expect(typeof adapter.listPush).toBe('function');
      expect(typeof adapter.listPop).toBe('function');
      expect(typeof adapter.setAdd).toBe('function');
      expect(typeof adapter.hashSet).toBe('function');
      expect(typeof adapter.sortedSetAdd).toBe('function');
      expect(typeof adapter.ping).toBe('function');
    });

    it('should initialize and disconnect without errors', async () => {
      await expect(mockUpstashRedisAdapter.initialize()).resolves.not.toThrow();
      await expect(mockUpstashRedisAdapter.disconnect()).resolves.not.toThrow();
    });

    it('should return the client instance', () => {
      const client = mockUpstashRedisAdapter.getClient();
      expect(client).toBeDefined();
      expect(typeof client.set).toBe('function');
    });
  });

  describe('Data Seeding', () => {
    it('should seed mock data correctly', () => {
      const testData = {
        'user:1': createTestUser({ name: 'Seeded User 1' }),
        'user:2': createTestUser({ name: 'Seeded User 2' }),
        'config:theme': 'dark',
      };

      seedMockRedisData(testData);

      // Verify seeded data is accessible
      Object.entries(testData).forEach(async ([key, value]) => {
        const result = await mockUpstashRedisClient.get(key);
        if (typeof value === 'string') {
          expect(result).toBe(value);
        } else {
          expect(JSON.parse(result!)).toMatchObject(value);
        }
      });
    });
  });
});

// Integration test with the actual Upstash Redis adapter class
describe('UpstashRedisAdapter Integration', () => {
  it('should be importable and instantiable', async () => {
    const { UpstashRedisAdapter } = await import('../redis/adapter');
    expect(UpstashRedisAdapter).toBeDefined();
    expect(typeof UpstashRedisAdapter).toBe('function');
  });
});