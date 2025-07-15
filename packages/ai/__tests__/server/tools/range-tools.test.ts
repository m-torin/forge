import { beforeEach, describe, expect, vi } from 'vitest';

// Mock observability
vi.mock('@repo/observability', () => ({
  logInfo: vi.fn(),
}));

// Mock server-only to prevent import issues in tests
vi.mock('server-only', () => ({}));

// AI SDK mocks are provided by @repo/qa centralized mocks

describe('range Tools', () => {
  let mockVectorDB: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock VectorDB with range method
    mockVectorDB = {
      range: vi.fn().mockResolvedValue({
        vectors: [
          {
            id: 'test-vector-1',
            values: [0.1, 0.2, 0.3],
            metadata: { title: 'Test Document 1', category: 'test' },
            data: 'test data 1',
          },
          {
            id: 'test-vector-2',
            values: [0.4, 0.5, 0.6],
            metadata: { title: 'Test Document 2', category: 'other' },
            data: 'test data 2',
          },
        ],
        nextCursor: 'cursor_123',
      }),
      fetch: vi.fn(),
      upsert: vi.fn(),
    };
  });

  test('should import range tools successfully', async () => {
    const rangeTools = await import('#/server/tools/range-tools');
    expect(rangeTools).toBeDefined();
    expect(rangeTools.createRangeTools).toBeTypeOf('function');
  });

  test('should create range tools with config', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
      defaultPageSize: 50,
      maxPageSize: 500,
      enableCaching: true,
    });

    expect(tools).toBeDefined();
    expect(tools.scanVectors).toBeDefined();
    expect(tools.scanAllVectors).toBeDefined();
    expect(tools.exportVectors).toBeDefined();
    expect(tools.getVectorsByPrefix).toBeDefined();
    expect(tools.createPaginationSession).toBeDefined();
    expect(tools.getNextPage).toBeDefined();
  });

  test('should test scanVectors tool', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
      defaultPageSize: 100,
    });

    const result = await tools.scanVectors.execute(
      {
        cursor: '',
        limit: 10,
        includeVectors: true,
        includeMetadata: true,
        includeData: true,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(mockVectorDB.range).toHaveBeenCalledWith({
      cursor: '',
      limit: 10,
      includeVectors: true,
      includeMetadata: true,
      includeData: true,
    });

    expect(result).toBeDefined();
    expect(result.vectors).toBeDefined();
    expect(result.nextCursor).toBe('cursor_123');
    expect(result.hasMore).toBeTruthy();
    expect(result.totalScanned).toBe(2);
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  test('should test scanVectors with empty result', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    // Mock empty result
    mockVectorDB.range.mockResolvedValue(null);

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
    });

    const result = await tools.scanVectors.execute(
      {
        cursor: '',
        limit: 10,
        includeVectors: false,
        includeMetadata: true,
        includeData: true,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.vectors).toStrictEqual([]);
    expect(result.nextCursor).toBe('');
    expect(result.hasMore).toBeFalsy();
    expect(result.totalScanned).toBe(0);
  });

  test('should test scanAllVectors tool', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    // Mock multiple pages
    mockVectorDB.range
      .mockResolvedValueOnce({
        vectors: [
          { id: 'vec1', values: [0.1], metadata: { page: 1 } },
          { id: 'vec2', values: [0.2], metadata: { page: 1 } },
        ],
        nextCursor: 'cursor_1',
      })
      .mockResolvedValueOnce({
        vectors: [{ id: 'vec3', values: [0.3], metadata: { page: 2 } }],
        nextCursor: '',
      });

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
      defaultPageSize: 10,
    });

    const result = await tools.scanAllVectors.execute(
      {
        batchSize: 2,
        maxVectors: 100,
        includeVectors: true,
        includeMetadata: true,
        includeData: true,
        onProgress: false,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.vectors).toHaveLength(3);
    expect(result.totalScanned).toBe(3);
    expect(result.batchCount).toBe(2);
    expect(result.completed).toBeTruthy();
    expect(result.truncated).toBeFalsy();
  });

  test('should test exportVectors tool in JSON format', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
    });

    const result = await tools.exportVectors.execute(
      {
        format: 'json',
        includeVectors: true,
        includeMetadata: true,
        includeData: true,
        maxVectors: 1000,
        batchSize: 100,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.metadata.format).toBe('json');
    expect(result.metadata.mimeType).toBe('application/json');
    expect(result.metadata.totalVectors).toBe(1000);
    expect(result.metadata.truncated).toBeTruthy();
  });

  test('should test exportVectors tool in CSV format', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
    });

    const result = await tools.exportVectors.execute(
      {
        format: 'csv',
        includeVectors: true,
        includeMetadata: true,
        includeData: true,
        maxVectors: 1000,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.metadata.format).toBe('csv');
    expect(result.metadata.mimeType).toBe('text/csv');
    expect(result.data).toContain('id,vector,metadata,data');
  });

  test('should test exportVectors tool in JSONL format', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
    });

    const result = await tools.exportVectors.execute(
      {
        format: 'jsonl',
        includeVectors: false,
        includeMetadata: true,
        includeData: false,
        maxVectors: 1000,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.metadata.format).toBe('jsonl');
    expect(result.metadata.mimeType).toBe('application/jsonl');
    expect(result.data).toContain('\n');
  });

  test('should test getVectorsByPrefix tool', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    // Mock vectors with different prefixes
    mockVectorDB.range.mockResolvedValue({
      vectors: [
        { id: 'prefix_1', values: [0.1], metadata: { match: true } },
        { id: 'other_1', values: [0.2], metadata: { match: false } },
        { id: 'prefix_2', values: [0.3], metadata: { match: true } },
      ],
      nextCursor: '',
    });

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
    });

    const result = await tools.getVectorsByPrefix.execute(
      {
        prefix: 'prefix_',
        limit: 10,
        includeVectors: true,
        includeMetadata: true,
        includeData: true,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.vectors).toHaveLength(2);
    expect(result.vectors[0].id).toBe('prefix_1');
    expect(result.vectors[1].id).toBe('prefix_2');
    expect(result.totalMatches).toBe(2);
    expect(result.totalScanned).toBe(3);
    expect(result.prefix).toBe('prefix_');
    expect(result.truncated).toBeFalsy();
  });

  test('should test createPaginationSession tool', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
      enableCaching: true,
    });

    const result = await tools.createPaginationSession.execute(
      {
        sessionId: 'session-123',
        pageSize: 50,
        includeVectors: true,
        includeMetadata: true,
        includeData: false,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.sessionId).toBe('session-123');
    expect(result.created).toBeTruthy();
    expect(result.pageSize).toBe(50);
    expect(result.namespace).toBe('default');
  });

  test('should test getNextPage tool', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
      enableCaching: true,
    });

    // First create a session
    await tools.createPaginationSession.execute(
      {
        sessionId: 'session-123',
        pageSize: 10,
        includeVectors: true,
        includeMetadata: true,
        includeData: true,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    // Then get next page
    const result = await tools.getNextPage.execute(
      {
        sessionId: 'session-123',
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.vectors).toHaveLength(2);
    expect(result.hasMore).toBeTruthy();
    expect(result.currentPage).toBe(1);
    expect(result.totalScanned).toBe(2);
    expect(result.sessionId).toBe('session-123');
  });

  test('should handle pagination session not found', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
      enableCaching: true,
    });

    await expect(
      tools.getNextPage.execute(
        {
          sessionId: 'non-existent-session',
        },
        { toolCallId: 'test-call', messages: [] },
      ),
    ).rejects.toThrow("Pagination session 'non-existent-session' not found");
  });

  test('should handle scanVectors errors gracefully', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    // Mock error in range method
    mockVectorDB.range.mockRejectedValue(new Error('Database error'));

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
    });

    await expect(
      tools.scanVectors.execute(
        {
          cursor: '',
          limit: 10,
          includeVectors: false,
          includeMetadata: true,
          includeData: true,
        },
        { toolCallId: 'test-call', messages: [] },
      ),
    ).rejects.toThrow('Failed to scan vectors');
  });

  test('should handle scanAllVectors with progress updates', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    // Mock multiple batches to trigger progress
    const mockBatches = Array.from({ length: 15 }, (_, i) => ({
      vectors: [{ id: `vec${i}`, values: [i], metadata: { batch: i } }],
      nextCursor: i < 14 ? `cursor_${i + 1}` : '',
    }));

    mockVectorDB.range.mockImplementation(({ cursor }: { cursor: string }) => {
      const batchIndex = cursor ? parseInt(cursor.split('_')[1]) - 1 : 0;
      return Promise.resolve(mockBatches[batchIndex] || { vectors: [], nextCursor: '' });
    });

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
    });

    const result = await tools.scanAllVectors.execute(
      {
        batchSize: 1,
        maxVectors: 20,
        onProgress: true,
        includeVectors: true,
        includeMetadata: true,
        includeData: true,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.vectors).toHaveLength(20);
    expect(result.batchCount).toBe(20);
    expect(result.completed).toBeFalsy();
  });

  test('should test RangeToolsConfig interface', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    const config = {
      vectorDB: mockVectorDB,
      defaultPageSize: 100,
      maxPageSize: 1000,
      enableCaching: true,
    };

    const tools = createRangeTools(config);
    expect(tools).toBeDefined();

    // Test that all required methods are present
    expect(tools.scanVectors).toBeDefined();
    expect(tools.scanAllVectors).toBeDefined();
    expect(tools.exportVectors).toBeDefined();
    expect(tools.getVectorsByPrefix).toBeDefined();
    expect(tools.createPaginationSession).toBeDefined();
    expect(tools.getNextPage).toBeDefined();
  });

  test('should respect maxPageSize limits', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
      defaultPageSize: 100,
      maxPageSize: 50,
    });

    const result = await tools.scanVectors.execute(
      {
        cursor: '',
        limit: 100, // Exceeds maxPageSize
        includeVectors: true,
        includeMetadata: true,
        includeData: true,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(mockVectorDB.range).toHaveBeenCalledWith({
      cursor: '',
      limit: 50, // Should be capped at maxPageSize
      includeVectors: true,
      includeMetadata: undefined,
      includeData: undefined,
    });
  });

  test('should handle empty vectors in export', async () => {
    const { createRangeTools } = await import('#/server/tools/range-tools');

    mockVectorDB.range.mockResolvedValue({
      vectors: [],
      nextCursor: '',
    });

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
    });

    const result = await tools.exportVectors.execute(
      {
        format: 'csv',
        includeVectors: true,
        includeMetadata: true,
        includeData: true,
        maxVectors: 1000,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.data).toBe('');
    expect(result.metadata.totalVectors).toBe(0);
  });
});
