import { expect, vi } from 'vitest';

// Define types locally to avoid circular dependency
interface DatabaseAdapter {
  count(collection: string, query?: any): Promise<number>;
  create<T>(collection: string, data: any): Promise<T>;
  delete<T>(collection: string, id: string): Promise<T>;
  disconnect(): Promise<void>;
  findMany<T>(collection: string, query?: any): Promise<T[]>;
  findUnique<T>(collection: string, query: any): Promise<T | null>;
  initialize(): Promise<void>;
  raw<T = any>(operation: string, params: any): Promise<T>;
  update<T>(collection: string, id: string, data: any): Promise<T>;
}

interface VectorDatabaseAdapter extends DatabaseAdapter {
  query<T>(options: any, queryOptions?: any): Promise<T[]>;
  queryByText<T>(text: string, options?: any): Promise<T[]>;
  upsertMany<T>(vectors: any[], namespace?: string): Promise<T>;
}

interface RedisDatabaseAdapter extends DatabaseAdapter {
  exists(collection: string, id: string): Promise<boolean>;
  hashGet<T>(collection: string, id: string, field: string): Promise<T | null>;
  hashGetAll<T>(collection: string, id: string): Promise<Record<string, T>>;
  hashSet(collection: string, id: string, field: string, value: any): Promise<void>;
  increment(collection: string, id: string, by?: number, defaultValue?: number): Promise<number>;
  listLength(collection: string, id: string): Promise<number>;
  listPush<T>(collection: string, id: string, ...items: T[]): Promise<number>;
  listRange<T>(collection: string, id: string, start: number, end: number): Promise<T[]>;
  setAdd<T>(collection: string, id: string, ...members: T[]): Promise<number>;
  setIsMember<T>(collection: string, id: string, member: T): Promise<boolean>;
  setMembers<T>(collection: string, id: string): Promise<T[]>;
  setWithExpiration<T>(collection: string, id: string, data: T, ttl: number): Promise<void>;
  sortedSetAdd(
    collection: string,
    id: string,
    ...members: { score: number; member: any }[]
  ): Promise<number>;
  sortedSetRange<T>(
    collection: string,
    id: string,
    start: number,
    end: number,
    withScores?: boolean,
  ): Promise<T[] | { member: T; score: number }[]>;
  sortedSetScore(collection: string, id: string, member: any): Promise<number | null>;
  ttl(collection: string, id: string): Promise<number>;
}
// import type { DatabaseAdapter, VectorDatabaseAdapter, RedisDatabaseAdapter } from '@repo/database/types';

// Database testing utilities
export interface DatabaseTestConfig {
  mockData?: Record<string, any>;
  provider: 'prisma' | 'firestore' | 'upstash-vector' | 'upstash-redis';
  seed?: boolean;
}

// Generic database test helper
export class DatabaseTestHelper<T extends DatabaseAdapter = DatabaseAdapter> {
  constructor(
    protected adapter: T,
    protected config: DatabaseTestConfig = { provider: 'prisma' },
  ) {}

  async setup(): Promise<void> {
    await this.adapter.initialize();

    if (this.config.seed && this.config.mockData) {
      await this.seedData(this.config.mockData);
    }
  }

  async cleanup(): Promise<void> {
    // Clear all test data
    if ('flushAll' in this.adapter) {
      await (this.adapter as any).flushAll();
    } else if ('reset' in this.adapter) {
      await (this.adapter as any).reset();
    }

    await this.adapter.disconnect();
  }

  async seedData(data: Record<string, any[]>): Promise<void> {
    for (const [collection, items] of Object.entries(data)) {
      for (const item of items) {
        await this.adapter.create(collection, item);
      }
    }
  }

  async assertCount(collection: string, expectedCount: number): Promise<void> {
    const count = await this.adapter.count(collection);
    expect(count).toBe(expectedCount);
  }

  async assertExists(collection: string, id: string): Promise<void> {
    const item = await this.adapter.findUnique(collection, { id });
    expect(item).toBeTruthy();
  }

  async assertNotExists(collection: string, id: string): Promise<void> {
    const item = await this.adapter.findUnique(collection, { id });
    expect(item).toBeNull();
  }

  getAdapter(): T {
    return this.adapter;
  }
}

// Vector database specific test helper
export class VectorDatabaseTestHelper extends DatabaseTestHelper<VectorDatabaseAdapter> {
  async seedVectorData(
    collection: string,
    vectors: {
      id: string;
      vector?: number[];
      data?: string;
      metadata?: Record<string, any>;
    }[],
  ): Promise<void> {
    await this.adapter.upsertMany(vectors, collection);
  }

  async assertSimilaritySearch(
    collection: string,
    queryVector: number[],
    expectedIds: string[],
    threshold = 0.8,
  ): Promise<void> {
    const results = await this.adapter.query(
      {
        includeMetadata: true,
        topK: expectedIds.length,
        vector: queryVector,
      },
      { namespace: collection },
    );

    expect(results).toHaveLength(expectedIds.length);

    const resultIds = results.map((r: any) => r.id);
    expect(resultIds).toEqual(expect.arrayContaining(expectedIds));

    // Check that all scores are above threshold
    results.forEach((result: any) => {
      expect(result.score).toBeGreaterThan(threshold);
    });
  }

  async assertTextSearch(collection: string, query: string, expectedCount: number): Promise<void> {
    const results = await this.adapter.queryByText(query, {
      namespace: collection,
      topK: 10,
    });

    expect(results).toHaveLength(expectedCount);
  }
}

// Redis database specific test helper
export class RedisDatabaseTestHelper extends DatabaseTestHelper<RedisDatabaseAdapter> {
  async assertKeyExists(key: string): Promise<void> {
    const collection = key.split(':')[0];
    const id = key.split(':')[1];
    const exists = await this.adapter.exists(collection, id);
    expect(exists).toBe(true);
  }

  async assertKeyNotExists(key: string): Promise<void> {
    const collection = key.split(':')[0];
    const id = key.split(':')[1];
    const exists = await this.adapter.exists(collection, id);
    expect(exists).toBe(false);
  }

  async assertTTL(key: string, expectedSeconds: number, tolerance = 5): Promise<void> {
    const collection = key.split(':')[0];
    const id = key.split(':')[1];
    const ttl = await this.adapter.ttl(collection, id);

    expect(ttl).toBeGreaterThan(expectedSeconds - tolerance);
    expect(ttl).toBeLessThan(expectedSeconds + tolerance);
  }

  async assertListLength(collection: string, id: string, expectedLength: number): Promise<void> {
    const length = await this.adapter.listLength(collection, id);
    expect(length).toBe(expectedLength);
  }

  async assertSetMember<T>(collection: string, id: string, member: T): Promise<void> {
    const isMember = await this.adapter.setIsMember(collection, id, member);
    expect(isMember).toBe(true);
  }

  async assertHashField<T>(
    collection: string,
    id: string,
    field: string,
    expectedValue: T,
  ): Promise<void> {
    const value = await this.adapter.hashGet(collection, id, field);
    expect(value).toEqual(expectedValue as any);
  }

  async assertSortedSetScore<T>(
    collection: string,
    id: string,
    member: T,
    expectedScore: number,
  ): Promise<void> {
    const score = await this.adapter.sortedSetScore(collection, id, member);
    expect(score).toBe(expectedScore);
  }
}

// Test data factories
export const createTestUser = (overrides?: Partial<any>) => ({
  id: `user_${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test User',
  active: true,
  createdAt: new Date().toISOString(),
  email: 'test@example.com',
  ...overrides,
});

export const createTestProduct = (overrides?: Partial<any>) => ({
  id: `prod_${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Product',
  category: 'electronics',
  createdAt: new Date().toISOString(),
  inStock: true,
  price: 99.99,
  ...overrides,
});

export const createTestVector = (overrides?: Partial<any>) => ({
  id: `vec_${Math.random().toString(36).substr(2, 9)}`,
  metadata: {
    type: 'document',
    category: 'test',
    timestamp: Date.now(),
  },
  vector: Array.from({ length: 1536 }, () => Math.random() - 0.5),
  ...overrides,
});

// Batch test data creation
export const createTestUsers = (count: number, overrides?: Partial<any>) =>
  Array.from({ length: count }, (_, i) =>
    createTestUser({ name: `Test User ${i + 1}`, ...overrides }),
  );

export const createTestProducts = (count: number, overrides?: Partial<any>) =>
  Array.from({ length: count }, (_, i) =>
    createTestProduct({ name: `Test Product ${i + 1}`, ...overrides }),
  );

export const createTestVectors = (count: number, overrides?: Partial<any>) =>
  Array.from({ length: count }, (_, i) =>
    createTestVector({ metadata: { index: i }, ...overrides }),
  );

// Database operation testing utilities
export const testDatabaseOperations = async <T extends DatabaseAdapter>(
  helper: DatabaseTestHelper<T>,
  collection: string,
) => {
  const testData = createTestUser();

  // Test create
  const created = await helper.getAdapter().create(collection, testData);
  expect(created).toHaveProperty('id');
  // Don't check the id property as it might be generated
  const { id: _createdId, ...createdWithoutId } = created as any;
  const { id: _testId, ...testDataWithoutId } = testData;
  expect(createdWithoutId).toMatchObject(testDataWithoutId);

  // Use the created ID for subsequent operations
  const createdId = (created as any).id;

  // Test findUnique
  const found = await helper.getAdapter().findUnique(collection, { id: createdId });
  expect(found).toBeTruthy();
  const { id: _foundId, ...foundWithoutId } = found as any;
  expect(foundWithoutId).toMatchObject(testDataWithoutId);

  // Test update
  const updateData = { name: 'Updated Name' };
  const updated = await helper.getAdapter().update(collection, createdId, updateData);
  expect(updated).toMatchObject({ ...testDataWithoutId, ...updateData });

  // Test findMany
  const many = await helper.getAdapter().findMany(collection);
  expect(many).toHaveLength(1);
  const { id: _manyId, ...manyWithoutId } = many[0] as any;
  expect(manyWithoutId).toMatchObject({ ...testDataWithoutId, ...updateData });

  // Test count
  await helper.assertCount(collection, 1);

  // Test delete
  const deleted = await helper.getAdapter().delete(collection, createdId);
  const { id: _deletedId, ...deletedWithoutId } = deleted as any;
  expect(deletedWithoutId).toMatchObject({ ...testDataWithoutId, ...updateData });

  // Verify deletion
  await helper.assertNotExists(collection, createdId);
  await helper.assertCount(collection, 0);
};

// Performance testing utilities
export const testDatabasePerformance = async <T extends DatabaseAdapter>(
  helper: DatabaseTestHelper<T>,
  collection: string,
  operations = 100,
) => {
  const testData = Array.from({ length: operations }, (_, i) =>
    createTestUser({ name: `Perf User ${i}` }),
  );

  // Test bulk create performance
  const createStart = performance.now();
  for (const data of testData) {
    await helper.getAdapter().create(collection, data);
  }
  const createEnd = performance.now();
  const createTime = createEnd - createStart;

  // Test bulk read performance
  const readStart = performance.now();
  const _results = await helper.getAdapter().findMany(collection);
  const readEnd = performance.now();
  const readTime = readEnd - readStart;

  // Test bulk delete performance
  const deleteStart = performance.now();
  for (const data of testData) {
    await helper.getAdapter().delete(collection, data.id);
  }
  const deleteEnd = performance.now();
  const deleteTime = deleteEnd - deleteStart;

  return {
    avgCreateTime: createTime / operations,
    avgDeleteTime: deleteTime / operations,
    avgReadTime: readTime / operations,
    createTime,
    deleteTime,
    operations,
    readTime,
  };
};

// Error testing utilities
export const testDatabaseErrors = async <T extends DatabaseAdapter>(
  helper: DatabaseTestHelper<T>,
  collection: string,
) => {
  // Test finding non-existent record
  const notFound = await helper.getAdapter().findUnique(collection, { id: 'non-existent' });
  expect(notFound).toBeNull();

  // Test deleting non-existent record
  const notDeleted = await helper.getAdapter().delete(collection, 'non-existent');
  expect(notDeleted).toBeNull();

  // Test updating non-existent record
  const notUpdated = await helper.getAdapter().update(collection, 'non-existent', { name: 'test' });
  expect(notUpdated).toBeTruthy(); // Most databases create if not exists
};

// Mock setup utilities
export const setupDatabaseMocks = () => {
  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
};

export const cleanupDatabaseMocks = () => {
  vi.restoreAllMocks();
};
