import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Test imports for new four-file pattern
import { VectorOperations } from '#/upstash/server';
import type { Index } from '@upstash/vector';

// Mock the Upstash Vector module
vi.mock('@upstash/vector', () => ({
  Index: vi.fn(() => mockVectorClient),
}));

// Mock Vector client
const mockVectorClient = {
  upsert: vi.fn(() => Promise.resolve('upsert-success')),
  query: vi.fn(() =>
    Promise.resolve({
      matches: [
        { id: 'vec1', score: 0.95, metadata: { type: 'test' }, data: 'test data' },
        { id: 'vec2', score: 0.87, metadata: { type: 'example' }, data: 'example data' },
      ],
    }),
  ),
  fetch: vi.fn(() =>
    Promise.resolve({
      vectors: {
        vec1: {
          vector: [0.1, 0.2, 0.3],
          metadata: { type: 'test' },
          data: 'test data',
        },
      },
    }),
  ),
  delete: vi.fn(() => Promise.resolve({ deleted: 1 })),
  info: vi.fn(() =>
    Promise.resolve({
      vectorCount: 100,
      dimension: 384,
      indexFullness: 0.25,
    }),
  ),
  listNamespaces: vi.fn(() => Promise.resolve(['default', 'test'])),
  reset: vi.fn(() => Promise.resolve('reset-success')),
} as unknown as Index;

describe('Upstash Vector Four-File Pattern', () => {
  let vectorOps: VectorOperations;

  beforeEach(() => {
    vi.clearAllMocks();
    vectorOps = new VectorOperations(mockVectorClient);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Basic Vector Operations', () => {
    it('should upsert vectors', async () => {
      const vectors = [
        { id: 'vec1', vector: [0.1, 0.2, 0.3], metadata: { type: 'test' } },
        { id: 'vec2', vector: [0.4, 0.5, 0.6], metadata: { type: 'example' } },
      ];

      const result = await vectorOps.upsert(vectors, 'test-namespace');
      expect(mockVectorClient.upsert).toHaveBeenCalledWith(vectors, {
        namespace: 'test-namespace',
      });
      expect(result).toBe('upsert-success');
    });

    it('should query vectors by vector similarity', async () => {
      const queryOptions = {
        vector: [0.1, 0.2, 0.3],
        topK: 5,
        includeMetadata: true,
      };

      const result = await vectorOps.query(queryOptions);
      expect(mockVectorClient.query).toHaveBeenCalledWith({
        ...queryOptions,
        topK: 5,
      });
      expect(result).toHaveLength(2);
    });

    it('should query vectors by text', async () => {
      const result = await vectorOps.queryByText('test query', {
        topK: 3,
        includeMetadata: true,
      });

      expect(mockVectorClient.query).toHaveBeenCalledWith({
        data: 'test query',
        topK: 3,
        includeMetadata: true,
      });
      expect(result).toHaveLength(2);
    });

    it('should fetch vectors by IDs', async () => {
      const result = await vectorOps.fetch(['vec1', 'vec2'], {
        includeMetadata: true,
        includeVectors: true,
      });

      expect(mockVectorClient.fetch).toHaveBeenCalledWith(['vec1', 'vec2'], {
        includeMetadata: true,
        includeVectors: true,
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 'vec1');
    });

    it('should fetch single vector by ID', async () => {
      const result = await vectorOps.fetch('vec1', {
        includeMetadata: true,
      });

      expect(mockVectorClient.fetch).toHaveBeenCalledWith(['vec1'], {
        includeMetadata: true,
      });
    });

    it('should delete vectors by IDs', async () => {
      const result = await vectorOps.delete(['vec1', 'vec2'], {
        namespace: 'test-namespace',
      });

      expect(mockVectorClient.delete).toHaveBeenCalledWith(['vec1', 'vec2'], {
        namespace: 'test-namespace',
      });
    });

    it('should delete single vector by ID', async () => {
      const result = await vectorOps.delete('vec1');
      expect(mockVectorClient.delete).toHaveBeenCalledWith(['vec1'], undefined);
    });

    it('should update vector metadata', async () => {
      const result = await vectorOps.update('vec1', {
        metadata: { updated: true },
        namespace: 'test-namespace',
      });

      expect(mockVectorClient.upsert).toHaveBeenCalledWith(
        [
          {
            id: 'vec1',
            metadata: { updated: true },
            namespace: 'test-namespace',
          },
        ],
        { namespace: 'test-namespace' },
      );
    });
  });

  describe('Index Information', () => {
    it('should get index information', async () => {
      const result = await vectorOps.info();
      expect(mockVectorClient.info).toHaveBeenCalled();
      expect(result).toHaveProperty('vectorCount');
      expect(result).toHaveProperty('dimension');
    });

    it('should list namespaces', async () => {
      const result = await vectorOps.listNamespaces();
      expect(mockVectorClient.listNamespaces).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should reset index', async () => {
      const result = await vectorOps.reset();
      expect(mockVectorClient.reset).toHaveBeenCalled();
      expect(result).toBe('reset-success');
    });
  });

  describe('Bulk Operations', () => {
    it('should perform bulk upsert', async () => {
      const vectors = [
        { id: 'bulk1', vector: [0.1, 0.2] },
        { id: 'bulk2', vector: [0.3, 0.4] },
        { id: 'bulk3', vector: [0.5, 0.6] },
      ];

      const result = await vectorOps.bulkUpsert(vectors, {
        namespace: 'bulk-test',
        batchSize: 2,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(mockVectorClient.upsert).toHaveBeenCalledTimes(2); // 3 vectors, batch size 2
    });

    it('should perform bulk delete', async () => {
      const ids = ['bulk1', 'bulk2', 'bulk3'];

      const result = await vectorOps.bulkDelete(ids, {
        namespace: 'bulk-test',
        batchSize: 2,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(mockVectorClient.delete).toHaveBeenCalledTimes(2); // 3 IDs, batch size 2
    });
  });

  describe('Advanced Search', () => {
    it('should search with pagination', async () => {
      const query = {
        vector: [0.1, 0.2, 0.3],
        namespace: 'test',
      };

      const result = await vectorOps.searchWithPagination(query, {
        pageSize: 10,
        maxResults: 25,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(mockVectorClient.query).toHaveBeenCalled();
    });

    it('should find similar vectors', async () => {
      const result = await vectorOps.findSimilar('vec1', {
        topK: 5,
        threshold: 0.8,
        namespace: 'test',
      });

      expect(mockVectorClient.fetch).toHaveBeenCalledWith(['vec1'], {
        includeVectors: true,
        namespace: 'test',
      });
      expect(mockVectorClient.query).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Client Access', () => {
    it('should provide access to raw client', () => {
      const client = vectorOps.getClient();
      expect(client).toBe(mockVectorClient);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing reference vector in findSimilar', async () => {
      mockVectorClient.fetch = vi.fn(() =>
        Promise.resolve({
          vectors: {},
        }),
      ) as any;

      await expect(vectorOps.findSimilar('nonexistent')).rejects.toThrow(
        'Reference vector nonexistent not found',
      );
    });

    it('should handle empty query results', async () => {
      mockVectorClient.query = vi.fn(() =>
        Promise.resolve({
          matches: null,
        }),
      ) as any;

      const result = await vectorOps.query({ vector: [0.1, 0.2] });
      expect(result).toHaveLength(0);
    });
  });
});
