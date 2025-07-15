// Assign mocks to globalThis to avoid hoisting issues
import type { EmbedOptions } from '@/shared/types';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Create mock functions
const mockEmbed = vi.fn();
const mockEmbedMany = vi.fn();
const mockCosineSimilarity = vi.fn();
const mockOpenaiEmbedding = vi.fn(() => 'mock-openai-model');

// Assign to globalThis
(globalThis as any).mockEmbed = mockEmbed;
(globalThis as any).mockEmbedMany = mockEmbedMany;
(globalThis as any).mockCosineSimilarity = mockCosineSimilarity;
(globalThis as any).mockOpenaiEmbedding = mockOpenaiEmbedding;

vi.mock('ai', () => ({
  embed: (globalThis as any).mockEmbed,
  embedMany: (globalThis as any).mockEmbedMany,
  cosineSimilarity: (globalThis as any).mockCosineSimilarity,
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: {
    embedding: (globalThis as any).mockOpenaiEmbedding,
  },
}));

describe('embeddingManager', () => {
  let EmbeddingManager: any;
  let manager: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/server/embedding/utils');
    EmbeddingManager = mod.EmbeddingManager;
    manager = new EmbeddingManager();
  });

  describe('constructor', () => {
    test('should create manager with default model', async () => {
      const mod = await import('@/server/embedding/utils');
      const EmbeddingManager = mod.EmbeddingManager;
      const manager = new EmbeddingManager();
      expect(manager).toBeInstanceOf(EmbeddingManager);
      expect((globalThis as any).mockOpenaiEmbedding).toHaveBeenCalledWith(
        'text-embedding-3-small',
      );
    });

    test('should create manager with custom model', async () => {
      const mod = await import('@/server/embedding/utils');
      const EmbeddingManager = mod.EmbeddingManager;
      new EmbeddingManager('text-embedding-3-large');
      expect((globalThis as any).mockOpenaiEmbedding).toHaveBeenCalledWith(
        'text-embedding-3-large',
      );
    });

    test('should use default model when no model specified', async () => {
      const mod = await import('@/server/embedding/utils');
      const EmbeddingManager = mod.EmbeddingManager;
      new EmbeddingManager();
      expect((globalThis as any).mockOpenaiEmbedding).toHaveBeenCalledWith(
        'text-embedding-3-small',
      );
    });
  });

  describe('embed', () => {
    test('should embed single text', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3, 0.4];
      (globalThis as any).mockEmbed.mockResolvedValueOnce({ embedding: mockEmbedding });
      const result = await manager.embed('test text');
      expect((globalThis as any).mockEmbed).toHaveBeenCalledWith({
        model: 'mock-openai-model',
        value: 'test text',
      });
      expect(result).toStrictEqual(mockEmbedding);
    });

    test('should use custom model when provided', async () => {
      const customModel = 'custom-embedding-model';
      const mockEmbedding = [0.5, 0.6, 0.7];
      (globalThis as any).mockEmbed.mockResolvedValueOnce({ embedding: mockEmbedding });
      const result = await manager.embed('test text', customModel);
      expect((globalThis as any).mockEmbed).toHaveBeenCalledWith({
        model: customModel,
        value: 'test text',
      });
      expect(result).toStrictEqual(mockEmbedding);
    });

    test('should handle embedding errors', async () => {
      (globalThis as any).mockEmbed.mockRejectedValueOnce(new Error('Embedding failed'));
      await expect(manager.embed('test text')).rejects.toThrow('Embedding failed');
    });

    test('should handle empty text', async () => {
      const mockEmbedding = [0, 0, 0];
      (globalThis as any).mockEmbed.mockResolvedValueOnce({ embedding: mockEmbedding });
      const result = await manager.embed('');
      expect(result).toStrictEqual(mockEmbedding);
    });
  });

  describe('embedBatch', () => {
    test('should embed multiple texts', async () => {
      const texts = ['text 1', 'text 2', 'text 3'];
      const mockEmbeddings = [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
        [0.7, 0.8, 0.9],
      ];
      (globalThis as any).mockEmbedMany.mockResolvedValueOnce({ embeddings: mockEmbeddings });
      const result = await manager.embedBatch(texts);
      expect((globalThis as any).mockEmbedMany).toHaveBeenCalledWith({
        model: 'mock-openai-model',
        values: texts,
      });
      expect(result).toStrictEqual(mockEmbeddings);
    });

    test('should handle empty batch', async () => {
      (globalThis as any).mockEmbedMany.mockResolvedValueOnce({ embeddings: [] });
      const result = await manager.embedBatch([]);
      expect(result).toStrictEqual([]);
    });

    test('should use custom model for batch embedding', async () => {
      const customModel = 'custom-batch-model';
      const texts = ['text 1', 'text 2'];
      const mockEmbeddings = [
        [0.1, 0.2],
        [0.3, 0.4],
      ];
      (globalThis as any).mockEmbedMany.mockResolvedValueOnce({ embeddings: mockEmbeddings });
      const result = await manager.embedBatch(texts, customModel);
      expect((globalThis as any).mockEmbedMany).toHaveBeenCalledWith({
        model: customModel,
        values: texts,
      });
      expect(result).toStrictEqual(mockEmbeddings);
    });

    test('should handle batch embedding errors', async () => {
      (globalThis as any).mockEmbedMany.mockRejectedValueOnce(new Error('Batch embedding failed'));
      await expect(manager.embedBatch(['text 1', 'text 2'])).rejects.toThrow(
        'Batch embedding failed',
      );
    });
  });

  describe('embedWithProvider', () => {
    test('should handle single input', async () => {
      const options: EmbedOptions = { input: 'single text' };
      const mockEmbeddings = [[0.1, 0.2, 0.3]];
      const mockUsage = { tokens: 10 };
      (globalThis as any).mockEmbedMany.mockResolvedValueOnce({
        embeddings: mockEmbeddings,
        usage: mockUsage,
      });
      const result = await manager.embedWithProvider(options);
      expect((globalThis as any).mockEmbedMany).toHaveBeenCalledWith({
        model: 'mock-openai-model',
        values: ['single text'],
      });
      expect(result).toStrictEqual({
        embeddings: mockEmbeddings,
        usage: {
          completionTokens: 0,
          promptTokens: 10,
          totalTokens: 10,
        },
      });
    });

    test('should handle array input', async () => {
      const options: EmbedOptions = { input: ['text 1', 'text 2'] };
      const mockEmbeddings = [
        [0.1, 0.2],
        [0.3, 0.4],
      ];
      (globalThis as any).mockEmbedMany.mockResolvedValueOnce({
        embeddings: mockEmbeddings,
        usage: { tokens: 20 },
      });
      const result = await manager.embedWithProvider(options);
      expect((globalThis as any).mockEmbedMany).toHaveBeenCalledWith({
        model: 'mock-openai-model',
        values: ['text 1', 'text 2'],
      });
      expect(result.embeddings).toStrictEqual(mockEmbeddings);
    });

    test('should handle missing usage data', async () => {
      const options: EmbedOptions = { input: 'test' };
      (globalThis as any).mockEmbedMany.mockResolvedValueOnce({
        embeddings: [[0.1, 0.2]],
        // No usage property
      });
      const result = await manager.embedWithProvider(options);
      expect(result.usage).toStrictEqual({
        completionTokens: 0,
        promptTokens: 0,
        totalTokens: 0,
      });
    });
  });

  describe('similarity', () => {
    test('should calculate cosine similarity', () => {
      const embedding1 = [1, 2, 3];
      const embedding2 = [4, 5, 6];
      const expectedSimilarity = 0.5;
      (globalThis as any).mockCosineSimilarity.mockReturnValueOnce(expectedSimilarity);
      const result = manager.similarity(embedding1, embedding2);
      expect((globalThis as any).mockCosineSimilarity).toHaveBeenCalledWith(embedding1, embedding2);
      expect(result).toBe(expectedSimilarity);
    });

    test('should handle identical embeddings', () => {
      const embedding = [1, 2, 3];
      (globalThis as any).mockCosineSimilarity.mockReturnValueOnce(1.0);
      const result = manager.similarity(embedding, embedding);
      expect(result).toBe(1.0);
    });
  });

  describe('findMostSimilar', () => {
    test('should find most similar embedding', () => {
      const queryEmbedding = [1, 2, 3];
      const embeddings = [
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
      ];
      (globalThis as any).mockCosineSimilarity
        .mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.7)
        .mockReturnValueOnce(0.5);
      const result = manager.findMostSimilar(queryEmbedding, embeddings);
      expect(result).toStrictEqual({ index: 1, similarity: 0.7 });
    });

    test('should handle single embedding', () => {
      const queryEmbedding = [1, 2, 3];
      const embeddings = [[0, 1]];
      (globalThis as any).mockCosineSimilarity.mockReturnValueOnce(0.8);
      const result = manager.findMostSimilar(queryEmbedding, embeddings);
      expect(result).toStrictEqual({ index: 0, similarity: 0.8 });
    });

    test('should handle empty embeddings array', () => {
      const queryEmbedding = [1, 2, 3];
      const embeddings: number[][] = [];
      const result = manager.findMostSimilar(queryEmbedding, embeddings);
      expect(result).toStrictEqual({ index: 0, similarity: -1 });
    });
  });

  describe('findTopSimilar', () => {
    test('should find top N similar embeddings', () => {
      const queryEmbedding = [1, 2, 3];
      const embeddings = [
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
      ];
      (globalThis as any).mockCosineSimilarity
        .mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.7)
        .mockReturnValueOnce(0.5);
      const result = manager.findTopSimilar(queryEmbedding, embeddings, 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toStrictEqual({ index: 1, similarity: 0.7 });
      expect(result[1]).toStrictEqual({ index: 2, similarity: 0.5 });
    });

    test('should use default topN of 5', () => {
      const queryEmbedding = [1, 2, 3];
      const embeddings = [
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
      ];
      (globalThis as any).mockCosineSimilarity
        .mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.7)
        .mockReturnValueOnce(0.1);
      const result = manager.findTopSimilar(queryEmbedding, embeddings);
      expect(result).toHaveLength(3);
      expect(result[0].similarity).toBe(0.7);
    });

    test('should limit results to requested number', () => {
      const queryEmbedding = [1, 2, 3];
      const embeddings = Array(10).fill([0, 1]);
      (globalThis as any).mockCosineSimilarity.mockImplementation(() => Math.random());
      const result = manager.findTopSimilar(queryEmbedding, embeddings, 3);
      expect(result).toHaveLength(3);
    });

    test('should handle empty embeddings', () => {
      const queryEmbedding = [1, 2, 3];
      const embeddings: number[][] = [];
      const result = manager.findTopSimilar(queryEmbedding, embeddings);
      expect(result).toStrictEqual([]);
    });
  });
});

describe('createEmbeddingManager', () => {
  test('should create EmbeddingManager instance', async () => {
    const mod = await import('@/server/embedding/utils');
    const manager = mod.createEmbeddingManager();
    expect(manager).toBeInstanceOf(mod.EmbeddingManager);
  });

  test('should pass model name to constructor', async () => {
    const mod = await import('@/server/embedding/utils');
    mod.createEmbeddingManager('custom-model');
    expect((globalThis as any).mockOpenaiEmbedding).toHaveBeenCalledWith('custom-model');
  });
});

describe('embedding utility functions', () => {
  let embedding: any;
  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/server/embedding/utils');
    embedding = mod.embedding;
  });

  describe('embed', () => {
    test('should embed single text using utility function', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      (globalThis as any).mockEmbed.mockResolvedValueOnce({ embedding: mockEmbedding });
      const result = await embedding.embed('test text');
      expect(result).toStrictEqual(mockEmbedding);
    });

    test('should use custom model', async () => {
      const customModel = 'custom-model';
      const mockEmbedding = [0.4, 0.5, 0.6];
      (globalThis as any).mockEmbed.mockResolvedValueOnce({ embedding: mockEmbedding });
      const result = await embedding.embed('test text', customModel);
      expect(result).toStrictEqual(mockEmbedding);
    });
  });

  describe('embedMany', () => {
    test('should embed multiple texts using utility function', async () => {
      const texts = ['text 1', 'text 2'];
      const mockEmbeddings = [
        [0.1, 0.2],
        [0.3, 0.4],
      ];
      (globalThis as any).mockEmbedMany.mockResolvedValueOnce({ embeddings: mockEmbeddings });
      const result = await embedding.embedMany(texts);
      expect(result).toStrictEqual(mockEmbeddings);
    });
  });

  describe('cosineSimilarity', () => {
    test('should calculate similarity using utility function', () => {
      const embedding1 = [1, 2, 3];
      const embedding2 = [4, 5, 6];
      const expectedSimilarity = 0.5;
      (globalThis as any).mockCosineSimilarity.mockReturnValueOnce(expectedSimilarity);
      const result = embedding.cosineSimilarity(embedding1, embedding2);
      expect(result).toBe(expectedSimilarity);
    });
  });

  describe('findMostSimilar', () => {
    test('should find most similar using utility function', () => {
      const queryEmbedding = [1, 2, 3];
      const embeddings = [
        [4, 5, 6],
        [7, 8, 9],
      ];
      (globalThis as any).mockCosineSimilarity.mockReturnValueOnce(0.8).mockReturnValueOnce(0.3);
      const result = embedding.findMostSimilar(queryEmbedding, embeddings);
      expect(result).toStrictEqual({ index: 0, similarity: 0.8 });
    });
  });

  describe('findTopSimilar', () => {
    test('should find top similar using utility function', () => {
      const queryEmbedding = [1, 2, 3];
      const embeddings = [
        [4, 5, 6],
        [7, 8, 9],
      ];
      (globalThis as any).mockCosineSimilarity.mockReturnValueOnce(0.8).mockReturnValueOnce(0.3);
      const result = embedding.findTopSimilar(queryEmbedding, embeddings, 2);
      expect(result).toHaveLength(2);
      expect(result[0].similarity).toBe(0.8);
    });

    test('should use default topN', () => {
      const queryEmbedding = [1, 2, 3];
      const embeddings = [[4, 5, 6]];
      (globalThis as any).mockCosineSimilarity.mockReturnValueOnce(0.8);
      const result = embedding.findTopSimilar(queryEmbedding, embeddings);
      expect(result).toHaveLength(1);
    });
  });
});
