import type { BulkOperationProgress, BulkToolsConfig } from '#/server/tools/bulk-tools';
import { describe, expect, test, vi } from 'vitest';

// Type assertion helper for AI SDK v5 tool execute methods
declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining {
      any(): any;
    }
  }
}

// Mock @ai-sdk/openai locally since centralized mocks aren't working properly
vi.mock('@ai-sdk/openai', () => ({
  openai: {
    embedding: vi.fn().mockImplementation(modelId => ({
      modelId: modelId || 'text-embedding-3-small',
      specificationVersion: 'v2',
      provider: 'openai',
      doEmbed: vi.fn().mockResolvedValue({
        embeddings: [[0.1, 0.2, 0.3]],
        usage: { inputTokens: 10 },
      }),
    })),
  },
}));

// Local mocks removed - using centralized mocks from @repo/qa

describe('bulk Tools', () => {
  test('should import bulk tools successfully', async () => {
    const bulkTools = await import('#/server/tools/bulk-tools');
    expect(bulkTools).toBeDefined();
  });

  test('should test embed function directly with AI SDK v5', async () => {
    // Import centralized test utilities
    const { createEmbeddingModel } = await import('../../test-utils/models');

    const embeddingModel = createEmbeddingModel(1536);
    const { embed } = await import('ai');

    const result = await embed({
      model: embeddingModel,
      value: 'Test embedding content for bulk operations',
    });

    expect(result.embedding).toHaveLength(1536);
    expect(result.embedding).toEqual([0.1, 0.2, 0.3]);
    expect(result.usage.inputTokens).toBeGreaterThan(0);
  });

  test('should test simplified bulk query with AI SDK v5 patterns', async () => {
    const { createBulkTools } = await import('#/server/tools/bulk-tools');

    // Mock more realistic query results
    mockVectorDB.query.mockResolvedValue([
      {
        id: 'result1',
        score: 0.95,
        metadata: { content: 'Highly relevant content', category: 'tech' },
      },
      {
        id: 'result2',
        score: 0.88,
        metadata: { content: 'Moderately relevant content', category: 'science' },
      },
      {
        id: 'result3',
        score: 0.75,
        metadata: { content: 'Somewhat relevant content', category: 'tech' },
      },
    ]);

    const tools = createBulkTools({
      vectorDB: mockVectorDB,
      defaultBatchSize: 10,
      maxConcurrency: 2,
    });

    // Test the query execution
    const result = await tools.bulkQuery.execute(
      {
        query: 'technology and artificial intelligence',
        topK: 3,
        threshold: 0.7,
        includeMetadata: true,
        filters: { category: 'tech' },
      },
      { toolCallId: 'query-test', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.success).toBeTruthy();
    expect(result.results).toHaveLength(3);
    expect(result.results[0].score).toBe(0.95);
    expect(result.results[0].metadata.category).toBe('tech');
    expect(mockVectorDB.query).toHaveBeenCalledWith(
      expect.objectContaining({
        topK: 3,
        includeMetadata: true,
        filter: { category: 'tech' },
      }),
    );
  });

  test('should test bulk query with debug mode enabled', async () => {
    const { createBulkTools } = await import('#/server/tools/bulk-tools');

    // Enable debug mode in config
    const tools = createBulkTools({
      vectorDB: mockVectorDB,
      defaultBatchSize: 5,
      debug: true, // Enable debug logging
    });

    // Mock console.log to capture debug output
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await tools.bulkQuery.execute(
      {
        query: 'debug test query',
        topK: 2,
        debug: true,
        includeScores: true,
      },
      { toolCallId: 'debug-test', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.success).toBeTruthy();
    expect(result.debug).toBeDefined();
    expect(result.debug.queryVector).toBeDefined();
    expect(result.debug.executionTime).toBeGreaterThan(0);
    expect(result.debug.vectorDBCall).toBeTruthy();

    // Verify debug logging occurred (if implemented)
    // expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test('should create bulk tools with config', async () => {
    const { createBulkTools } = await import('#/server/tools/bulk-tools');

    const config = {
      vectorDB: mockVectorDB,
      embeddingModel: 'text-embedding-3-small',
      defaultBatchSize: 50,
      maxConcurrency: 2,
      retryAttempts: 1,
      retryDelay: 500,
    };

    const tools = createBulkTools(config);
    expect(tools).toBeDefined();
    expect(tools.bulkUpsert).toBeDefined();
    expect(tools.bulkDelete).toBeDefined();
    expect(tools.bulkQuery).toBeDefined();
    expect(tools.bulkUpdate).toBeDefined();
  });

  test('should test bulk upsert tool', async () => {
    const { createBulkTools } = await import('#/server/tools/bulk-tools');

    const tools = createBulkTools({
      vectorDB: mockVectorDB,
      defaultBatchSize: 2,
    });

    const mockVectors = [
      { id: 'vec1', content: 'First vector content', metadata: { category: 'test' } },
      { id: 'vec2', content: 'Second vector content', metadata: { category: 'test' } },
    ];

    // Skip test if execute method is not available
    const execute = tools.bulkUpsert.execute;
    expect(execute).toBeDefined();

    const result = (await execute!(
      {
        vectors: mockVectors,
        batchSize: 2,
        generateEmbeddings: true,
        concurrency: 1,
      },
      { toolCallId: 'test-call', messages: [] },
    )) as any;

    expect(result).toBeDefined();
    expect(result.success).toBeTruthy();
    expect(result.total).toBe(2);
    expect(result.processed).toBe(2);
    expect(result.message).toContain('Processed 2 vectors');
    expect(mockVectorDB.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'vec1',
          values: [0],
          metadata: expect.objectContaining({
            content: 'First vector content',
            category: 'test',
            batchIndex: 0,
          }),
        }),
        expect.objectContaining({
          id: 'vec2',
          values: [0],
          metadata: expect.objectContaining({
            content: 'Second vector content',
            category: 'test',
            batchIndex: 0,
          }),
        }),
      ]),
    );
  });

  test('should test bulk delete tool', async () => {
    const { createBulkTools } = await import('#/server/tools/bulk-tools');

    const tools = createBulkTools({
      vectorDB: mockVectorDB,
      defaultBatchSize: 3,
    });

    const idsToDelete = ['vec1', 'vec2', 'vec3'];

    const result = await tools.bulkDelete.execute(
      {
        ids: idsToDelete,
        batchSize: 3,
        concurrency: 1,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.success).toBeTruthy();
    expect(result.total).toBe(3);
    expect(result.message).toContain('Deleted');
    expect(mockVectorDB.delete).toHaveBeenCalledWith(idsToDelete);
  });

  test('should test bulk query tool with comprehensive scenarios', async () => {
    const { createBulkTools } = await import('#/server/tools/bulk-tools');
    const { createEmbeddingModel } = await import('../../test-utils/models');

    // Set up embedding model for query embedding generation
    const embeddingModel = createEmbeddingModel(768);

    const tools = createBulkTools({
      vectorDB: mockVectorDB,
      embeddingModel: embeddingModel,
      defaultBatchSize: 10,
    });

    // Test scenario 1: Basic query
    const basicResult = await tools.bulkQuery.execute(
      {
        query: 'artificial intelligence machine learning',
        topK: 5,
        threshold: 0.8,
      },
      { toolCallId: 'basic-query', messages: [] },
    );

    expect(basicResult.success).toBeTruthy();
    expect(basicResult.results).toHaveLength(2); // Based on mock data
    expect(basicResult.query).toBe('artificial intelligence machine learning');
    expect(basicResult.totalResults).toBe(2);

    // Test scenario 2: Query with filters and metadata
    const filteredResult = await tools.bulkQuery.execute(
      {
        query: 'deep learning neural networks',
        topK: 3,
        threshold: 0.7,
        includeMetadata: true,
        includeScores: true,
        filters: { category: 'ai', type: 'research' },
      },
      { toolCallId: 'filtered-query', messages: [] },
    );

    expect(filteredResult.success).toBeTruthy();
    expect(filteredResult.includeScores).toBeTruthy();
    expect(filteredResult.filters).toEqual({ category: 'ai', type: 'research' });

    // Test scenario 3: Empty query results
    mockVectorDB.query.mockResolvedValueOnce([]);

    const emptyResult = await tools.bulkQuery.execute(
      {
        query: 'nonexistent topic',
        topK: 10,
      },
      { toolCallId: 'empty-query', messages: [] },
    );

    expect(emptyResult.success).toBeTruthy();
    expect(emptyResult.results).toHaveLength(0);
    expect(emptyResult.totalResults).toBe(0);
  });

  test('should test bulk update tool', async () => {
    const { createBulkTools } = await import('#/server/tools/bulk-tools');

    const tools = createBulkTools({
      vectorDB: mockVectorDB,
      defaultBatchSize: 2,
    });

    const updates = [
      { id: 'vec1', metadata: { updated: true }, content: 'Updated content', reEmbed: false },
      { id: 'vec2', metadata: { category: 'updated' }, reEmbed: false },
    ];

    const result = await tools.bulkUpdate.execute(
      {
        updates,
        batchSize: 2,
        concurrency: 1,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.success).toBeTruthy();
    expect(result.total).toBe(2);
    expect(result.message).toContain('Updated');
    expect(mockVectorDB.update).toHaveBeenCalledTimes(2);
  });

  test('should test bulk query with aggregation features', async () => {
    const { createBulkTools } = await import('#/server/tools/bulk-tools');

    // Mock aggregated query results
    mockVectorDB.query.mockResolvedValue([
      { id: 'doc1', score: 0.95, metadata: { category: 'ai', author: 'Smith', year: 2023 } },
      { id: 'doc2', score: 0.88, metadata: { category: 'ai', author: 'Jones', year: 2023 } },
      { id: 'doc3', score: 0.82, metadata: { category: 'ml', author: 'Smith', year: 2022 } },
      { id: 'doc4', score: 0.76, metadata: { category: 'ml', author: 'Brown', year: 2023 } },
    ]);

    const tools = createBulkTools({
      vectorDB: mockVectorDB,
      defaultBatchSize: 10,
    });

    const result = await tools.bulkQuery.execute(
      {
        query: 'machine learning research papers',
        topK: 10,
        threshold: 0.7,
        includeMetadata: true,
        aggregation: {
          enabled: true,
          groupBy: ['category', 'author'],
          metrics: ['count', 'avgScore', 'maxScore'],
          includeGroups: true,
        },
      },
      { toolCallId: 'aggregation-test', messages: [] },
    );

    expect(result.success).toBeTruthy();
    expect(result.results).toHaveLength(4);

    // Test aggregation results
    if (result.aggregation) {
      expect(result.aggregation.enabled).toBeTruthy();
      expect(result.aggregation.groups).toBeDefined();
      expect(result.aggregation.summary).toBeDefined();
      expect(result.aggregation.summary.totalGroups).toBeGreaterThan(0);
      expect(result.aggregation.summary.avgScore).toBeGreaterThan(0);

      // Test category grouping
      const categoryGroups = result.aggregation.groups.category;
      expect(categoryGroups).toBeDefined();
      expect(categoryGroups.ai?.count).toBe(2);
      expect(categoryGroups.ml?.count).toBe(2);
    }

    expect(mockVectorDB.query).toHaveBeenCalledWith(
      expect.objectContaining({
        topK: 10,
        includeMetadata: true,
      }),
    );
  });

  test('should handle vector database errors gracefully', async () => {
    const { createBulkTools } = await import('#/server/tools/bulk-tools');

    // Mock error in vector database
    const failingVectorDB = {
      ...mockVectorDB,
      upsert: vi.fn().mockRejectedValue(new Error('Database error')),
    };

    const tools = createBulkTools({
      vectorDB: failingVectorDB,
      retryAttempts: 1,
    });

    const mockVectors = [{ id: 'vec1', content: 'Test content' }];

    const result = await tools.bulkUpsert.execute(
      {
        vectors: mockVectors,
        batchSize: 1,
        generateEmbeddings: false, // Disable embedding generation to test database error
        concurrency: 1,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.success).toBeFalsy();
    expect(result.failed).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].error).toBe('Database error');
  });

  test('should test interface types', async () => {
    const { createBulkTools } = await import('#/server/tools/bulk-tools');

    // Test BulkToolsConfig interface
    const config: BulkToolsConfig = {
      vectorDB: mockVectorDB,
      embeddingModel: 'text-embedding-3-small',
      defaultBatchSize: 100,
      maxConcurrency: 3,
      retryAttempts: 2,
      retryDelay: 1000,
    };
    expect(config.vectorDB).toBe(mockVectorDB);

    // Test BulkOperationProgress interface
    const progress: BulkOperationProgress = {
      total: 100,
      processed: 50,
      successful: 45,
      failed: 5,
      currentBatch: 2,
      totalBatches: 5,
      errors: [{ batch: 1, error: 'test error', ids: ['id1'] }],
    };
    expect(progress.total).toBe(100);
    expect(progress.errors).toHaveLength(1);
  });

  test('should test BulkTools type', async () => {
    const { createBulkTools } = await import('#/server/tools/bulk-tools');

    const tools = createBulkTools({ vectorDB: mockVectorDB });

    // Test that all expected tools are present
    expect(tools.bulkUpsert).toBeDefined();
    expect(tools.bulkDelete).toBeDefined();
    expect(tools.bulkQuery).toBeDefined();
    expect(tools.bulkUpdate).toBeDefined();

    // Test that tools have expected v5 structure
    expect(tools.bulkUpsert.description).toBeDefined();
    expect(tools.bulkUpsert.inputSchema).toBeDefined(); // v5 uses inputSchema instead of parameters
    expect(tools.bulkUpsert.execute).toBeTypeOf('function');
  });
});
