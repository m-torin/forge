/**
 * RAG Tests
 * Testing document processing, chunking, embeddings, and vector operations
 */

import type { EmbeddingModel } from 'ai';
import { embed } from 'ai';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DocumentProcessor, RAGService, createRAGSystem } from '../../../src/server/rag/rag-system';
import type { VectorDB } from '../../../src/server/vector/types';
import { TestDataGenerators } from '../../test-data-generators';

// Mock AI SDK embed function
vi.mock('ai', () => ({
  embed: vi.fn(),
}));

describe('rAG System', () => {
  let mockVectorDB: VectorDB;
  let mockEmbeddingModel: EmbeddingModel<string>;
  let testDocuments: Array<{ title: string; content: string; metadata?: any }>;

  beforeEach(() => {
    // Setup mock vector database
    mockVectorDB = {
      upsert: vi.fn().mockResolvedValue({ success: true, upsertedCount: 1 }),
      query: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue({ success: true }),
      describe: vi.fn().mockResolvedValue({
        totalVectorCount: 100,
        dimension: 1536,
      }),
    };

    // Setup mock embedding model
    mockEmbeddingModel = 'text-embedding-3-small' as EmbeddingModel<string>;

    // Setup test documents
    testDocuments = [
      {
        title: 'AI Research',
        content: TestDataGenerators.AI.generateTextResponses(1, 'technical')[0],
        metadata: { type: 'research', year: 2024 },
      },
      {
        title: 'Machine Learning Guide',
        content: TestDataGenerators.AI.generateTextResponses(1, 'educational')[0],
        metadata: { type: 'guide', difficulty: 'intermediate' },
      },
    ];

    // Mock embed function
    vi.mocked(embed).mockResolvedValue({
      embedding: Array.from({ length: 1536 }, () => Math.random()),
      usage: { totalTokens: 10 },
    });

    vi.clearAllMocks();
  });

  describe('documentProcessor', () => {
    let processor: DocumentProcessor;

    beforeEach(() => {
      processor = new DocumentProcessor({
        defaultChunkSize: 1000,
        defaultChunkOverlap: 200,
        defaultMethod: 'fixed',
      });
    });

    describe('text Chunking', () => {
      test('should chunk text using fixed size method', () => {
        const text = 'A'.repeat(2500); // 2500 characters
        const chunks = processor.chunkText(text, {
          chunkSize: 1000,
          chunkOverlap: 200,
          method: 'fixed',
        });

        expect(chunks.length).toBeGreaterThan(2); // At least 3 chunks for 2500 chars
        expect(chunks[0]).toHaveLength(1000);
        expect(chunks[1]).toHaveLength(1000);
        // Last chunk will be the remainder
        expect(chunks[chunks.length - 1].length).toBeLessThanOrEqual(1000);
      });

      test('should chunk text using sentence method', () => {
        const text = 'First sentence. Second sentence! Third sentence? Fourth sentence.';
        const chunks = processor.chunkText(text, {
          chunkSize: 30,
          method: 'sentence',
        });

        expect(chunks.length).toBeGreaterThan(0);
        // Each chunk should end with proper punctuation
        chunks.forEach(chunk => {
          expect(chunk.trim()).toMatch(/[.!?]$/);
        });
      });

      test('should chunk text using paragraph method', () => {
        const text = 'Paragraph one.\n\nParagraph two.\n\nParagraph three.';
        const chunks = processor.chunkText(text, {
          chunkSize: 20,
          method: 'paragraph',
        });

        expect(chunks.length).toBeGreaterThan(0);
        // Should respect paragraph boundaries
        chunks.forEach(chunk => {
          expect(chunk.trim()).not.toContain('\n\n\n');
        });
      });

      test('should handle empty or short text', () => {
        const emptyResult = processor.chunkText('');
        expect(emptyResult).toHaveLength(0);

        const shortResult = processor.chunkText('Short');
        expect(shortResult).toStrictEqual(['Short']);
      });

      test('should use default configuration when no options provided', () => {
        const text = 'A'.repeat(2000);
        const chunks = processor.chunkText(text);

        expect(chunks.length).toBeGreaterThanOrEqual(1);
        expect(chunks[0].length).toBeLessThanOrEqual(1000); // Default chunk size
      });
    });

    describe('document Processing', () => {
      test('should process document with embeddings', async () => {
        const result = await processor.processDocument(
          'Test Document',
          'This is a test document content.',
          mockEmbeddingModel,
          {
            source: 'test',
            userId: 'user123',
            chunkingOptions: { chunkSize: 50 },
          },
        );

        expect(result.chunks).toBeDefined();
        expect(result.embeddings).toBeDefined();
        expect(result.vectorRecords).toBeDefined();
        expect(result.chunks).toHaveLength(result.embeddings.length);
        expect(result.chunks).toHaveLength(result.vectorRecords.length);

        // Check chunk structure
        const chunk = result.chunks[0];
        expect(chunk.id).toBeDefined();
        expect(chunk.content).toBeDefined();
        expect(chunk.metadata.title).toBe('Test Document');
        expect(chunk.metadata.source).toBe('test');
        expect(chunk.metadata.userId).toBe('user123');
        expect(chunk.metadata.chunkIndex).toBe(0);

        // Verify embed was called
        expect(embed).toHaveBeenCalledWith();
      });

      test('should handle multiple chunks correctly', async () => {
        const longContent = 'A'.repeat(2000); // Will create multiple chunks
        const result = await processor.processDocument(
          'Long Document',
          longContent,
          mockEmbeddingModel,
          { chunkingOptions: { chunkSize: 500 } },
        );

        expect(result.chunks.length).toBeGreaterThan(1);

        // Check chunk indices are sequential
        result.chunks.forEach((chunk, index) => {
          expect(chunk.metadata.chunkIndex).toBe(index);
          expect(chunk.metadata.totalChunks).toBe(result.chunks.length);
        });

        // Verify each chunk gets its own embedding
        expect(embed).toHaveBeenCalledTimes(result.chunks.length);
      });

      test('should include custom metadata', async () => {
        const result = await processor.processDocument('Test Doc', 'Content', mockEmbeddingModel, {
          metadata: { category: 'test', priority: 'high' },
        });

        const chunk = result.chunks[0];
        expect(chunk.metadata.category).toBe('test');
        expect(chunk.metadata.priority).toBe('high');
      });

      test('should create proper vector records', async () => {
        const result = await processor.processDocument(
          'Vector Test',
          'Test content for vectors',
          mockEmbeddingModel,
        );

        const vectorRecord = result.vectorRecords[0];
        expect(vectorRecord.id).toBeDefined();
        expect(vectorRecord.values).toBeDefined();
        expect(vectorRecord.metadata).toBeDefined();
        expect(vectorRecord.metadata.content).toBe('Test content for vectors');
      });
    });
  });

  describe('rAGService', () => {
    let ragService: RAGService;

    beforeEach(() => {
      ragService = new RAGService(mockVectorDB, mockEmbeddingModel, {
        defaultTopK: 5,
        defaultThreshold: 0.7,
        defaultNamespace: 'test',
      });
    });

    describe('context Search', () => {
      test('should search for relevant context', async () => {
        // Mock vector search results
        const mockSearchResults = [
          {
            id: 'doc1_chunk1',
            score: 0.85,
            metadata: {
              content: 'Relevant content about AI',
              title: 'AI Guide',
              source: 'upload',
              chunkIndex: 0,
              totalChunks: 1,
              uploadedAt: '2024-01-01T00:00:00.000Z',
            },
          },
          {
            id: 'doc2_chunk1',
            score: 0.75,
            metadata: {
              content: 'More information about machine learning',
              title: 'ML Basics',
              source: 'import',
              chunkIndex: 0,
              totalChunks: 2,
              uploadedAt: '2024-01-02T00:00:00.000Z',
            },
          },
        ];

        vi.mocked(mockVectorDB.query).mockResolvedValue(mockSearchResults);

        const context = await ragService.searchContext('What is AI?', {
          topK: 5,
          threshold: 0.7,
        });

        expect(embed).toHaveBeenCalledWith({
          model: mockEmbeddingModel,
          value: 'What is AI?',
        });

        expect(mockVectorDB.query).toHaveBeenCalledWith(
          expect.any(Array), // embedding vector
          {
            topK: 5,
            includeMetadata: true,
            filter: undefined,
          },
        );

        expect(context.chunks).toHaveLength(2);
        expect(context.relevanceScores).toStrictEqual([0.85, 0.75]);
        expect(context.sources).toContain('AI Guide');
        expect(context.sources).toContain('ML Basics');
      });

      test('should filter results by similarity threshold', async () => {
        const mockResults = [
          { id: 'high', score: 0.9, metadata: { content: 'High relevance' } },
          { id: 'medium', score: 0.75, metadata: { content: 'Medium relevance' } },
          { id: 'low', score: 0.5, metadata: { content: 'Low relevance' } },
        ];

        vi.mocked(mockVectorDB.query).mockResolvedValue(mockResults);

        const context = await ragService.searchContext('test query', {
          threshold: 0.7,
        });

        expect(context.chunks).toHaveLength(2); // Only high and medium pass threshold
        expect(context.relevanceScores[0]).toBe(0.9);
        expect(context.relevanceScores[1]).toBe(0.75);
      });

      test('should handle empty search results', async () => {
        vi.mocked(mockVectorDB.query).mockResolvedValue([]);

        const context = await ragService.searchContext('no results query');

        expect(context.chunks).toHaveLength(0);
        expect(context.relevanceScores).toHaveLength(0);
        expect(context.sources).toHaveLength(0);
      });

      test('should apply custom filters', async () => {
        const filter = { type: 'research' };
        await ragService.searchContext('test', { filter });

        expect(mockVectorDB.query).toHaveBeenCalledWith(expect.any(Array), {
          topK: 5,
          includeMetadata: true,
          filter,
        });
      });
    });

    describe('rAG Prompt Generation', () => {
      test('should create RAG prompt with context', () => {
        const mockContext = {
          chunks: [
            {
              id: 'chunk1',
              content: 'AI is artificial intelligence',
              metadata: { title: 'AI Basics', chunkIndex: 0, totalChunks: 1, uploadedAt: '' },
            },
            {
              id: 'chunk2',
              content: 'Machine learning is a subset of AI',
              metadata: { title: 'ML Guide', chunkIndex: 0, totalChunks: 1, uploadedAt: '' },
            },
          ],
          relevanceScores: [0.9, 0.8],
          sources: ['AI Basics', 'ML Guide'],
        };

        const prompt = ragService.createRAGPrompt('What is AI?', mockContext);

        expect(prompt).toContain('AI is artificial intelligence');
        expect(prompt).toContain('Machine learning is a subset of AI');
        expect(prompt).toContain('AI Basics');
        expect(prompt).toContain('ML Guide');
        expect(prompt).toContain('90.0%'); // Relevance score
        expect(prompt).toContain('80.0%');
      });

      test('should handle empty context', () => {
        const emptyContext = {
          chunks: [],
          relevanceScores: [],
          sources: [],
        };

        const prompt = ragService.createRAGPrompt('test query', emptyContext);
        expect(prompt).toBe('');
      });
    });

    describe('prompt Generation', () => {
      test('should generate prompt with context', async () => {
        const mockResults = [
          {
            id: 'test',
            score: 0.8,
            metadata: {
              content: 'Test content',
              title: 'Test Doc',
              chunkIndex: 0,
              totalChunks: 1,
              uploadedAt: '',
            },
          },
        ];

        vi.mocked(mockVectorDB.query).mockResolvedValue(mockResults);

        const result = await ragService.getPrompt('test query', 'Answer the question:', {
          topK: 3,
        });

        expect(result.prompt).toContain('Answer the question:');
        expect(result.prompt).toContain('Test content');
        expect(result.context.chunks).toHaveLength(1);
      });
    });

    describe('document Storage', () => {
      test('should store vector records', async () => {
        const vectorRecords = [
          {
            id: 'test1',
            values: [0.1, 0.2, 0.3],
            metadata: { content: 'test content' },
          },
        ];

        const result = await ragService.storeDocuments(vectorRecords);

        expect(mockVectorDB.upsert).toHaveBeenCalledWith(vectorRecords);
        expect(result.success).toBeTruthy();
        expect(result.count).toBe(1);
      });
    });

    describe('statistics', () => {
      test('should get vector database stats', async () => {
        const stats = await ragService.getStats();

        expect(mockVectorDB.describe).toHaveBeenCalledWith();
        expect(stats.totalVectors).toBe(100);
        expect(stats.namespace).toBe('test');
        expect(stats.dimension).toBe(1536);
      });

      test('should handle missing describe method', async () => {
        mockVectorDB.describe = undefined;

        const stats = await ragService.getStats();

        expect(stats.totalVectors).toBe(0);
        expect(stats.dimension).toBe(0);
      });
    });
  });

  describe('rAG System Integration', () => {
    test('should create complete RAG system', () => {
      const ragSystem = createRAGSystem(mockVectorDB, mockEmbeddingModel, {
        processor: { defaultChunkSize: 500 },
        service: { defaultTopK: 3 },
      });

      expect(ragSystem.processor).toBeDefined();
      expect(ragSystem.service).toBeDefined();
      expect(ragSystem.addDocument).toBeDefined();
      expect(ragSystem.query).toBeDefined();
      expect(ragSystem.enhancePrompt).toBeDefined();
    });

    test('should add document end-to-end', async () => {
      const ragSystem = createRAGSystem(mockVectorDB, mockEmbeddingModel);

      const result = await ragSystem.addDocument('Test Title', 'Test content', {
        userId: 'user123',
      });

      expect(embed).toHaveBeenCalledWith();
      expect(mockVectorDB.upsert).toHaveBeenCalledWith();
      expect(result.success).toBeTruthy();
    });

    test('should query documents end-to-end', async () => {
      const ragSystem = createRAGSystem(mockVectorDB, mockEmbeddingModel);

      vi.mocked(mockVectorDB.query).mockResolvedValue([
        {
          id: 'test',
          score: 0.85,
          metadata: {
            content: 'Test answer',
            title: 'Test Doc',
            chunkIndex: 0,
            totalChunks: 1,
            uploadedAt: '',
          },
        },
      ]);

      const context = await ragSystem.query('test question');

      expect(embed).toHaveBeenCalledWith({
        model: mockEmbeddingModel,
        value: 'test question',
      });
      expect(context.chunks).toHaveLength(1);
      expect(context.chunks[0].content).toBe('Test answer');
    });

    test('should enhance prompts end-to-end', async () => {
      const ragSystem = createRAGSystem(mockVectorDB, mockEmbeddingModel);

      vi.mocked(mockVectorDB.query).mockResolvedValue([
        {
          id: 'test',
          score: 0.9,
          metadata: {
            content: 'Relevant information',
            title: 'Source Doc',
            chunkIndex: 0,
            totalChunks: 1,
            uploadedAt: '',
          },
        },
      ]);

      const result = await ragSystem.enhancePrompt('test query', 'Base prompt:', { topK: 1 });

      expect(result.prompt).toContain('Base prompt:');
      expect(result.prompt).toContain('Relevant information');
      expect(result.context.chunks).toHaveLength(1);
    });
  });

  describe('error Handling', () => {
    test('should handle embedding failures', async () => {
      vi.mocked(embed).mockRejectedValue(new Error('Embedding API error'));

      const processor = new DocumentProcessor();

      await expect(
        processor.processDocument('Test', 'Content', mockEmbeddingModel),
      ).rejects.toThrow('Embedding API error');
    });

    test('should handle vector database failures', async () => {
      vi.mocked(mockVectorDB.query).mockRejectedValue(new Error('Vector DB error'));

      const service = new RAGService(mockVectorDB, mockEmbeddingModel);

      await expect(service.searchContext('test query')).rejects.toThrow('Vector DB error');
    });

    test('should handle malformed search results', async () => {
      vi.mocked(mockVectorDB.query).mockResolvedValue([
        {
          id: 'malformed',
          score: 0.8,
          metadata: null, // Missing metadata
        },
      ] as any);

      const service = new RAGService(mockVectorDB, mockEmbeddingModel);
      const context = await service.searchContext('test');

      expect(context.chunks).toHaveLength(1);
      expect(context.chunks[0].content).toBe(''); // Should handle missing content gracefully
    });
  });

  describe('performance', () => {
    test('should handle large document processing efficiently', async () => {
      const processor = new DocumentProcessor();
      const largeContent = 'A'.repeat(50000); // 50KB content

      const startTime = Date.now();
      const result = await processor.processDocument(
        'Large Doc',
        largeContent,
        mockEmbeddingModel,
        { chunkingOptions: { chunkSize: 1000 } },
      );
      const processingTime = Date.now() - startTime;

      expect(result.chunks.length).toBeGreaterThan(40); // Should create many chunks
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(embed).toHaveBeenCalledTimes(result.chunks.length);
    });

    test('should handle concurrent context searches', async () => {
      const service = new RAGService(mockVectorDB, mockEmbeddingModel);

      vi.mocked(mockVectorDB.query).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time
        return [
          {
            id: 'concurrent',
            score: 0.8,
            metadata: { content: 'Concurrent result' },
          },
        ];
      });

      const queries = Array.from({ length: 10 }, (_, i) => `Query ${i}`);
      const startTime = Date.now();

      const results = await Promise.all(queries.map(query => service.searchContext(query)));

      const totalTime = Date.now() - startTime;

      expect(results).toHaveLength(10);
      expect(totalTime).toBeLessThan(1000); // Should complete in parallel
      results.forEach(result => {
        expect(result.chunks).toHaveLength(1);
      });
    });
  });
});
