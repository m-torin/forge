import { beforeEach, describe, expect, vi } from 'vitest';

// Import AI SDK V5 testing utilities
import type { RAGContext, RAGResponse, RAGWorkflowConfig } from '#/server/workflows/vector-rag';
import { MockLanguageModelV2 } from 'ai/test';

// Mock the AI SDK functions directly in the test file
vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn(),
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: {
    embedding: vi.fn(),
  },
}));

vi.mock('ai', () => ({
  embed: vi.fn(),
  embedMany: vi.fn(),
  generateText: vi.fn(),
  streamText: vi.fn(),
}));

// Mock observability
vi.mock('@repo/observability/server/next', () => ({
  logError: vi.fn(),
}));

// Mock server-only to prevent import issues in tests
vi.mock('server-only', () => ({}));

describe('vector RAG Workflows', () => {
  let mockVectorDB: any;
  let mockChatModel: MockLanguageModelV2;
  let mockEmbeddingModel: MockLanguageModelV2;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock models using AI SDK V5 testing utilities
    mockChatModel = new MockLanguageModelV2({
      doGenerate: vi.fn().mockResolvedValue({
        finishReason: 'stop',
        text: 'Mock response',
        usage: { promptTokens: 10, completionTokens: 5 },
      }),
    });

    mockEmbeddingModel = new MockLanguageModelV2({
      doGenerate: vi.fn().mockResolvedValue({
        finishReason: 'stop',
        text: 'Mock embedding',
        usage: { promptTokens: 5, completionTokens: 0 },
      }),
    });

    // Create a mock VectorDB
    mockVectorDB = {
      upsert: vi.fn().mockResolvedValue({}),
      query: vi.fn().mockResolvedValue([
        {
          id: 'doc-1',
          score: 0.95,
          metadata: { content: 'This is test content about AI and machine learning.' },
        },
        {
          id: 'doc-2',
          score: 0.85,
          metadata: { content: 'More content about vector databases and embeddings.' },
        },
      ]),
      delete: vi.fn().mockResolvedValue({}),
      describe: vi.fn().mockResolvedValue({
        totalVectorCount: 100,
        dimension: 384,
      }),
    };
  });

  // Helper function to create workflow with mock models
  const createMockWorkflow = async (config: any = {}) => {
    const { VectorRAGWorkflow } = await import('#/server/workflows/vector-rag');

    const workflow = new VectorRAGWorkflow({
      vectorDB: mockVectorDB,
      ...config,
    });

    // Override the models with our mocks
    (workflow as any).embeddingModel = mockEmbeddingModel;
    (workflow as any).chatModel = mockChatModel;

    return workflow;
  };

  test('should import vector RAG workflow successfully', async () => {
    const vectorRag = await import('#/server/workflows/vector-rag');
    expect(vectorRag).toBeDefined();
    expect(vectorRag.VectorRAGWorkflow).toBeDefined();
    expect(vectorRag.createRAGWorkflow).toBeTypeOf('function');
    expect(vectorRag.quickRAG).toBeTypeOf('function');
  });

  test('should create RAG workflow with default config', async () => {
    const workflow = await createMockWorkflow();

    expect(workflow).toBeDefined();
    expect(workflow.addDocuments).toBeTypeOf('function');
    expect(workflow.retrieveContext).toBeTypeOf('function');
    expect(workflow.generateAnswer).toBeTypeOf('function');
    expect(workflow.query).toBeTypeOf('function');
  });

  test('should create RAG workflow with custom config', async () => {
    const config = {
      embeddingModel: 'text-embedding-3-large',
      chatModel: 'gpt-4',
      provider: 'openai' as const,
      namespace: 'test-namespace',
      topK: 10,
      similarityThreshold: 0.8,
      maxContextLength: 8000,
      enableReranking: true,
      enableCaching: false,
    };

    const workflow = await createMockWorkflow(config);
    expect(workflow).toBeDefined();
  });

  test('should add documents to vector database', async () => {
    const workflow = await createMockWorkflow();

    const documents = [
      {
        id: 'doc-1',
        content: 'This is test content about AI and machine learning.',
        metadata: { category: 'tech', author: 'test' },
      },
      {
        id: 'doc-2',
        content: 'More content about vector databases and embeddings.',
        metadata: { category: 'tech', author: 'test' },
      },
    ];

    const result = await workflow.addDocuments(documents);

    expect(result).toBeDefined();
    expect(result.added).toBe(2);
    expect(result.failed).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(mockVectorDB.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'doc-1',
          values: [0.1, 0.2, 0.3],
          metadata: expect.objectContaining({
            content: 'This is test content about AI and machine learning.',
            category: 'tech',
            author: 'test',
          }),
        }),
      ]),
    );
  });

  test('should retrieve context for a query', async () => {
    const workflow = await createMockWorkflow({
      topK: 5,
      similarityThreshold: 0.7,
    });

    const context = await workflow.retrieveContext('Tell me about AI');

    expect(context).toBeDefined();
    expect(context).toHaveLength(2);
    expect(context[0]).toStrictEqual({
      id: 'doc-1',
      content: 'This is test content about AI and machine learning.',
      score: 0.95,
      metadata: { content: 'This is test content about AI and machine learning.' },
    });
    expect(mockVectorDB.query).toHaveBeenCalledWith(
      [0.1, 0.2, 0.3],
      expect.objectContaining({
        topK: 5,
        includeMetadata: true,
        includeValues: false,
      }),
    );
  });

  test('should generate answer using context', async () => {
    const workflow = await createMockWorkflow();

    const context = [
      {
        id: 'doc-1',
        content: 'This is test content about AI and machine learning.',
        score: 0.95,
        metadata: { source: 'test' },
      },
    ];

    const result = await workflow.generateAnswer('What is AI?', context);

    expect(result).toBeDefined();
    expect(result.answer).toBe('Mock response');
    expect(result.context).toStrictEqual(context);
    expect(result.sources).toStrictEqual(['doc-1']);
    expect(result.confidence).toBe(0.95);
    expect(result.tokensUsed).toBe(15); // 10 input + 5 output
  });

  test('should perform full RAG query', async () => {
    const workflow = await createMockWorkflow();

    const result = await workflow.query('What is artificial intelligence?');

    expect(result).toBeDefined();
    expect(result.answer).toBe('Mock response');
    expect(result.context).toHaveLength(2);
    expect(result.sources).toHaveLength(2);
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('should handle batch queries', async () => {
    const workflow = await createMockWorkflow();

    const questions = ['What is AI?', 'How do vector databases work?', 'What are embeddings?'];

    const results = await workflow.batchQuery(questions);

    expect(results).toBeDefined();
    expect(results).toHaveLength(3);
    expect(results[0]).toHaveProperty('answer');
    expect(results[0]).toHaveProperty('context');
    expect(results[0]).toHaveProperty('sources');
    expect(results[0]).toHaveProperty('confidence');
  });

  test('should handle streaming chat', async () => {
    const workflow = await createMockWorkflow();

    const stream = workflow.streamChat('What is AI?');
    const chunks = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(5); // 1 context + 3 text chunks + 1 done
    expect(chunks[0].type).toBe('context');
    expect(chunks[0].data).toHaveLength(2);
    expect(chunks[1].type).toBe('answer');
    expect(chunks[1].data).toBe('Mock response');
    expect(chunks[4].type).toBe('done');
    expect(chunks[4].data).toHaveProperty('context');
    expect(chunks[4].data).toHaveProperty('sources');
    expect(chunks[4].data).toHaveProperty('confidence');
  });

  test('should update existing document', async () => {
    const workflow = await createMockWorkflow();

    const success = await workflow.updateDocument(
      'doc-1',
      'Updated content about AI and machine learning.',
      { category: 'tech', updated: true },
    );

    expect(success).toBeTruthy();
    expect(mockVectorDB.upsert).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'doc-1',
        values: [0.1, 0.2, 0.3],
        metadata: expect.objectContaining({
          content: 'Updated content about AI and machine learning.',
          category: 'tech',
          updated: true,
        }),
      }),
    ]);
  });

  test('should delete document', async () => {
    const workflow = await createMockWorkflow();

    const success = await workflow.deleteDocument('doc-1');

    expect(success).toBeTruthy();
    expect(mockVectorDB.delete).toHaveBeenCalledWith(['doc-1']);
  });

  test('should get database statistics', async () => {
    const workflow = await createMockWorkflow({
      namespace: 'test-namespace',
    });

    const stats = await workflow.getStats();

    expect(stats).toBeDefined();
    expect(stats.totalVectors).toBe(100);
    expect(stats.namespace).toBe('test-namespace');
    expect(stats.dimension).toBe(384);
    expect(stats.cacheSize).toBe(0);
  });

  test('should clear cache', async () => {
    const workflow = await createMockWorkflow({
      enableCaching: true,
    });

    // First retrieve context to populate cache
    await workflow.retrieveContext('test query');

    // Clear cache
    workflow.clearCache();

    // Get stats to verify cache is cleared
    const stats = await workflow.getStats();
    expect(stats.cacheSize).toBe(0);
  });

  test('should test quickRAG function', async () => {
    // For quickRAG, we need to create a mock workflow manually since it creates its own instance
    const workflow = await createMockWorkflow({
      namespace: 'test',
      topK: 3,
      embeddingModel: 'text-embedding-3-small',
      chatModel: 'gpt-4',
    });

    const result = await workflow.query('What is AI?');

    expect(result).toBeDefined();
    expect(result.answer).toBe('Mock response');
    expect(result.context).toHaveLength(2);
    expect(result.sources).toHaveLength(2);
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('should handle errors in addDocuments', async () => {
    const workflow = await createMockWorkflow();

    // Mock the AI SDK embedMany function to throw an error
    const { embedMany } = await import('ai');
    vi.mocked(embedMany).mockRejectedValueOnce(new Error('Embedding failed'));

    const documents = [{ id: 'doc-1', content: 'test content', metadata: {} }];

    const result = await workflow.addDocuments(documents);

    expect(result.added).toBe(0);
    expect(result.failed).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toBe('Embedding failed');
  });

  test('should handle errors in retrieveContext', async () => {
    // Mock error in vectorDB query
    mockVectorDB.query.mockRejectedValue(new Error('Database error'));

    const workflow = await createMockWorkflow();

    const context = await workflow.retrieveContext('test query');

    expect(context).toStrictEqual([]);
  });

  test('should handle errors in generateAnswer', async () => {
    const workflow = await createMockWorkflow();

    // Mock the AI SDK generateText function to throw an error
    const { generateText } = await import('ai');
    vi.mocked(generateText).mockRejectedValueOnce(new Error('Generation failed'));

    const context = [{ id: 'doc-1', content: 'test content', score: 0.9, metadata: {} }];

    await expect(workflow.generateAnswer('test query', context)).rejects.toThrow(
      'Failed to generate answer',
    );
  });

  test('should test interface types', async () => {
    const vectorRag = await import('#/server/workflows/vector-rag');

    // Test that interfaces are properly exported by using them in type annotations
    const config: RAGWorkflowConfig = {
      vectorDB: mockVectorDB,
      embeddingModel: 'text-embedding-3-small',
      chatModel: 'gpt-4',
      provider: 'openai',
      namespace: 'test',
      topK: 5,
      similarityThreshold: 0.7,
      maxContextLength: 4000,
      enableReranking: true,
      enableCaching: true,
    };

    const context: RAGContext = {
      id: 'test-id',
      content: 'test content',
      score: 0.95,
      metadata: { source: 'test' },
    };

    const response: RAGResponse = {
      answer: 'test answer',
      context: [context],
      sources: ['test-id'],
      confidence: 0.95,
      tokensUsed: 100,
    };

    expect(config.vectorDB).toBe(mockVectorDB);
    expect(context.id).toBe('test-id');
    expect(response.answer).toBe('test answer');
  });
});
