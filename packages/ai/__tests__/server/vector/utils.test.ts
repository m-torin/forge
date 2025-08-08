// Assign mockEmbeddingManager to globalThis to avoid hoisting issues
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { VectorDB } from '../../../src/server/utils/vector/types';

(globalThis as any).mockEmbeddingManager = {
  embed: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
  embedBatch: vi.fn().mockResolvedValue([
    [0.1, 0.2, 0.3],
    [0.4, 0.5, 0.6],
  ]),
};

vi.mock('../../../server/embedding/utils', () => ({
  createEmbeddingManager: vi.fn(() => (globalThis as any).mockEmbeddingManager),
}));

describe('vectorUtils', () => {
  let VectorUtils: any;
  let vectorUtils: any;
  let mockDB: VectorDB;

  beforeEach(async () => {
    vi.clearAllMocks();
    (globalThis as any).mockEmbeddingManager.embed.mockClear();
    (globalThis as any).mockEmbeddingManager.embedBatch.mockClear();
    const mod = await import('../../../src/server/utils/vector/utils');
    VectorUtils = mod.VectorUtils;
    mockDB = {
      upsert: vi.fn().mockResolvedValue(undefined),
      query: vi.fn().mockResolvedValue([
        { id: '1', score: 0.9, metadata: { content: 'test content 1' } },
        { id: '2', score: 0.8, metadata: { content: 'test content 2' } },
      ]),
      delete: vi.fn().mockResolvedValue(undefined),
      fetch: vi.fn().mockResolvedValue([]),
      describe: vi.fn().mockResolvedValue({
        dimension: 384,
        totalVectorCount: 100,
      }),
      range: vi.fn().mockResolvedValue({
        nextCursor: 'cursor',
        vectors: [],
      }),
      reset: vi.fn().mockResolvedValue(true),
      info: vi.fn().mockResolvedValue({ status: 'ready' }),
    } as VectorDB;
    vectorUtils = new VectorUtils(mockDB, 'test-model');
    // Ensure the embedder is the mock
    vectorUtils.embedder = (globalThis as any).mockEmbeddingManager;
  });

  describe('storeTexts', () => {
    test('should store texts with generated embeddings', async () => {
      const texts = [
        { id: '1', content: 'First document', metadata: { type: 'article' } },
        { id: '2', content: 'Second document' },
      ];
      (globalThis as any).mockEmbeddingManager.embedBatch.mockImplementationOnce(
        (contents: string[]) =>
          Promise.resolve(contents.map((_: string, i: number) => [i + 0.1, i + 0.2, i + 0.3])),
      );
      await vectorUtils.storeTexts(texts);
      expect(mockDB.upsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            values: [0.1, 0.2, 0.3],
            metadata: expect.objectContaining({
              content: 'First document',
              type: 'article',
            }),
          }),
          expect.objectContaining({
            id: '2',
            values: [1.1, 1.2, 1.3],
            metadata: expect.objectContaining({
              content: 'Second document',
            }),
          }),
        ]),
      );
    });

    test('should handle empty texts array', async () => {
      await vectorUtils.storeTexts([]);
      expect(mockDB.upsert).toHaveBeenCalledWith([]);
    });
  });

  describe('searchSimilar', () => {
    test('should search for similar texts', async () => {
      (globalThis as any).mockEmbeddingManager.embed.mockResolvedValueOnce([0.1, 0.2, 0.3]);
      const results = await vectorUtils.searchSimilar('test query');
      expect(mockDB.query).toHaveBeenCalledWith(
        [0.1, 0.2, 0.3],
        expect.objectContaining({
          topK: 5,
          includeMetadata: true,
        }),
      );
      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('1');
    });

    test('should include content when requested', async () => {
      (globalThis as any).mockEmbeddingManager.embed.mockResolvedValueOnce([0.1, 0.2, 0.3]);
      const results = await vectorUtils.searchSimilar('test query', {
        includeContent: true,
      });
      expect(results[0].content).toBe('test content 1');
      expect(results[1].content).toBe('test content 2');
    });

    test('should use custom topK and filter', async () => {
      (globalThis as any).mockEmbeddingManager.embed.mockResolvedValueOnce([0.1, 0.2, 0.3]);
      await vectorUtils.searchSimilar('test query', {
        topK: 10,
        filter: { type: 'article' },
      });
      expect(mockDB.query).toHaveBeenCalledWith(
        [0.1, 0.2, 0.3],
        expect.objectContaining({
          topK: 10,
          filter: { type: 'article' },
        }),
      );
    });
  });

  describe('updateTexts', () => {
    test('should update existing texts', async () => {
      const updates = [{ id: '1', content: 'Updated content', metadata: { version: 2 } }];
      (globalThis as any).mockEmbeddingManager.embedBatch.mockImplementationOnce((contents: any) =>
        Promise.resolve(contents.map((_: any, i: any) => [i + 0.1, i + 0.2, i + 0.3])),
      );
      await vectorUtils.updateTexts(updates);
      expect(mockDB.upsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            metadata: expect.objectContaining({
              content: 'Updated content',
              version: 2,
            }),
          }),
        ]),
      );
    });
  });

  describe('deleteTexts', () => {
    test('should delete texts by IDs', async () => {
      await vectorUtils.deleteTexts(['1', '2', '3']);
      expect(mockDB.delete).toHaveBeenCalledWith(['1', '2', '3']);
    });
  });

  describe('getStats', () => {
    test('should return database statistics', async () => {
      const stats = await vectorUtils.getStats();

      expect(stats).toStrictEqual({
        dimension: 384,
        totalDocuments: 100,
      });
    });

    test('should throw error when describe is not supported', async () => {
      (mockDB as any).describe = undefined;

      await expect(vectorUtils.getStats()).rejects.toThrow(
        'Vector database does not support describe operation',
      );
    });
  });

  describe('batchSearch', () => {
    test('should perform batch searches', async () => {
      const queries = ['query 1', 'query 2'];
      (globalThis as any).mockEmbeddingManager.embedBatch.mockImplementationOnce((contents: any) =>
        Promise.resolve(contents.map((_: any, i: any) => [i + 0.1, i + 0.2, i + 0.3])),
      );
      const results = await vectorUtils.batchSearch(queries);
      expect(results).toHaveLength(2);
      expect(mockDB.query).toHaveBeenCalledTimes(2);
    });

    test('should include content in batch search results', async () => {
      const queries = ['query 1', 'query 2'];
      (globalThis as any).mockEmbeddingManager.embedBatch.mockImplementationOnce((contents: any) =>
        Promise.resolve(contents.map((_: any, i: any) => [i + 0.1, i + 0.2, i + 0.3])),
      );
      const results = await vectorUtils.batchSearch(queries, {
        includeContent: true,
      });
      expect(results[0][0].content).toBe('test content 1');
      expect(results[1][0].content).toBe('test content 1');
    });
  });
});

describe('createVectorUtils', () => {
  test('should create VectorUtils instance', async () => {
    const mod = await import('../../../src/server/utils/vector/utils');
    const mockDB = {} as VectorDB;
    const utils = mod.createVectorUtils(mockDB, 'test-model');
    expect(utils).toBeInstanceOf(mod.VectorUtils);
  });
});

describe('vectorOps', () => {
  let vectorOps: any;
  beforeEach(async () => {
    const mod = await import('../../../src/server/utils/vector/utils');
    vectorOps = mod.vectorOps;
  });

  describe('cosineSimilarity', () => {
    test('should calculate cosine similarity correctly', () => {
      const a = [1, 0, 0];
      const b = [0, 1, 0];
      const similarity = vectorOps.cosineSimilarity(a, b);
      expect(similarity).toBeCloseTo(0, 5);
    });

    test('should calculate similarity for identical vectors', () => {
      const a = [1, 2, 3];
      const b = [1, 2, 3];
      const similarity = vectorOps.cosineSimilarity(a, b);
      expect(similarity).toBeCloseTo(1, 5);
    });

    test('should throw error for different dimensions', () => {
      const a = [1, 2, 3];
      const b = [1, 2];
      expect(() => vectorOps.cosineSimilarity(a, b)).toThrow(
        'Vectors must have the same dimension',
      );
    });
  });

  describe('normalize', () => {
    test('should normalize vector to unit length', () => {
      const vector = [3, 4];
      const normalized = vectorOps.normalize(vector);
      const magnitude = Math.sqrt(normalized[0] ** 2 + normalized[1] ** 2);
      expect(magnitude).toBeCloseTo(1, 5);
    });
  });

  describe('euclideanDistance', () => {
    test('should calculate Euclidean distance correctly', () => {
      const a = [0, 0];
      const b = [3, 4];
      const distance = vectorOps.euclideanDistance(a, b);
      expect(distance).toBe(5);
    });

    test('should throw error for different dimensions', () => {
      const a = [1, 2, 3];
      const b = [1, 2];
      expect(() => vectorOps.euclideanDistance(a, b)).toThrow(
        'Vectors must have the same dimension',
      );
    });
  });

  describe('centroid', () => {
    test('should calculate centroid of vectors', () => {
      const vectors = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      const centroid = vectorOps.centroid(vectors);
      expect(centroid).toStrictEqual([3, 4]);
    });

    test('should throw error for empty vector set', () => {
      expect(() => vectorOps.centroid([])).toThrow('Cannot calculate centroid of empty vector set');
    });

    test('should throw error for inconsistent dimensions', () => {
      const vectors = [
        [1, 2],
        [3, 4, 5],
      ];
      expect(() => vectorOps.centroid(vectors)).toThrow('All vectors must have the same dimension');
    });
  });
});
