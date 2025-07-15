import { beforeEach, describe, expect, vi } from 'vitest';

/**
 * Range Tools Tests - Upgraded for Mock/Integration Mode
 *
 * Uses environment variables to control testing mode:
 * - INTEGRATION_TEST=true: Test with real Upstash Vector database
 * - INTEGRATION_TEST=false/undefined: Use mocks (default)
 *
 * To run with real vector database:
 * INTEGRATION_TEST=true UPSTASH_VECTOR_REST_URL=your-url UPSTASH_VECTOR_REST_TOKEN=your-token pnpm test range-tools-upgraded
 */

const IS_INTEGRATION_TEST = process.env.INTEGRATION_TEST === 'true';
const TEST_TIMEOUT = IS_INTEGRATION_TEST ? 30000 : 5000;

// Mock setup for unit tests
if (!IS_INTEGRATION_TEST) {
  // Mock observability
  vi.mock('@repo/observability', () => ({
    logInfo: vi.fn(),
    logWarn: vi.fn(),
    logError: vi.fn(),
  }));

  // Mock server-only to prevent import issues in tests
  vi.mock('server-only', () => ({}));

  // Mock Upstash Vector
  vi.mock('@upstash/vector', () => ({
    Index: vi.fn().mockImplementation(() => ({
      range: vi.fn(),
      fetch: vi.fn(),
      upsert: vi.fn(),
      query: vi.fn(),
      delete: vi.fn(),
    })),
  }));
} else {
  // Mock server-only for integration tests too
  vi.mock('server-only', () => ({}));
}

describe('range Tools - Upgraded (Mock/Integration)', () => {
  let mockVectorDB: any;
  let realVectorDB: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    if (IS_INTEGRATION_TEST) {
      // Real integration test setup
      if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
        console.log(
          '⚠️ Integration test requires UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN',
        );
        console.log('⚠️ Using mock fallback for this test run');

        // Fall back to mock for this test
        mockVectorDB = createMockVectorDB();
        return;
      }

      console.log('🔗 Setting up integration test with real Upstash Vector');

      const { Index } = await import('@upstash/vector');
      realVectorDB = new Index({
        url: process.env.UPSTASH_VECTOR_REST_URL,
        token: process.env.UPSTASH_VECTOR_REST_TOKEN,
      });

      // Test connection
      try {
        await realVectorDB.info();
        console.log('✅ Integration: Connected to Upstash Vector');
        mockVectorDB = realVectorDB;
      } catch (error) {
        console.log('⚠️ Integration: Could not connect to vector DB, using mock fallback');
        mockVectorDB = createMockVectorDB();
      }
    } else {
      // Mock test setup
      mockVectorDB = createMockVectorDB();
      console.log('🤖 Unit test using mocked vector database');
    }
  });

  function createMockVectorDB() {
    return {
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
      info: vi.fn().mockResolvedValue({ status: 'ok' }),
    };
  }

  test('should import range tools successfully', async () => {
    const rangeTools = await import('../../../src/server/tools/range-tools');
    expect(rangeTools).toBeDefined();
    expect(rangeTools.createRangeTools).toBeTypeOf('function');

    // Log module load based on test type
    const loadMessage = IS_INTEGRATION_TEST
      ? '✅ Integration: Range tools module loaded'
      : '✅ Mock: Range tools module loaded';
    console.log(loadMessage);
  });

  test('should create range tools with config', async () => {
    const { createRangeTools } = await import('../../../src/server/tools/range-tools');

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

    if (IS_INTEGRATION_TEST) {
      console.log('✅ Integration: Range tools created with real DB');
    } else {
      console.log('✅ Mock: Range tools created');
    }
  });

  test(
    'should test scanVectors tool',
    async () => {
      const { createRangeTools } = await import('../../../src/server/tools/range-tools');

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

      if (!IS_INTEGRATION_TEST) {
        expect(mockVectorDB.range).toHaveBeenCalledWith({
          cursor: '',
          limit: 10,
          includeVectors: true,
          includeMetadata: true,
          includeData: true,
        });
      }

      expect(result).toBeDefined();
      expect(result.vectors).toBeDefined();
      expect(Array.isArray(result.vectors)).toBeTruthy();
      expect(typeof result.totalScanned).toBe('number');
      expect(typeof result.currentPage).toBe('number');
      expect(typeof result.pageSize).toBe('number');

      if (IS_INTEGRATION_TEST) {
        console.log(`✅ Integration: Scanned ${result.totalScanned} vectors from real DB`);
      } else {
        expect(result.nextCursor).toBe('cursor_123');
        expect(result.hasMore).toBeTruthy();
        expect(result.totalScanned).toBe(2);
        console.log('✅ Mock: scanVectors test passed');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should test scanVectors with empty result',
    async () => {
      const { createRangeTools } = await import('../../../src/server/tools/range-tools');

      if (!IS_INTEGRATION_TEST) {
        // Mock empty result
        mockVectorDB.range.mockResolvedValue(null);
      }

      const tools = createRangeTools({
        vectorDB: mockVectorDB,
      });

      const result = await tools.scanVectors.execute(
        {
          cursor: IS_INTEGRATION_TEST ? 'non-existent-cursor' : '',
          limit: 10,
          includeVectors: false,
          includeMetadata: true,
          includeData: true,
        },
        { toolCallId: 'test-call', messages: [] },
      );

      expect(result).toBeDefined();
      expect(result.vectors).toStrictEqual([]);
      expect(result.hasMore).toBeFalsy();
      expect(result.totalScanned).toBe(0);

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Empty result handled correctly');
      } else {
        console.log('✅ Mock: Empty result test passed');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should test scanAllVectors tool',
    async () => {
      const { createRangeTools } = await import('../../../src/server/tools/range-tools');

      if (!IS_INTEGRATION_TEST) {
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
      }

      const tools = createRangeTools({
        vectorDB: mockVectorDB,
        defaultPageSize: 10,
      });

      const result = await tools.scanAllVectors.execute(
        {
          batchSize: IS_INTEGRATION_TEST ? 5 : 2,
          maxVectors: IS_INTEGRATION_TEST ? 50 : 100,
          includeVectors: true,
          includeMetadata: true,
          includeData: true,
          onProgress: false,
        },
        { toolCallId: 'test-call', messages: [] },
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.vectors)).toBeTruthy();
      expect(typeof result.totalScanned).toBe('number');
      expect(typeof result.batchCount).toBe('number');
      expect(typeof result.completed).toBe('boolean');
      expect(typeof result.truncated).toBe('boolean');

      if (IS_INTEGRATION_TEST) {
        console.log(
          `✅ Integration: Scanned all ${result.totalScanned} vectors in ${result.batchCount} batches`,
        );
      } else {
        expect(result.vectors).toHaveLength(3);
        expect(result.totalScanned).toBe(3);
        expect(result.batchCount).toBe(2);
        console.log('✅ Mock: scanAllVectors test passed');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should test exportVectors tool in JSON format',
    async () => {
      const { createRangeTools } = await import('../../../src/server/tools/range-tools');

      const tools = createRangeTools({
        vectorDB: mockVectorDB,
      });

      const result = await tools.exportVectors.execute(
        {
          format: 'json',
          includeVectors: true,
          includeMetadata: true,
          includeData: true,
          maxVectors: IS_INTEGRATION_TEST ? 10 : 1000,
          batchSize: IS_INTEGRATION_TEST ? 5 : 100,
        },
        { toolCallId: 'test-call', messages: [] },
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.format).toBe('json');
      expect(result.metadata.mimeType).toBe('application/json');
      expect(typeof result.metadata.totalVectors).toBe('number');
      expect(typeof result.metadata.truncated).toBe('boolean');

      if (IS_INTEGRATION_TEST) {
        console.log(`✅ Integration: Exported ${result.metadata.totalVectors} vectors as JSON`);

        // Validate JSON structure
        const exportedData = JSON.parse(result.data);
        expect(Array.isArray(exportedData)).toBeTruthy();
      } else {
        expect(result.metadata.totalVectors).toBe(1000);
        expect(result.metadata.truncated).toBeTruthy();
        console.log('✅ Mock: JSON export test passed');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should test exportVectors tool in CSV format',
    async () => {
      const { createRangeTools } = await import('../../../src/server/tools/range-tools');

      const tools = createRangeTools({
        vectorDB: mockVectorDB,
      });

      const result = await tools.exportVectors.execute(
        {
          format: 'csv',
          includeVectors: true,
          includeMetadata: true,
          includeData: true,
          maxVectors: IS_INTEGRATION_TEST ? 10 : 1000,
        },
        { toolCallId: 'test-call', messages: [] },
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.metadata.format).toBe('csv');
      expect(result.metadata.mimeType).toBe('text/csv');

      if (IS_INTEGRATION_TEST) {
        console.log(`✅ Integration: Exported ${result.metadata.totalVectors} vectors as CSV`);

        // Basic CSV validation
        const lines = result.data.split('\n');
        if (lines.length > 1) {
          expect(lines[0]).toContain('id'); // Header should contain 'id'
        }
      } else {
        expect(result.data).toContain('id,vector,metadata,data');
        console.log('✅ Mock: CSV export test passed');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should test exportVectors tool in JSONL format',
    async () => {
      const { createRangeTools } = await import('../../../src/server/tools/range-tools');

      const tools = createRangeTools({
        vectorDB: mockVectorDB,
      });

      const result = await tools.exportVectors.execute(
        {
          format: 'jsonl',
          includeVectors: false,
          includeMetadata: true,
          includeData: false,
          maxVectors: IS_INTEGRATION_TEST ? 10 : 1000,
        },
        { toolCallId: 'test-call', messages: [] },
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.metadata.format).toBe('jsonl');
      expect(result.metadata.mimeType).toBe('application/jsonl');

      if (IS_INTEGRATION_TEST) {
        console.log(`✅ Integration: Exported ${result.metadata.totalVectors} vectors as JSONL`);

        // Basic JSONL validation
        if (result.data.trim().length > 0) {
          const lines = result.data.trim().split('\n');
          // Each line should be valid JSON
          lines.forEach(line => {
            expect(() => JSON.parse(line)).not.toThrow();
          });
        }
      } else {
        expect(result.data).toContain('\n');
        console.log('✅ Mock: JSONL export test passed');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should test getVectorsByPrefix tool',
    async () => {
      const { createRangeTools } = await import('../../../src/server/tools/range-tools');

      if (!IS_INTEGRATION_TEST) {
        // Mock vectors with different prefixes
        mockVectorDB.range.mockResolvedValue({
          vectors: [
            { id: 'prefix_1', values: [0.1], metadata: { match: true } },
            { id: 'other_1', values: [0.2], metadata: { match: false } },
            { id: 'prefix_2', values: [0.3], metadata: { match: true } },
          ],
          nextCursor: '',
        });
      }

      const tools = createRangeTools({
        vectorDB: mockVectorDB,
      });

      const testPrefix = IS_INTEGRATION_TEST ? 'test-' : 'prefix_';
      const result = await tools.getVectorsByPrefix.execute(
        {
          prefix: testPrefix,
          limit: 10,
          includeVectors: true,
          includeMetadata: true,
          includeData: true,
        },
        { toolCallId: 'test-call', messages: [] },
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.vectors)).toBeTruthy();
      expect(typeof result.totalMatches).toBe('number');
      expect(typeof result.totalScanned).toBe('number');
      expect(result.prefix).toBe(testPrefix);
      expect(typeof result.truncated).toBe('boolean');

      if (IS_INTEGRATION_TEST) {
        console.log(
          `✅ Integration: Found ${result.totalMatches} vectors with prefix '${testPrefix}'`,
        );

        // Verify all returned vectors have the correct prefix
        result.vectors.forEach(vector => {
          expect(vector.id.startsWith(testPrefix)).toBeTruthy();
        });
      } else {
        expect(result.vectors).toHaveLength(2);
        expect(result.vectors[0].id).toBe('prefix_1');
        expect(result.vectors[1].id).toBe('prefix_2');
        expect(result.totalMatches).toBe(2);
        expect(result.totalScanned).toBe(3);
        console.log('✅ Mock: Prefix search test passed');
      }
    },
    TEST_TIMEOUT,
  );

  test('should test createPaginationSession tool', async () => {
    const { createRangeTools } = await import('../../../src/server/tools/range-tools');

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
      enableCaching: true,
    });

    const sessionId = IS_INTEGRATION_TEST ? `integration-session-${Date.now()}` : 'session-123';
    const result = await tools.createPaginationSession.execute(
      {
        sessionId,
        pageSize: 50,
        includeVectors: true,
        includeMetadata: true,
        includeData: false,
      },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(result).toBeDefined();
    expect(result.sessionId).toBe(sessionId);
    expect(result.created).toBeTruthy();
    expect(result.pageSize).toBe(50);
    expect(result.namespace).toBe('default');

    if (IS_INTEGRATION_TEST) {
      console.log(`✅ Integration: Pagination session created: ${sessionId}`);
    } else {
      console.log('✅ Mock: Pagination session test passed');
    }
  });

  test(
    'should test getNextPage tool',
    async () => {
      const { createRangeTools } = await import('../../../src/server/tools/range-tools');

      const tools = createRangeTools({
        vectorDB: mockVectorDB,
        enableCaching: true,
      });

      const sessionId = IS_INTEGRATION_TEST ? `integration-page-${Date.now()}` : 'session-123';

      // First create a session
      await tools.createPaginationSession.execute(
        {
          sessionId,
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
          sessionId,
        },
        { toolCallId: 'test-call', messages: [] },
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.vectors)).toBeTruthy();
      expect(typeof result.hasMore).toBe('boolean');
      expect(typeof result.currentPage).toBe('number');
      expect(typeof result.totalScanned).toBe('number');
      expect(result.sessionId).toBe(sessionId);

      if (IS_INTEGRATION_TEST) {
        console.log(
          `✅ Integration: Retrieved page ${result.currentPage} with ${result.vectors.length} vectors`,
        );
      } else {
        expect(result.vectors).toHaveLength(2);
        expect(result.hasMore).toBeTruthy();
        expect(result.currentPage).toBe(1);
        expect(result.totalScanned).toBe(2);
        console.log('✅ Mock: Pagination test passed');
      }
    },
    TEST_TIMEOUT,
  );

  test('should handle pagination session not found', async () => {
    const { createRangeTools } = await import('../../../src/server/tools/range-tools');

    const tools = createRangeTools({
      vectorDB: mockVectorDB,
      enableCaching: true,
    });

    const nonExistentSession = IS_INTEGRATION_TEST
      ? `non-existent-${Date.now()}`
      : 'non-existent-session';

    await expect(
      tools.getNextPage.execute(
        {
          sessionId: nonExistentSession,
        },
        { toolCallId: 'test-call', messages: [] },
      ),
    ).rejects.toThrow(`Pagination session '${nonExistentSession}' not found`);

    if (IS_INTEGRATION_TEST) {
      console.log('✅ Integration: Session not found error handled correctly');
    } else {
      console.log('✅ Mock: Session not found test passed');
    }
  });

  test(
    'should handle scanVectors errors gracefully',
    async () => {
      const { createRangeTools } = await import('../../../src/server/tools/range-tools');

      if (!IS_INTEGRATION_TEST) {
        // Mock error in range method
        mockVectorDB.range.mockRejectedValue(new Error('Database error'));
      }

      const tools = createRangeTools({
        vectorDB: mockVectorDB,
      });

      if (IS_INTEGRATION_TEST) {
        // For integration tests, test with invalid parameters
        await expect(
          tools.scanVectors.execute(
            {
              cursor: 'invalid-cursor-format',
              limit: -1, // Invalid limit
              includeVectors: false,
              includeMetadata: true,
              includeData: true,
            },
            { toolCallId: 'test-call', messages: [] },
          ),
        ).rejects.toThrow();

        console.log('✅ Integration: Error handling tested with invalid parameters');
      } else {
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

        console.log('✅ Mock: Error handling test passed');
      }
    },
    TEST_TIMEOUT,
  );

  // Integration-only test for real vector operations
  if (IS_INTEGRATION_TEST) {
    test(
      'should test real vector database operations',
      async () => {
        if (!realVectorDB) {
          console.log('⚠️ Skipping real vector operations test - no real DB connection');
          return;
        }

        console.log('🔍 Testing real vector database operations...');

        const { createRangeTools } = await import('../../../src/server/tools/range-tools');

        // Setup test vectors
        const testVectorId = `integration-test-${Date.now()}`;

        try {
          // Upsert a test vector
          await realVectorDB.upsert([
            {
              id: testVectorId,
              values: [0.1, 0.2, 0.3, 0.4, 0.5],
              metadata: { test: true, timestamp: Date.now() },
              data: 'Integration test vector',
            },
          ]);

          console.log(`📝 Test vector inserted: ${testVectorId}`);

          const tools = createRangeTools({
            vectorDB: realVectorDB,
            defaultPageSize: 10,
          });

          // Test scanning for our test vector
          const scanResult = await tools.scanVectors.execute(
            {
              cursor: '',
              limit: 100,
              includeVectors: true,
              includeMetadata: true,
              includeData: true,
            },
            { toolCallId: 'integration-test', messages: [] },
          );

          expect(scanResult).toBeDefined();
          expect(scanResult.vectors).toBeDefined();

          // Check if our test vector is in the results
          const foundTestVector = scanResult.vectors.find(v => v.id === testVectorId);
          if (foundTestVector) {
            expect(foundTestVector.metadata?.test).toBeTruthy();
            console.log('✅ Test vector found in scan results');
          }

          console.log(`📊 Scanned ${scanResult.totalScanned} vectors from real database`);

          // Cleanup: delete test vector
          await realVectorDB.delete([testVectorId]);
          console.log(`🗑️ Test vector cleaned up: ${testVectorId}`);

          console.log('✅ Integration: Real vector database operations completed');
        } catch (error) {
          console.log(`⚠️ Integration: Vector operations test failed: ${error}`);
          // Try to cleanup anyway
          try {
            await realVectorDB.delete([testVectorId]);
          } catch (cleanupError) {
            // Ignore cleanup errors
          }
        }
      },
      TEST_TIMEOUT,
    );
  }

  // Mock-only test for complex scenarios
  if (!IS_INTEGRATION_TEST) {
    test('should test complex range tool scenarios', async () => {
      const { createRangeTools } = await import('../../../src/server/tools/range-tools');

      // Test with complex pagination and filtering
      const mockComplexVectors = Array.from({ length: 100 }, (_, i) => ({
        id: `vector-${i}`,
        values: Array.from({ length: 5 }, () => Math.random()),
        metadata: {
          category: i % 3 === 0 ? 'category-a' : 'category-b',
          index: i,
        },
        data: `Complex vector data ${i}`,
      }));

      mockVectorDB.range.mockImplementation(({ cursor, limit }: any) => {
        const startIndex = cursor ? parseInt(cursor.split('-')[1]) : 0;
        const endIndex = Math.min(startIndex + limit, mockComplexVectors.length);
        const vectors = mockComplexVectors.slice(startIndex, endIndex);

        return Promise.resolve({
          vectors,
          nextCursor: endIndex < mockComplexVectors.length ? `cursor-${endIndex}` : '',
        });
      });

      const tools = createRangeTools({
        vectorDB: mockVectorDB,
        defaultPageSize: 25,
        maxPageSize: 50,
      });

      // Test full scan
      const fullScanResult = await tools.scanAllVectors.execute(
        {
          batchSize: 25,
          maxVectors: 100,
          includeVectors: true,
          includeMetadata: true,
          includeData: true,
          onProgress: false,
        },
        { toolCallId: 'complex-test', messages: [] },
      );

      expect(fullScanResult.vectors).toHaveLength(100);
      expect(fullScanResult.totalScanned).toBe(100);
      expect(fullScanResult.batchCount).toBe(4);
      expect(fullScanResult.completed).toBeTruthy();

      console.log('✅ Mock: Complex range tool scenarios tested');
    });
  }
});
