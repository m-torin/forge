/**
 * @vitest-environment node
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createServerClient, safeServerOperation } from '../src/server';
import type { UpstashVectorConfig } from '../src/types';

// Mock Upstash Vector SDK
vi.mock('@upstash/vector', () => ({
  Index: vi.fn(() => mockIndex),
}));

// Mock OpenAI for embeddings
vi.mock('openai', () => ({
  OpenAI: vi.fn(() => mockOpenAI),
}));

const mockIndex = {
  upsert: vi.fn(),
  query: vi.fn(),
  fetch: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
  range: vi.fn(),
  info: vi.fn(),
  reset: vi.fn(),
  describe: vi.fn(),
};

const mockOpenAI = {
  embeddings: {
    create: vi.fn(),
  },
};

describe('Upstash Vector Server Client', () => {
  let client: ReturnType<typeof createServerClient>;

  const testConfig: UpstashVectorConfig = {
    url: 'https://test-vector.upstash.io',
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
      expect(typeof client.upsert).toBe('function');
      expect(typeof client.query).toBe('function');
    });

    it('should create client from environment', () => {
      process.env.UPSTASH_VECTOR_REST_URL = 'https://env-vector.upstash.io';
      process.env.UPSTASH_VECTOR_REST_TOKEN = 'env-token';

      const envClient = createServerClient();
      expect(envClient).toBeDefined();

      delete process.env.UPSTASH_VECTOR_REST_URL;
      delete process.env.UPSTASH_VECTOR_REST_TOKEN;
    });
  });

  describe('Vector Operations', () => {
    const testVector = [0.1, 0.2, 0.3, 0.4, 0.5];
    const testMetadata = { category: 'test', title: 'Test Document' };

    beforeEach(() => {
      mockIndex.upsert.mockResolvedValue({ upserted: 1 });
      mockIndex.query.mockResolvedValue({
        matches: [
          {
            id: 'doc1',
            score: 0.95,
            vector: testVector,
            metadata: testMetadata,
          },
        ],
      });
      mockIndex.fetch.mockResolvedValue({
        vectors: [
          {
            id: 'doc1',
            vector: testVector,
            metadata: testMetadata,
          },
        ],
      });
      mockIndex.delete.mockResolvedValue({ deleted: 1 });
      mockIndex.update.mockResolvedValue({ updated: 1 });
    });

    it('should upsert vector', async () => {
      const result = await client.upsert({
        id: 'doc1',
        vector: testVector,
        metadata: testMetadata,
      });

      expect(mockIndex.upsert).toHaveBeenCalledWith({
        id: 'doc1',
        vector: testVector,
        metadata: testMetadata,
      });
      expect(result.upserted).toBe(1);
    });

    it('should upsert multiple vectors', async () => {
      const vectors = [
        { id: 'doc1', vector: testVector, metadata: testMetadata },
        { id: 'doc2', vector: testVector, metadata: { ...testMetadata, title: 'Test 2' } },
      ];

      await client.upsert(vectors);

      expect(mockIndex.upsert).toHaveBeenCalledWith(vectors);
    });

    it('should query vectors', async () => {
      const result = await client.query({
        vector: testVector,
        topK: 5,
        includeMetadata: true,
      });

      expect(mockIndex.query).toHaveBeenCalledWith({
        vector: testVector,
        topK: 5,
        includeMetadata: true,
      });
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].score).toBe(0.95);
    });

    it('should query with filter', async () => {
      await client.query({
        vector: testVector,
        topK: 5,
        filter: 'category = "test"',
        includeMetadata: true,
      });

      expect(mockIndex.query).toHaveBeenCalledWith({
        vector: testVector,
        topK: 5,
        filter: 'category = "test"',
        includeMetadata: true,
      });
    });

    it('should fetch vectors by id', async () => {
      const result = await client.fetch(['doc1']);

      expect(mockIndex.fetch).toHaveBeenCalledWith(['doc1']);
      expect(result.vectors).toHaveLength(1);
      expect(result.vectors[0].id).toBe('doc1');
    });

    it('should delete vectors', async () => {
      const result = await client.delete(['doc1']);

      expect(mockIndex.delete).toHaveBeenCalledWith(['doc1']);
      expect(result.deleted).toBe(1);
    });

    it('should delete with filter', async () => {
      await client.delete({ filter: 'category = "test"' });

      expect(mockIndex.delete).toHaveBeenCalledWith({ filter: 'category = "test"' });
    });

    it('should update vector', async () => {
      const result = await client.update({
        id: 'doc1',
        vector: testVector,
        metadata: { ...testMetadata, updated: true },
      });

      expect(mockIndex.update).toHaveBeenCalledWith({
        id: 'doc1',
        vector: testVector,
        metadata: { ...testMetadata, updated: true },
      });
      expect(result.updated).toBe(1);
    });
  });

  describe('Range Operations', () => {
    beforeEach(() => {
      mockIndex.range.mockResolvedValue({
        vectors: [
          { id: 'doc1', vector: [0.1, 0.2], metadata: { title: 'Doc 1' } },
          { id: 'doc2', vector: [0.3, 0.4], metadata: { title: 'Doc 2' } },
        ],
        nextCursor: 'cursor123',
      });
    });

    it('should get range of vectors', async () => {
      const result = await client.range({
        cursor: '',
        limit: 10,
        includeMetadata: true,
      });

      expect(mockIndex.range).toHaveBeenCalledWith({
        cursor: '',
        limit: 10,
        includeMetadata: true,
      });
      expect(result.vectors).toHaveLength(2);
      expect(result.nextCursor).toBe('cursor123');
    });
  });

  describe('Index Management', () => {
    beforeEach(() => {
      mockIndex.info.mockResolvedValue({
        vectorCount: 1000,
        pendingVectorCount: 0,
        indexSize: 1024000,
        dimension: 512,
        similarityFunction: 'COSINE',
      });
      mockIndex.reset.mockResolvedValue({ success: true });
    });

    it('should get index info', async () => {
      const result = await client.info();

      expect(mockIndex.info).toHaveBeenCalled();
      expect(result.vectorCount).toBe(1000);
      expect(result.dimension).toBe(512);
    });

    it('should reset index', async () => {
      const result = await client.reset();

      expect(mockIndex.reset).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should describe index statistics', async () => {
      mockIndex.describe.mockResolvedValue({
        dimension: 512,
        vectorCount: 1000,
        similarityFunction: 'COSINE',
      });

      const result = await client.describe();

      expect(mockIndex.describe).toHaveBeenCalled();
      expect(result.dimension).toBe(512);
    });
  });

  describe('Embedding Integration', () => {
    beforeEach(() => {
      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [
          {
            embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
            index: 0,
          },
        ],
      });
    });

    it('should generate embeddings with OpenAI', async () => {
      const embeddingClient = createServerClient({
        ...testConfig,
        embeddings: {
          provider: 'openai',
          apiKey: 'test-openai-key',
          model: 'text-embedding-ada-002',
        },
      });

      const result = await embeddingClient.generateEmbedding('Hello world');

      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        input: 'Hello world',
        model: 'text-embedding-ada-002',
      });
      expect(result).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
    });

    it('should upsert with auto-embedding', async () => {
      const embeddingClient = createServerClient({
        ...testConfig,
        embeddings: {
          provider: 'openai',
          apiKey: 'test-openai-key',
          model: 'text-embedding-ada-002',
        },
      });

      await embeddingClient.upsertWithEmbedding({
        id: 'doc1',
        text: 'Hello world',
        metadata: { title: 'Test Doc' },
      });

      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        input: 'Hello world',
        model: 'text-embedding-ada-002',
      });
      expect(mockIndex.upsert).toHaveBeenCalledWith({
        id: 'doc1',
        vector: [0.1, 0.2, 0.3, 0.4, 0.5],
        metadata: { title: 'Test Doc' },
      });
    });

    it('should query with auto-embedding', async () => {
      const embeddingClient = createServerClient({
        ...testConfig,
        embeddings: {
          provider: 'openai',
          apiKey: 'test-openai-key',
          model: 'text-embedding-ada-002',
        },
      });

      await embeddingClient.queryWithText({
        text: 'search query',
        topK: 5,
        includeMetadata: true,
      });

      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        input: 'search query',
        model: 'text-embedding-ada-002',
      });
      expect(mockIndex.query).toHaveBeenCalledWith({
        vector: [0.1, 0.2, 0.3, 0.4, 0.5],
        topK: 5,
        includeMetadata: true,
      });
    });
  });

  describe('Batch Operations', () => {
    beforeEach(() => {
      mockIndex.upsert.mockResolvedValue({ upserted: 3 });
      mockIndex.delete.mockResolvedValue({ deleted: 2 });
    });

    it('should handle batch upsert', async () => {
      const vectors = [
        { id: 'doc1', vector: [0.1, 0.2], metadata: { title: 'Doc 1' } },
        { id: 'doc2', vector: [0.3, 0.4], metadata: { title: 'Doc 2' } },
        { id: 'doc3', vector: [0.5, 0.6], metadata: { title: 'Doc 3' } },
      ];

      const result = await client.upsert(vectors);

      expect(mockIndex.upsert).toHaveBeenCalledWith(vectors);
      expect(result.upserted).toBe(3);
    });

    it('should handle batch delete', async () => {
      const ids = ['doc1', 'doc2'];
      const result = await client.delete(ids);

      expect(mockIndex.delete).toHaveBeenCalledWith(ids);
      expect(result.deleted).toBe(2);
    });
  });

  describe('Safe Operations', () => {
    it('should handle successful operations', async () => {
      mockIndex.query.mockResolvedValue({
        matches: [{ id: 'doc1', score: 0.95 }],
      });

      const result = await safeServerOperation(async () => {
        return await client.query({
          vector: [0.1, 0.2, 0.3],
          topK: 5,
        });
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.matches).toHaveLength(1);
      }
    });

    it('should handle failed operations', async () => {
      mockIndex.query.mockRejectedValue(new Error('Vector dimension mismatch'));

      const result = await safeServerOperation(async () => {
        return await client.query({
          vector: [0.1, 0.2, 0.3],
          topK: 5,
        });
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Vector dimension mismatch');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle dimension mismatch errors', async () => {
      mockIndex.upsert.mockRejectedValue(
        new Error('Vector dimension mismatch: expected 512, got 3'),
      );

      await expect(async () => {
        await client.upsert({
          id: 'doc1',
          vector: [0.1, 0.2, 0.3], // Wrong dimension
        });
      }).rejects.toThrow('Vector dimension mismatch');
    });

    it('should handle authentication errors', async () => {
      mockIndex.query.mockRejectedValue(new Error('Unauthorized: Invalid token'));

      await expect(async () => {
        await client.query({
          vector: [0.1, 0.2, 0.3, 0.4, 0.5],
          topK: 5,
        });
      }).rejects.toThrow('Unauthorized: Invalid token');
    });

    it('should handle rate limit errors', async () => {
      mockIndex.upsert.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(async () => {
        await client.upsert({
          id: 'doc1',
          vector: [0.1, 0.2, 0.3, 0.4, 0.5],
        });
      }).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle quota errors', async () => {
      mockIndex.upsert.mockRejectedValue(new Error('Quota exceeded'));

      await expect(async () => {
        await client.upsert({
          id: 'doc1',
          vector: [0.1, 0.2, 0.3, 0.4, 0.5],
        });
      }).rejects.toThrow('Quota exceeded');
    });
  });

  describe('Connection Management', () => {
    it('should maintain connection pool stats', async () => {
      // This would test the connection pooling functionality
      // In a real implementation, you'd track active connections
      expect(client).toBeDefined();
    });
  });

  describe('Document Processing', () => {
    beforeEach(() => {
      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [
          { embedding: [0.1, 0.2, 0.3, 0.4, 0.5], index: 0 },
          { embedding: [0.2, 0.3, 0.4, 0.5, 0.6], index: 1 },
        ],
      });
      mockIndex.upsert.mockResolvedValue({ upserted: 2 });
    });

    it('should process documents with chunking', async () => {
      const embeddingClient = createServerClient({
        ...testConfig,
        embeddings: {
          provider: 'openai',
          apiKey: 'test-openai-key',
          model: 'text-embedding-ada-002',
        },
      });

      const longText = 'A'.repeat(2000); // Long text that needs chunking

      await embeddingClient.processDocument({
        id: 'doc1',
        text: longText,
        metadata: { title: 'Long Document' },
        chunkSize: 1000,
        chunkOverlap: 100,
      });

      expect(mockOpenAI.embeddings.create).toHaveBeenCalled();
      expect(mockIndex.upsert).toHaveBeenCalled();
    });
  });
});
