import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { createRedisAdapter, resetMockRedisStorage } from '../mocks/providers/upstash/redis';
import {
  cleanupSRHEnvironment,
  createSRHTestConfig,
  generateSRHDockerCompose,
  generateSRHGitHubActions,
  setupSRHEnvironment,
  withSRH,
  withSRHEnvironment,
} from '../setup/srh';

// Example 1: Basic SRH setup with environment variables
describe('sRH Basic Setup', () => {
  beforeAll(async () => {
    // Setup SRH environment for all tests in this describe block
    setupSRHEnvironment({
      url: 'http://localhost:8080',
      token: 'test-token',
      redisUrl: 'redis://localhost:6379',
    });
  });

  afterAll(() => {
    // Cleanup SRH environment
    cleanupSRHEnvironment();
  });

  test('should connect to SRH when available', async () => {
    const adapter = createRedisAdapter();
    await adapter.initialize();

    // Test basic operations
    const testData = { id: 'test-1', name: 'Test Item', value: 123 };
    const created = await adapter.create('test-collection', testData);
    expect(created).toStrictEqual(testData);

    const found = await adapter.findUnique('test-collection', { id: 'test-1' });
    expect(found).toStrictEqual(testData);

    // Cleanup
    await adapter.delete('test-collection', 'test-1');
  });
});

// Example 2: Using SRH with automatic container management
describe('sRH with Container Management', () => {
  const srhSetup = withSRH({
    url: 'http://localhost:8080',
    token: 'container-token',
  });

  beforeAll(async () => {
    await srhSetup.setup();
  });

  beforeEach(async () => {
    // Reset any existing data
    const adapter = createRedisAdapter();
    await adapter.initialize();
    await adapter.flushAll();
  });

  afterAll(async () => {
    await srhSetup.teardown();
  });

  test.todo('should work with SRH container');
});

// Example 3: Fallback to mock when SRH is not available
describe('sRH Fallback to Mock', () => {
  beforeEach(() => {
    // Reset mock storage before each test
    resetMockRedisStorage();
  });

  test('should fallback to mock when SRH is not available', async () => {
    // Don't set SRH environment variables, so it should fallback to mock
    const adapter = createRedisAdapter();
    await adapter.initialize();

    const testData = { id: 'mock-test', name: 'Mock Test' };
    const created = await adapter.create('test-collection', testData);
    expect(created).toStrictEqual(testData);

    const found = await adapter.findUnique('test-collection', { id: 'mock-test' });
    expect(found).toStrictEqual(testData);
  });
});

// Example 4: Testing with different SRH configurations
describe('sRH Configuration Examples', () => {
  test('should generate Docker Compose configuration', () => {
    const config = createSRHTestConfig({
      url: 'http://localhost:8080',
      token: 'custom-token',
      redisUrl: 'redis://custom-redis:6379',
    });

    const dockerCompose = generateSRHDockerCompose(config);
    expect(dockerCompose).toContain('hiett/serverless-redis-http:latest');
    expect(dockerCompose).toContain('custom-token');
    expect(dockerCompose).toContain('redis://custom-redis:6379');
  });

  test('should generate GitHub Actions configuration', () => {
    const config = createSRHTestConfig({
      token: 'github-token',
    });

    const githubActions = generateSRHGitHubActions(config);
    expect(githubActions).toContain('hiett/serverless-redis-http:latest');
    expect(githubActions).toContain('github-token');
    expect(githubActions).toContain('UPSTASH_REDIS_REST_URL');
  });
});

// Example 5: Advanced SRH testing with multiple operations
describe('sRH Advanced Operations', () => {
  const srhEnv = withSRHEnvironment({
    url: 'http://localhost:8080',
    token: 'advanced-token',
  });

  beforeAll(() => {
    srhEnv.setup();
  });

  beforeEach(async () => {
    // Reset any existing data
    const adapter = createRedisAdapter();
    await adapter.initialize();
    await adapter.flushAll();
  });

  afterAll(() => {
    srhEnv.teardown();
  });

  test('should handle complex Redis operations', async () => {
    const adapter = createRedisAdapter();
    await adapter.initialize();
    const client = adapter.getClient();

    // Test string operations
    await client.set('string-key', 'string-value', { ex: 60 });
    expect(await client.get('string-key')).toBe('string-value');
    expect(await client.ttl('string-key')).toBeGreaterThan(0);

    // Test list operations
    await client.lpush('list-key', 'item1', 'item2', 'item3');
    expect(await client.llen('list-key')).toBe(3);
    expect(await client.lrange('list-key', 0, -1)).toStrictEqual(['item3', 'item2', 'item1']);

    // Test set operations
    await client.sadd('set-key', 'member1', 'member2', 'member3');
    expect(await client.scard('set-key')).toBe(3);
    expect(await client.sismember('set-key', 'member1')).toBe(1);

    // Test hash operations
    await client.hset('hash-key', { field1: 'value1', field2: 'value2' });
    expect(await client.hget('hash-key', 'field1')).toBe('value1');
    const hashData = await client.hgetall('hash-key');
    expect(hashData).toStrictEqual({ field1: 'value1', field2: 'value2' });

    // Test sorted set operations
    await client.zadd(
      'zset-key',
      { score: 1, member: 'member1' },
      { score: 2, member: 'member2' },
      { score: 3, member: 'member3' },
    );
    expect(await client.zcard('zset-key')).toBe(3);
    const zsetRange = await client.zrange('zset-key', 0, -1, { withScores: true });
    expect(zsetRange).toHaveLength(3);
  });

  test('should handle adapter operations with collections', async () => {
    const adapter = createRedisAdapter();
    await adapter.initialize();

    // Create multiple items
    const items = [
      { id: 'item-1', name: 'Item 1', category: 'test' },
      { id: 'item-2', name: 'Item 2', category: 'test' },
      { id: 'item-3', name: 'Item 3', category: 'other' },
    ];

    for (const item of items) {
      await adapter.create('test-collection', item);
    }

    // Test findMany with pattern
    const testItems = await adapter.findMany('test-collection', {
      pattern: 'test-collection:item-*',
      limit: 10,
    });
    expect(testItems).toHaveLength(3);

    // Test count
    const count = await adapter.count('test-collection');
    expect(count).toBe(3);

    // Test update
    const updated = (await adapter.update('test-collection', 'item-1', {
      name: 'Updated Item 1',
    })) as { id: string; name: string; category: string };
    expect(updated.name).toBe('Updated Item 1');

    // Test delete
    await adapter.delete('test-collection', 'item-1');
    const deleted = await adapter.findUnique('test-collection', { id: 'item-1' });
    expect(deleted).toBeNull();
  });
});

// Example 6: Error handling and edge cases
describe('sRH Error Handling', () => {
  test('should handle connection failures gracefully', async () => {
    // Set invalid SRH configuration
    setupSRHEnvironment({
      url: 'http://invalid-url:9999',
      token: 'invalid-token',
    });

    const adapter = createRedisAdapter();

    // Should fallback to mock when connection fails
    await expect(adapter.initialize()).resolves.not.toThrow();

    cleanupSRHEnvironment();
  });

  test('should handle missing environment variables', async () => {
    // Don't set any SRH environment variables
    const adapter = createRedisAdapter();

    // Should use mock adapter
    await expect(adapter.initialize()).resolves.not.toThrow();

    const testData = { id: 'test', name: 'Test' };
    const created = await adapter.create('test-collection', testData);
    expect(created).toStrictEqual(testData);
  });
});

// Example 7: Performance testing with SRH
describe('sRH Performance Testing', () => {
  const srhEnv = withSRHEnvironment();

  beforeAll(() => {
    srhEnv.setup();
  });

  beforeEach(async () => {
    // Reset any existing data
    const adapter = createRedisAdapter();
    await adapter.initialize();
    await adapter.flushAll();
  });

  afterAll(() => {
    srhEnv.teardown();
  });

  test('should handle bulk operations efficiently', async () => {
    const adapter = createRedisAdapter();
    await adapter.initialize();
    const client = adapter.getClient();

    const startTime = Date.now();
    const operations = 100;

    // Bulk set operations
    for (let i = 0; i < operations; i++) {
      await client.set(`bulk-key-${i}`, `value-${i}`);
    }

    // Bulk get operations
    for (let i = 0; i < operations; i++) {
      await client.get(`bulk-key-${i}`);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time (adjust based on your requirements)
    expect(duration).toBeLessThan(10000); // 10 seconds

    // Cleanup
    for (let i = 0; i < operations; i++) {
      await client.del(`bulk-key-${i}`);
    }
  });
});

describe('sRH Container Example', () => {
  const srhSetup = withSRHEnvironment({
    url: 'http://localhost:8080',
    token: 'container-token',
  });

  beforeAll(async () => {
    await srhSetup.setup();
  });

  beforeEach(async () => {
    // Reset any existing data
    const adapter = createRedisAdapter();
    await adapter.initialize();
    await adapter.flushAll();
  });

  afterAll(async () => {
    await srhSetup.teardown();
  });

  test.todo('should work with SRH container');
});
