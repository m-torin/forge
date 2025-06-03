import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  mockUpstashVectorClient,
  mockUpstashVectorAdapter,
  resetMockVectorStorage,
  seedMockVectorData,
  VectorDatabaseTestHelper,
  testDatabaseOperations,
  testDatabaseErrors,
  createTestVector,
  createTestVectors,
} from '@repo/testing/database';

// Mock the Upstash Vector module
vi.mock('@upstash/vector', async () => {
  const { mockUpstashVector } = await import('@repo/testing/database');
  return mockUpstashVector;
});

describe('Upstash Vector Adapter', () => {
  let helper: VectorDatabaseTestHelper;

  beforeEach(async () => {
    resetMockVectorStorage();
    helper = new VectorDatabaseTestHelper(mockUpstashVectorAdapter as any);
    await helper.setup();
  });

  afterEach(async () => {
    resetMockVectorStorage();
    await helper.cleanup();
  });

  describe('Basic CRUD Operations', () => {
    it('should perform complete CRUD operations', async () => {
      const vector = createTestVector();

      // Create
      const created = await mockUpstashVectorAdapter.create('documents', vector);
      expect(created).toMatchObject(vector);

      // Read
      const found = await mockUpstashVectorAdapter.findUnique('documents', { id: vector.id });
      expect(found).toMatchObject(vector);

      // Update
      const updateData = { metadata: { ...vector.metadata, updated: true } };
      const updated = await mockUpstashVectorAdapter.update('documents', vector.id, updateData);
      expect((updated as any).metadata.updated).toBe(true);

      // Delete
      const deleted = await mockUpstashVectorAdapter.delete('documents', vector.id);
      expect(deleted).toMatchObject(updated as any);

      // Verify deletion
      const notFound = await mockUpstashVectorAdapter.findUnique('documents', { id: vector.id });
      expect(notFound).toBeNull();
    });

    it('should create a vector with metadata', async () => {
      const vector = createTestVector({
        metadata: {
          title: 'Test Document',
          category: 'technology',
          timestamp: Date.now(),
        },
      });

      const result = await mockUpstashVectorAdapter.create('documents', vector);
      expect(result).toMatchObject(vector);
      expect((result as any).metadata.title).toBe('Test Document');
    });

    it('should upsert multiple vectors', async () => {
      const vectors = createTestVectors(3);
      const result = await mockUpstashVectorAdapter.upsertMany(vectors, 'documents');

      expect(result.upserted).toBe(3);

      // Verify all vectors were stored
      for (const vector of vectors) {
        const found = await mockUpstashVectorAdapter.findUnique('documents', { id: vector.id });
        expect(found).toMatchObject(vector);
      }
    });

    it('should count vectors in collection', async () => {
      const vectors = createTestVectors(5);
      await mockUpstashVectorAdapter.upsertMany(vectors, 'documents');

      const count = await mockUpstashVectorAdapter.count('documents');
      expect(count).toBe(5);
    });
  });

  describe('Vector Search Operations', () => {
    beforeEach(async () => {
      // Seed test vectors
      const vectors = [
        createTestVector({
          id: 'tech-1',
          metadata: { category: 'technology', title: 'JavaScript Guide' },
        }),
        createTestVector({
          id: 'tech-2',
          metadata: { category: 'technology', title: 'Python Tutorial' },
        }),
        createTestVector({
          id: 'science-1',
          metadata: { category: 'science', title: 'Physics Basics' },
        }),
      ];

      await helper.seedVectorData('documents', vectors);
    });

    it('should perform similarity search', async () => {
      const queryVector = Array.from({ length: 1536 }, () => Math.random() - 0.5);

      const results = await mockUpstashVectorAdapter.query(
        {
          vector: queryVector,
          topK: 3,
          includeMetadata: true,
        },
        { namespace: 'documents' },
      );

      expect(results).toHaveLength(3);
      results.forEach((result: any) => {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('metadata');
        expect(result.score).toBeGreaterThan(0);
        expect(result.score).toBeLessThanOrEqual(1);
      });
    });

    it('should perform similarity search with helper assertions', async () => {
      const queryVector = Array.from({ length: 1536 }, () => Math.random() - 0.5);

      await helper.assertSimilaritySearch(
        'documents',
        queryVector,
        ['tech-1', 'tech-2', 'science-1'],
        0.7,
      );
    });

    it('should limit search results with topK', async () => {
      const queryVector = Array.from({ length: 1536 }, () => Math.random() - 0.5);

      const results = await mockUpstashVectorAdapter.query(
        {
          vector: queryVector,
          topK: 2,
          includeMetadata: true,
        },
        { namespace: 'documents' },
      );

      expect(results).toHaveLength(2);
    });

    it('should handle empty search results', async () => {
      const queryVector = Array.from({ length: 1536 }, () => Math.random() - 0.5);

      const results = await mockUpstashVectorAdapter.query(
        {
          vector: queryVector,
          topK: 5,
        },
        { namespace: 'empty-collection' },
      );

      expect(results).toHaveLength(0);
    });
  });

  describe('Text-Based Operations', () => {
    it('should upsert text data', async () => {
      const textData = [
        {
          id: 'article-1',
          data: 'This is an article about JavaScript programming',
          metadata: { type: 'article', language: 'en' },
        },
        {
          id: 'article-2',
          data: 'This is a tutorial about Python development',
          metadata: { type: 'tutorial', language: 'en' },
        },
      ];

      const result = await mockUpstashVectorAdapter.upsertText(textData, { namespace: 'articles' });
      expect(result.upserted).toBe(2);
    });

    it('should perform text-based search', async () => {
      const textData = [
        {
          id: 'article-1',
          data: 'Learn JavaScript programming fundamentals',
          metadata: { type: 'article' },
        },
        {
          id: 'article-2',
          data: 'Python for beginners tutorial',
          metadata: { type: 'tutorial' },
        },
      ];

      await mockUpstashVectorAdapter.upsertText(textData, { namespace: 'articles' });

      const results = await mockUpstashVectorAdapter.queryByText('JavaScript', {
        topK: 5,
        namespace: 'articles',
        includeMetadata: true,
      });

      expect(results.length).toBeGreaterThan(0);

      // The JavaScript article should have a higher score
      const jsArticle = results.find((r: any) => r.id === 'article-1');
      expect(jsArticle).toBeDefined();
    });

    it('should assert text search with helper', async () => {
      const textData = [
        {
          id: 'doc-1',
          data: 'Machine learning with TensorFlow',
          metadata: { category: 'ai' },
        },
      ];

      await mockUpstashVectorAdapter.upsertText(textData, { namespace: 'docs' });
      await helper.assertTextSearch('docs', 'machine learning', 1);
    });
  });

  describe('Vector Type Operations', () => {
    it('should handle dense vectors', async () => {
      const denseVectors = [
        {
          id: 'dense-1',
          vector: Array.from({ length: 1536 }, () => Math.random()),
          metadata: { type: 'dense' },
        },
      ];

      const result = await mockUpstashVectorAdapter.upsertDense(denseVectors, {
        namespace: 'vectors',
      });

      expect(result.upserted).toBe(1);
    });

    it('should handle sparse vectors', async () => {
      const sparseVectors = [
        {
          id: 'sparse-1',
          sparseVector: {
            indices: [0, 10, 100],
            values: [0.5, 0.8, 0.3],
          },
          metadata: { type: 'sparse' },
        },
      ];

      const result = await mockUpstashVectorAdapter.upsertSparse(sparseVectors, {
        namespace: 'vectors',
      });

      expect(result.upserted).toBe(1);
    });

    it('should handle hybrid vectors', async () => {
      const hybridVectors = [
        {
          id: 'hybrid-1',
          vector: Array.from({ length: 1536 }, () => Math.random()),
          sparseVector: {
            indices: [0, 50, 100],
            values: [0.7, 0.9, 0.4],
          },
          metadata: { type: 'hybrid' },
        },
      ];

      const result = await mockUpstashVectorAdapter.upsertHybrid(hybridVectors, {
        namespace: 'vectors',
      });

      expect(result.upserted).toBe(1);
    });

    it('should query with sparse vectors', async () => {
      // First upsert some sparse vectors
      await mockUpstashVectorAdapter.upsertSparse(
        [
          {
            id: 'sparse-1',
            sparseVector: { indices: [0, 10], values: [0.5, 0.8] },
            metadata: { type: 'sparse' },
          },
        ],
        { namespace: 'sparse-vectors' },
      );

      const results = await mockUpstashVectorAdapter.querySparse(
        { indices: [0, 10], values: [0.6, 0.7] },
        {
          topK: 5,
          namespace: 'sparse-vectors',
          includeMetadata: true,
        },
      );

      expect(results.length).toBeGreaterThan(0);
    });

    it('should query with hybrid vectors', async () => {
      // First upsert some hybrid vectors
      await mockUpstashVectorAdapter.upsertHybrid(
        [
          {
            id: 'hybrid-1',
            vector: Array.from({ length: 1536 }, () => Math.random()),
            sparseVector: { indices: [0, 10], values: [0.5, 0.8] },
            metadata: { type: 'hybrid' },
          },
        ],
        { namespace: 'hybrid-vectors' },
      );

      const results = await mockUpstashVectorAdapter.queryHybrid(
        Array.from({ length: 1536 }, () => Math.random()),
        { indices: [0, 10], values: [0.6, 0.7] },
        {
          topK: 5,
          namespace: 'hybrid-vectors',
          includeMetadata: true,
        },
      );

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Batch Operations', () => {
    it('should fetch multiple vectors by IDs', async () => {
      const vectors = createTestVectors(3);
      await mockUpstashVectorAdapter.upsertMany(vectors, 'documents');

      const ids = vectors.map((v) => v.id);
      const results = await mockUpstashVectorAdapter.fetch(ids, {
        namespace: 'documents',
        includeMetadata: true,
      });

      expect(results).toHaveLength(3);
      results.forEach((result: any) => {
        expect(ids).toContain(result.id);
      });
    });

    it('should delete multiple vectors', async () => {
      const vectors = createTestVectors(3);
      await mockUpstashVectorAdapter.upsertMany(vectors, 'documents');

      const ids = vectors.map((v) => v.id);
      const result = await mockUpstashVectorAdapter.deleteMany(ids, 'documents');

      expect(result.deleted).toBe(3);

      // Verify vectors are deleted
      for (const id of ids) {
        const found = await mockUpstashVectorAdapter.findUnique('documents', { id });
        expect(found).toBeNull();
      }
    });
  });

  describe('Index Management', () => {
    it('should get index information', async () => {
      // Add some vectors first
      const vectors = createTestVectors(5);
      await mockUpstashVectorAdapter.upsertMany(vectors, 'documents');

      const info = await mockUpstashVectorAdapter.getInfo();

      expect(info).toHaveProperty('vectorCount');
      expect(info).toHaveProperty('dimension');
      expect(info).toHaveProperty('similarityFunction');
      expect(info.vectorCount).toBeGreaterThan(0);
      expect(info.dimension).toBe(1536);
    });

    it('should reset index', async () => {
      // Add some vectors first
      const vectors = createTestVectors(3);
      await mockUpstashVectorAdapter.upsertMany(vectors, 'documents');

      const result = await mockUpstashVectorAdapter.reset();
      expect(result.message).toContain('reset');

      // Verify vectors are gone
      const count = await mockUpstashVectorAdapter.count('documents');
      expect(count).toBe(0);
    });
  });

  describe('Namespace Operations', () => {
    it('should work with different namespaces', async () => {
      const vector1 = createTestVector({ id: 'doc-1' });
      const vector2 = createTestVector({ id: 'doc-2' });

      // Store in different namespaces
      await mockUpstashVectorAdapter.create('documents', vector1);
      await mockUpstashVectorAdapter.create('articles', vector2);

      // Verify they're in separate namespaces
      const docs = await mockUpstashVectorAdapter.findMany('documents', {
        vector: vector1.vector,
        topK: 10,
      });
      const articles = await mockUpstashVectorAdapter.findMany('articles', {
        vector: vector2.vector,
        topK: 10,
      });

      expect(docs.some((d: any) => d.id === 'doc-1')).toBe(true);
      expect(docs.some((d: any) => d.id === 'doc-2')).toBe(false);

      expect(articles.some((a: any) => a.id === 'doc-2')).toBe(true);
      expect(articles.some((a: any) => a.id === 'doc-1')).toBe(false);
    });

    it('should get namespace info', async () => {
      const vectors = createTestVectors(3);
      await mockUpstashVectorAdapter.upsertMany(vectors, 'documents');

      const info = await mockUpstashVectorAdapter.getNamespaceInfo('documents');
      expect(info).toHaveProperty('namespace');
      expect(info.namespace).toBe('documents');
    });
  });

  describe('Error Handling', () => {
    it('should handle common error scenarios', async () => {
      // Test with non-vector query (should throw)
      await expect(mockUpstashVectorAdapter.findMany('documents', {})).rejects.toThrow(
        'Vector query requires a vector',
      );
    });

    it('should handle non-existent vectors', async () => {
      const found = await mockUpstashVectorAdapter.findUnique('documents', {
        id: 'non-existent',
      });
      expect(found).toBeNull();
    });

    it('should handle empty collections', async () => {
      const count = await mockUpstashVectorAdapter.count('empty-collection');
      expect(count).toBe(0);
    });
  });

  describe('Raw Operations', () => {
    it('should execute raw upsert operation', async () => {
      const vector = createTestVector();
      const result = await mockUpstashVectorAdapter.raw('upsert', vector);
      expect(result.upserted).toBe(1);
    });

    it('should execute raw query operation', async () => {
      const vectors = createTestVectors(2);
      await mockUpstashVectorAdapter.upsertMany(vectors, 'documents');

      const result = await mockUpstashVectorAdapter.raw('query', {
        vector: vectors[0].vector,
        topK: 5,
        includeMetadata: true,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw error for unsupported raw operation', async () => {
      await expect(mockUpstashVectorAdapter.raw('unsupported', {})).rejects.toThrow(
        'not supported',
      );
    });
  });

  describe('Adapter Interface Compliance', () => {
    it('should implement all required VectorDatabaseAdapter methods', () => {
      const adapter = mockUpstashVectorAdapter;

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

      // Vector-specific methods
      expect(typeof adapter.query).toBe('function');
      expect(typeof adapter.fetch).toBe('function');
      expect(typeof adapter.upsertMany).toBe('function');
      expect(typeof adapter.deleteMany).toBe('function');
      expect(typeof adapter.getInfo).toBe('function');
      expect(typeof adapter.reset).toBe('function');
    });

    it('should initialize and disconnect without errors', async () => {
      await expect(mockUpstashVectorAdapter.initialize()).resolves.not.toThrow();
      await expect(mockUpstashVectorAdapter.disconnect()).resolves.not.toThrow();
    });

    it('should return the client instance', () => {
      const client = mockUpstashVectorAdapter.getClient();
      expect(client).toBeDefined();
      expect(typeof client.upsert).toBe('function');
    });
  });
});

// Integration test with the actual Upstash Vector adapter class
describe('UpstashVectorAdapter Integration', () => {
  it('should be importable and instantiable', async () => {
    const { UpstashVectorAdapter } = await import('../upstash/adapter');
    expect(UpstashVectorAdapter).toBeDefined();
    expect(typeof UpstashVectorAdapter).toBe('function');
  });
});
