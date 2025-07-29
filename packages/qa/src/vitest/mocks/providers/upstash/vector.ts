import { vi } from 'vitest';

// Define types locally to avoid circular dependency
interface MockVector {
  data?: string;
  id: string;
  metadata?: Record<string, any>;
  sparseVector?: {
    indices: number[];
    values: number[];
  };
  vector?: number[];
}

interface MockVectorScore extends MockVector {
  score: number;
}

interface MockUpsertResult {
  upserted: number;
}

interface MockDeleteResult {
  deleted: number;
}

interface MockInfoResult {
  dimension: number;
  indexSize: number;
  pendingVectorCount: number;
  similarityFunction: string;
  vectorCount: number;
}

interface MockResetResult {
  message: string;
}

// In-memory storage for mock vector database
class MockVectorStorage {
  private vectors = new Map<string, MockVector>();
  private namespaces = new Map<string, Map<string, MockVector>>();

  getNamespace(namespace?: string): Map<string, MockVector> {
    if (!namespace) return this.vectors;

    if (!this.namespaces.has(namespace)) {
      this.namespaces.set(namespace, new Map());
    }
    return this.namespaces.get(namespace)!;
  }

  upsert(data: MockVector | MockVector[], namespace?: string): MockUpsertResult {
    const vectors = Array.isArray(data) ? data : [data];
    const storage = this.getNamespace(namespace);

    vectors.forEach(vector => {
      storage.set(vector.id, { ...vector });
    });

    return { upserted: vectors.length };
  }

  query(
    queryVector: number[] | string,
    options: {
      topK?: number;
      filter?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      includeData?: boolean;
    } = {},
    namespace?: string,
  ): MockVectorScore[] {
    const storage = this.getNamespace(namespace);
    const vectors = Array.from(storage.values());

    if (vectors.length === 0) return [];

    // Simple similarity calculation (cosine similarity approximation)
    const results = vectors
      .map(vector => {
        let score = 0.8 + Math.random() * 0.2; // Mock score between 0.8-1.0

        // If vector has text data and query is string, boost score
        if (typeof queryVector === 'string' && vector.data?.includes(queryVector)) {
          score = Math.min(score + 0.1, 1.0);
        }

        const result: MockVectorScore = {
          ...vector,
          score,
        };

        // Apply include options
        if (!options.includeVectors) {
          delete result.vector;
          delete result.sparseVector;
        }
        if (!options.includeMetadata) {
          delete result.metadata;
        }
        if (!options.includeData) {
          delete result.data;
        }

        return result;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, options.topK || 10);

    return results;
  }

  fetch(ids: string | string[], namespace?: string): MockVector[] {
    const storage = this.getNamespace(namespace);
    const idArray = Array.isArray(ids) ? ids : [ids];

    return idArray
      .map(id => storage.get(id))
      .filter((vector): vector is MockVector => vector !== undefined);
  }

  delete(ids: string | string[], namespace?: string): MockDeleteResult {
    const storage = this.getNamespace(namespace);
    const idArray = Array.isArray(ids) ? ids : [ids];

    let deleted = 0;
    idArray.forEach(id => {
      if (storage.delete(id)) {
        deleted++;
      }
    });

    return { deleted };
  }

  info(): MockInfoResult {
    const totalVectors =
      this.vectors.size +
      Array.from(this.namespaces.values()).reduce((sum, ns) => sum + ns.size, 0);

    return {
      dimension: 1536, // Mock OpenAI embedding dimension
      indexSize: totalVectors * 1024, // Mock size
      pendingVectorCount: 0,
      similarityFunction: 'cosine',
      vectorCount: totalVectors,
    };
  }

  reset(): MockResetResult {
    this.vectors.clear();
    this.namespaces.clear();
    return { message: 'Index reset successfully' };
  }

  clear(): void {
    this.vectors.clear();
    this.namespaces.clear();
  }
}

// Global mock storage instance
const mockStorage = new MockVectorStorage();

// Mock Vector client factory
export const createMockVector = (overrides?: Partial<MockVector>): MockVector => ({
  id: `vec_${Math.random().toString(36).substr(2, 9)}`,
  metadata: { category: 'test', timestamp: Date.now() },
  vector: Array.from({ length: 1536 }, () => Math.random() - 0.5),
  ...overrides,
});

// Mock Vector with score factory
export const createMockVectorScore = (overrides?: Partial<MockVectorScore>): MockVectorScore => ({
  ...createMockVector(),
  score: 0.9 + Math.random() * 0.1,
  ...overrides,
});

// Mock Upstash Vector Index class
export class MockUpstashVectorIndex {
  private storage = mockStorage;

  async upsert(
    data: MockVector | MockVector[],
    options?: { namespace?: string },
  ): Promise<MockUpsertResult> {
    return this.storage.upsert(data, options?.namespace);
  }

  async query(
    options: {
      vector?: number[];
      data?: string;
      sparseVector?: { indices: number[]; values: number[] };
      topK?: number;
      filter?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      includeData?: boolean;
    },
    queryOptions?: { namespace?: string },
  ): Promise<MockVectorScore[]> {
    const queryVector = options.vector || options.data || [0.1, 0.2, 0.3];
    return this.storage.query(queryVector, options, queryOptions?.namespace);
  }

  async fetch(
    ids: string | string[],
    options?: {
      namespace?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      includeData?: boolean;
    },
  ): Promise<MockVector[]> {
    return this.storage.fetch(ids, options?.namespace);
  }

  async delete(
    ids: string | string[],
    options?: { namespace?: string },
  ): Promise<MockDeleteResult> {
    return this.storage.delete(ids, options?.namespace);
  }

  async info(): Promise<MockInfoResult> {
    return this.storage.info();
  }

  async reset(): Promise<MockResetResult> {
    return this.storage.reset();
  }
}

// Mock Upstash Vector client
export const mockUpstashVectorClient = new MockUpstashVectorIndex();

// Mock Upstash Vector adapter
export const mockUpstashVectorAdapter = {
  client: mockUpstashVectorClient,

  async initialize(): Promise<void> {
    // Mock initialization
  },

  async disconnect(): Promise<void> {
    // Mock disconnection
  },

  getClient() {
    return mockUpstashVectorClient;
  },

  async create<T>(collection: string, data: MockVector): Promise<T> {
    await mockUpstashVectorClient.upsert(data, { namespace: collection });
    return data as T;
  },

  async update<T>(collection: string, id: string, data: Partial<MockVector>): Promise<T> {
    const updated = { id, ...data } as MockVector;
    await mockUpstashVectorClient.upsert(updated, { namespace: collection });
    return updated as T;
  },

  async delete<T>(collection: string, id: string): Promise<T> {
    const existing = await mockUpstashVectorClient.fetch(id, { namespace: collection });
    await mockUpstashVectorClient.delete(id, { namespace: collection });
    return existing[0] as T;
  },

  async findUnique<T>(collection: string, query: { id: string }): Promise<T | null> {
    const results = await mockUpstashVectorClient.fetch(query.id, { namespace: collection });
    return (results[0] as T) || null;
  },

  async findMany<T>(
    collection: string,
    query?: { vector?: number[]; topK?: number },
  ): Promise<T[]> {
    if (!query?.vector) {
      throw new Error('Vector query requires a vector for similarity search');
    }

    const results = await mockUpstashVectorClient.query(
      {
        includeMetadata: true,
        topK: query.topK || 10,
        vector: query.vector,
      },
      { namespace: collection },
    );

    return results as T[];
  },

  async count(_collection: string): Promise<number> {
    const info = await mockUpstashVectorClient.info();
    return info.vectorCount;
  },

  async raw<T = any>(operation: string, params: any): Promise<T> {
    const client = mockUpstashVectorClient as any;
    if (typeof client[operation] === 'function') {
      return await client[operation](params);
    }
    throw new Error(`Operation '${operation}' not supported on mock Upstash Vector client`);
  },

  // Vector-specific methods
  async query<T = MockVectorScore>(
    options: {
      vector?: number[];
      data?: string;
      topK?: number;
      filter?: string;
      includeMetadata?: boolean;
    },
    queryOptions?: { namespace?: string },
  ): Promise<T[]> {
    const results = await mockUpstashVectorClient.query(options, queryOptions);
    return results as T[];
  },

  async fetch<T = MockVector>(
    ids: string | string[],
    options?: { namespace?: string; includeMetadata?: boolean },
  ): Promise<T[]> {
    const results = await mockUpstashVectorClient.fetch(ids, options);
    return results as T[];
  },

  async upsertMany<T = MockUpsertResult>(vectors: MockVector[], namespace?: string): Promise<T> {
    const result = await mockUpstashVectorClient.upsert(vectors, { namespace });
    return result as T;
  },

  async deleteMany<T = MockDeleteResult>(ids: string[], namespace?: string): Promise<T> {
    const result = await mockUpstashVectorClient.delete(ids, { namespace });
    return result as T;
  },

  async getInfo(): Promise<MockInfoResult> {
    return await mockUpstashVectorClient.info();
  },

  async reset(): Promise<MockResetResult> {
    return await mockUpstashVectorClient.reset();
  },

  // Text-based methods
  async queryByText<T = MockVectorScore>(
    text: string,
    options?: { topK?: number; namespace?: string },
  ): Promise<T[]> {
    const results = await mockUpstashVectorClient.query(
      {
        data: text,
        includeMetadata: true,
        topK: options?.topK,
      },
      { namespace: options?.namespace },
    );
    return results as T[];
  },

  async upsertText<T = MockUpsertResult>(
    data: { id: string; data: string; metadata?: Record<string, any> }[],
    options?: { namespace?: string },
  ): Promise<T> {
    const vectors = data.map(item => ({ ...item, vector: undefined }));
    const result = await mockUpstashVectorClient.upsert(vectors, options);
    return result as T;
  },
};

// Vitest mocks
export const mockUpstashVector = {
  Index: vi.fn().mockImplementation(() => mockUpstashVectorClient),
};

// Helper to reset mock state
export const resetMockVectorStorage = (): void => {
  mockStorage.clear();
};

// Helper to seed mock data
export const seedMockVectorData = (vectors: MockVector[], namespace?: string): void => {
  mockStorage.upsert(vectors, namespace);
};

// Helper to get current mock state
export const getMockVectorState = (namespace?: string): MockVector[] => {
  const storage = mockStorage.getNamespace(namespace);
  return Array.from(storage.values());
};

// Mock environment setup
export const setupMockVectorEnvironment = (): void => {
  // Mock environment variables
  process.env.UPSTASH_VECTOR_REST_URL = 'https://mock-vector.upstash.io';
  process.env.UPSTASH_VECTOR_REST_TOKEN = 'mock-token';
};

// Clean up mock environment
export const cleanupMockVectorEnvironment = (): void => {
  delete process.env.UPSTASH_VECTOR_REST_URL;
  delete process.env.UPSTASH_VECTOR_REST_TOKEN;
  resetMockVectorStorage();
};
