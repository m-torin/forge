import { vi } from 'vitest';

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
// import type { DatabaseAdapter, VectorDatabaseAdapter, RedisDatabaseAdapter } from '@repo/db-prisma/types';

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

  async getCount(collection: string): Promise<number> {
    return await this.adapter.count(collection);
  }

  async findItem(collection: string, id: string): Promise<any | null> {
    return await this.adapter.findUnique(collection, { id });
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

  async performSimilaritySearch(
    collection: string,
    queryVector: number[],
    topK: number,
  ): Promise<any[]> {
    return await this.adapter.query(
      {
        includeMetadata: true,
        topK,
        vector: queryVector,
      },
      { namespace: collection },
    );
  }

  async performTextSearch(collection: string, query: string, topK: number): Promise<any[]> {
    return await this.adapter.queryByText(query, {
      namespace: collection,
      topK,
    });
  }
}

// Redis database specific test helper
export class RedisDatabaseTestHelper extends DatabaseTestHelper<RedisDatabaseAdapter> {
  async checkKeyExists(key: string): Promise<boolean> {
    const collection = key.split(':')[0];
    const id = key.split(':')[1];
    return await this.adapter.exists(collection, id);
  }

  async getTTL(key: string): Promise<number> {
    const collection = key.split(':')[0];
    const id = key.split(':')[1];
    return await this.adapter.ttl(collection, id);
  }

  async getListLength(collection: string, id: string): Promise<number> {
    return await this.adapter.listLength(collection, id);
  }

  async checkSetMember<T>(collection: string, id: string, member: T): Promise<boolean> {
    return await this.adapter.setIsMember(collection, id, member);
  }

  async getHashField<T>(collection: string, id: string, field: string): Promise<T | null> {
    return await this.adapter.hashGet(collection, id, field);
  }

  async getSortedSetScore<T>(collection: string, id: string, member: T): Promise<number | null> {
    return await this.adapter.sortedSetScore(collection, id, member);
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

// Database operation testing utilities - now return values instead of calling expect
export const testDatabaseOperations = async <T extends DatabaseAdapter>(
  helper: DatabaseTestHelper<T>,
  collection: string,
) => {
  const testData = createTestUser();

  // Test create
  const created = await helper.getAdapter().create(collection, testData);
  const { id: createdId, ...createdWithoutId } = created as any;
  const { ...testDataWithoutId } = testData;

  // Use the created ID for subsequent operations

  // Test findUnique
  const found = await helper.getAdapter().findUnique(collection, { id: createdId });
  const { ...foundWithoutId } = found as any;

  // Test update
  const updateData = { name: 'Updated Name' };
  const updated = await helper.getAdapter().update(collection, createdId, updateData);

  // Test findMany
  const many = await helper.getAdapter().findMany(collection);
  const { ...manyWithoutId } = many[0] as any;

  // Test count
  const count = await helper.getCount(collection);

  // Test delete
  const deleted = await helper.getAdapter().delete(collection, createdId);
  const { ...deletedWithoutId } = deleted as any;

  // Verify deletion
  const notFound = await helper.findItem(collection, createdId);
  const finalCount = await helper.getCount(collection);

  return {
    created,
    createdWithoutId,
    testDataWithoutId,
    createdId,
    found,
    foundWithoutId,
    updateData,
    updated,
    many,
    manyWithoutId,
    count,
    deleted,
    deletedWithoutId,
    notFound,
    finalCount,
  };
};

// Performance testing utilities - now return values instead of calling expect
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
  const results = await helper.getAdapter().findMany(collection);
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
    results,
  };
};

// Error testing utilities - now return values instead of calling expect
export const testDatabaseErrors = async <T extends DatabaseAdapter>(
  helper: DatabaseTestHelper<T>,
  collection: string,
) => {
  // Test finding non-existent record
  const notFound = await helper.getAdapter().findUnique(collection, { id: 'non-existent' });

  // Test deleting non-existent record
  const notDeleted = await helper.getAdapter().delete(collection, 'non-existent');

  // Test updating non-existent record
  const notUpdated = await helper.getAdapter().update(collection, 'non-existent', { name: 'test' });

  return {
    notFound,
    notDeleted,
    notUpdated,
  };
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
