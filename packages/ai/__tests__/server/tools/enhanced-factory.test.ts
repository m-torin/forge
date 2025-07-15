import type { ToolContext, ToolMetadata } from '#/server/tools/enhanced-factory';
import { beforeEach, describe, expect, vi } from 'vitest';
import { z } from 'zod/v4';

// Local mock removed - using centralized mocks from @repo/qa

// Mock server-only to prevent import issues in tests
vi.mock('server-only', () => ({}));

describe('enhanced Factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should import enhanced factory successfully', async () => {
    const enhancedFactory = await import('#/server/tools/enhanced-factory');
    expect(enhancedFactory).toBeDefined();
  });

  test('should create enhanced tool with basic config', async () => {
    const { createEnhancedTool } = await import('#/server/tools/enhanced-factory');

    const mockExecute = vi.fn().mockResolvedValue('test result');
    const config = {
      name: 'test-tool',
      description: 'A test tool',
      inputSchema: z.object({
        input: z.string(),
      }),
      metadata: {
        category: 'test',
        version: '1.0.0',
      },
    };

    const tool = createEnhancedTool(config, mockExecute);

    expect(tool).toBeDefined();
    expect(tool.description).toBe('A test tool');
    expect(tool.parameters).toBeDefined();
    expect(tool.metadata?.category).toBe('test');
    expect(tool.metadata?.version).toBe('1.0.0');
  });

  test('should create enhanced tool with middleware', async () => {
    const { createEnhancedTool } = await import('#/server/tools/enhanced-factory');

    const mockExecute = vi.fn().mockResolvedValue('test result');
    const mockBeforeExecute = vi.fn();
    const mockAfterExecute = vi.fn();

    const tool = createEnhancedTool(
      {
        name: 'test-tool',
        description: 'Test tool',
        inputSchema: z.object({
          input: z.string(),
        }),
        beforeExecute: mockBeforeExecute,
        afterExecute: mockAfterExecute,
      },
      mockExecute,
    );

    expect(tool).toBeDefined();
    expect(tool.metadata).toBeDefined();

    const result = await tool.execute?.(
      { input: 'test' },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(mockBeforeExecute).toHaveBeenCalledWith({ input: 'test' }, expect.any(Object));
    expect(mockExecute).toHaveBeenCalledWith({ input: 'test' }, expect.any(Object));
    expect(mockAfterExecute).toHaveBeenCalledWith(
      'test result',
      { input: 'test' },
      expect.any(Object),
    );
    expect(result).toBe('test result');
  });

  test('should handle validation and error handling', async () => {
    const { createEnhancedTool } = await import('#/server/tools/enhanced-factory');

    const mockExecute = vi.fn().mockRejectedValue(new Error('Test error'));
    const mockValidateParams = vi.fn().mockReturnValue(false);
    const mockOnError = vi.fn().mockReturnValue('error handled');

    const config = {
      name: 'test-tool',
      description: 'A test tool',
      inputSchema: z.object({
        input: z.string(),
      }),
      validateParams: mockValidateParams,
      onError: mockOnError,
    };

    const tool = createEnhancedTool(config, mockExecute);
    const result = await tool.execute?.(
      { input: 'test' },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(mockValidateParams).toHaveBeenCalledWith({ input: 'test' });
    expect(mockOnError).toHaveBeenCalledWith(
      new Error('Parameter validation failed'),
      { input: 'test' },
      {},
    );
    expect(result).toBe('error handled');
  });

  test('should create search tool', async () => {
    const { createSearchTool } = await import('#/server/tools/enhanced-factory');

    const mockSearchFunction = vi.fn().mockResolvedValue([
      { id: '1', title: 'Result 1' },
      { id: '2', title: 'Result 2' },
    ]);

    const searchTool = createSearchTool({
      name: 'search-tool',
      description: 'Search tool',
      searchFunction: mockSearchFunction,
    });

    expect(searchTool).toBeDefined();
    expect(searchTool.metadata?.category).toBe('search');

    const result = await searchTool.execute?.(
      { query: 'test query', topK: 5, threshold: 0.7 },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(mockSearchFunction).toHaveBeenCalledWith('test query', {
      topK: 5,
      threshold: 0.7,
      metadata: undefined,
    });
    expect(result?.success).toBeTruthy();
    expect(result?.query).toBe('test query');
    expect(result?.results).toHaveLength(2);
    expect(result?.count).toBe(2);
  });

  test('should create CRUD tools with proper schemas', async () => {
    const { createCRUDTools } = await import('#/server/tools/enhanced-factory');

    const mockOperations = {
      create: vi.fn().mockResolvedValue({ id: '1', name: 'Test Item' }),
      read: vi.fn().mockResolvedValue({ id: '1', name: 'Test Item' }),
      update: vi.fn().mockResolvedValue({ id: '1', name: 'Updated' }),
      delete: vi.fn().mockResolvedValue(true),
      list: vi.fn().mockResolvedValue({
        items: [{ id: '1', name: 'Test Item' }],
        total: 1,
      }),
    };

    const ItemSchema = z.object({
      id: z.string(),
      name: z.string(),
    });

    const tools = createCRUDTools({
      resourceName: 'item',
      schemas: {
        create: z.object({ name: z.string() }),
        update: ItemSchema.partial(),
      },
      operations: mockOperations,
    });

    expect(tools).toBeDefined();
    expect(tools.create).toBeDefined();
    expect(tools.read).toBeDefined();
    expect(tools.update).toBeDefined();
    expect(tools.delete).toBeDefined();
    expect(tools.list).toBeDefined();

    // Test create
    const createResult = await tools.create.execute?.(
      { name: 'Test Item' },
      { toolCallId: 'test-call', messages: [] },
    );
    expect(mockOperations.create).toHaveBeenCalledWith({ name: 'Test Item' });
    expect(createResult?.success).toBeTruthy();
    expect(createResult?.data).toStrictEqual({ id: '1', name: 'Test Item' });

    // Test read
    const readResult = await tools.read.execute?.(
      { id: '1' },
      { toolCallId: 'test-call', messages: [] },
    );
    expect(mockOperations.read).toHaveBeenCalledWith('1');
    expect(readResult?.success).toBeTruthy();
    expect(readResult?.data).toStrictEqual({ id: '1', name: 'Test Item' });

    // Test update
    const updateResult = await tools.update.execute?.(
      { id: '1', data: { name: 'Updated' } },
      { toolCallId: 'test-call', messages: [] },
    );
    expect(mockOperations.update).toHaveBeenCalledWith('1', { name: 'Updated' });
    expect(updateResult?.success).toBeTruthy();

    // Test delete
    const deleteResult = await tools.delete.execute?.(
      { id: '1' },
      { toolCallId: 'test-call', messages: [] },
    );
    expect(mockOperations.delete).toHaveBeenCalledWith('1');
    expect(deleteResult?.success).toBeTruthy();

    // Test list
    const listResult = await tools.list.execute?.(
      { page: 1, pageSize: 10 },
      { toolCallId: 'test-call', messages: [] },
    );
    expect(mockOperations.list).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
    expect(listResult?.success).toBeTruthy();
    expect(listResult?.data).toHaveLength(1);
    expect(listResult?.pagination.total).toBe(1);
  });

  test('should create async tool with progress tracking', async () => {
    const { createAsyncTool } = await import('#/server/tools/enhanced-factory');

    const mockExecute = vi.fn().mockImplementation(async (params, progress) => {
      progress({ progress: 0, message: 'Starting' });
      progress({ progress: 50, message: 'Half way' });
      progress({ progress: 100, message: 'Complete' });
      return 'async result';
    });

    const asyncTool = createAsyncTool({
      name: 'async-tool',
      description: 'Async tool with progress',
      inputSchema: z.object({
        input: z.string(),
      }),
      execute: mockExecute,
    });

    expect(asyncTool).toBeDefined();
    expect(asyncTool.metadata?.tags).toContain('async');

    const result = await asyncTool.execute?.(
      { input: 'test' },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(mockExecute).toHaveBeenCalledWith({ input: 'test' }, expect.any(Function));
    expect(result?.result).toBe('async result');
    expect(result?.execution.completed).toBeTruthy();
    expect(result?.execution.progressUpdates).toHaveLength(3);
    expect(result?.execution.progressUpdates[0].message).toBe('Starting');
    expect(result?.execution.progressUpdates[2].message).toBe('Complete');
  });

  test('should create batch tool', async () => {
    const { createBatchTool } = await import('#/server/tools/enhanced-factory');

    const mockProcessItem = vi.fn().mockImplementation(async (item, index) => {
      if (item.shouldFail) {
        throw new Error(`Failed item ${index}`);
      }
      return `processed-${item.value}-${index}`;
    });

    const batchTool = createBatchTool({
      name: 'batch-tool',
      description: 'Batch processing tool',
      itemSchema: z.object({
        value: z.string(),
        shouldFail: z.boolean().optional(),
      }),
      processItem: mockProcessItem,
      maxBatchSize: 2,
    });

    expect(batchTool).toBeDefined();
    expect(batchTool.metadata?.tags).toContain('batch');

    const items = [{ value: 'item1' }, { value: 'item2', shouldFail: true }, { value: 'item3' }];

    const result = await batchTool.execute?.(
      { items, parallel: false },
      { toolCallId: 'test-call', messages: [] },
    );

    expect(mockProcessItem).toHaveBeenCalledTimes(3);
    expect(result?.totalItems).toBe(3);
    expect(result?.successful).toBe(2);
    expect(result?.failed).toBe(1);
    expect(result?.results).toHaveLength(3);
    expect(result?.results[0].success).toBeTruthy();
    expect(result?.results[1].success).toBeFalsy();
    expect(result?.results[2].success).toBeTruthy();
  });

  test('should test common tool schemas', async () => {
    const { commonToolSchemas } = await import('#/server/tools/enhanced-factory');

    expect(commonToolSchemas).toBeDefined();
    expect(commonToolSchemas.query).toBeDefined();
    expect(commonToolSchemas.topK).toBeDefined();
    expect(commonToolSchemas.threshold).toBeDefined();
    expect(commonToolSchemas.userId).toBeDefined();
    expect(commonToolSchemas.namespace).toBeDefined();
    expect(commonToolSchemas.metadata).toBeDefined();
    expect(commonToolSchemas.pagination).toBeDefined();
    expect(commonToolSchemas.dateRange).toBeDefined();
    expect(commonToolSchemas.sortBy).toBeDefined();

    // Test schema validation
    const queryResult = commonToolSchemas.query.safeParse('test query');
    expect(queryResult.success).toBeTruthy();

    const topKResult = commonToolSchemas.topK.safeParse(10);
    expect(topKResult.success).toBeTruthy();

    const paginationResult = commonToolSchemas.pagination.safeParse({
      page: 1,
      pageSize: 10,
    });
    expect(paginationResult.success).toBeTruthy();
  });

  test('should test interface types', async () => {
    // Test ToolContext interface
    const context: ToolContext = {
      userId: 'test-user',
      sessionId: 'test-session',
    };
    expect(context.userId).toBe('test-user');

    // Test ToolMetadata interface
    const metadata: ToolMetadata = {
      category: 'test',
      tags: ['test', 'example'],
      version: '1.0.0',
      experimental: true,
      rateLimit: {
        maxCallsPerMinute: 100,
        maxCallsPerHour: 1000,
      },
    };
    expect(metadata.category).toBe('test');
    expect(metadata.tags).toContain('test');
    expect(metadata.rateLimit?.maxCallsPerMinute).toBe(100);
  });

  test('should handle CRUD tools without list operation', async () => {
    const { createCRUDTools } = await import('#/server/tools/enhanced-factory');

    const mockOperations = {
      create: vi.fn().mockResolvedValue({ id: '1', name: 'Test Item' }),
      read: vi.fn().mockResolvedValue({ id: '1', name: 'Test Item' }),
      update: vi.fn().mockResolvedValue({ id: '1', name: 'Updated Item' }),
      delete: vi.fn().mockResolvedValue(true),
      // No list operation
    };

    const ItemSchema = z.object({
      id: z.string(),
      name: z.string(),
    });

    const tools = createCRUDTools({
      resourceName: 'item',
      schemas: {
        create: z.object({ name: z.string() }),
        update: ItemSchema.partial(),
      },
      operations: mockOperations,
    });

    expect(tools.create).toBeDefined();
    expect(tools.read).toBeDefined();
    expect(tools.update).toBeDefined();
    expect(tools.delete).toBeDefined();
    expect(tools.list).toBeUndefined();
  });

  test('should handle read operation returning null', async () => {
    const { createCRUDTools } = await import('#/server/tools/enhanced-factory');

    const mockOperations = {
      create: vi.fn().mockResolvedValue({ id: '1', name: 'Test Item' }),
      read: vi.fn().mockResolvedValue(null), // Item not found
      update: vi.fn().mockResolvedValue({ id: '1', name: 'Updated Item' }),
      delete: vi.fn().mockResolvedValue(true),
    };

    const ItemSchema = z.object({
      id: z.string(),
      name: z.string(),
    });

    const tools = createCRUDTools({
      resourceName: 'item',
      schemas: {
        create: z.object({ name: z.string() }),
        update: ItemSchema.partial(),
      },
      operations: mockOperations,
    });

    const readResult = await tools.read.execute({ id: 'nonexistent' }, {});
    expect(readResult.success).toBeFalsy();
    expect(readResult.data).toBeNull();
    expect(readResult.message).toBe('item not found');
  });
});
