import {
  createEnhancedTool,
  EnhancedTool,
  EnhancedToolDefinition,
  globalToolFramework,
  ToolExecutionContext,
  ToolExecutionFramework,
  ToolMetadata,
  ToolPatterns,
} from '#/server/tools/execution-framework';
import { beforeEach, describe, expect, vi } from 'vitest';
import { z } from 'zod/v4';

// AI SDK mocks are provided by @repo/qa centralized mocks

vi.mock('#/server/errors/application-errors', () => ({
  ApplicationAIError: vi.fn().mockImplementation((code, message) => {
    const error = new Error(message);
    (error as any).code = code;
    return error;
  }),
}));

describe('basic Tool Framework', () => {
  test('should define tool execution context interface', () => {
    const context: ToolExecutionContext = {
      user: { id: 'user-123', permissions: ['read'] },
      session: { id: 'session-456' },
      environment: 'development',
    };

    expect(context.user?.id).toBe('user-123');
    expect(context.session?.id).toBe('session-456');
    expect(context.environment).toBe('development');
  });

  test('should define tool metadata interface', () => {
    const metadata: ToolMetadata = {
      category: 'test',
      tags: ['basic'],
      version: '1.0.0',
    };

    expect(metadata.category).toBe('test');
    expect(metadata.tags).toContain('basic');
    expect(metadata.version).toBe('1.0.0');
  });

  test('should create enhanced tool', () => {
    const definition: EnhancedToolDefinition = {
      name: 'test-tool',
      description: 'Test tool',
      inputSchema: z.object({ input: z.string() }),
      metadata: {
        category: 'test',
        tags: ['basic'],
        version: '1.0.0',
      },
      execute: async (params: any) => `Result: ${params.input}`,
    };

    const tool = createEnhancedTool(definition);
    expect(tool).toBeInstanceOf(EnhancedTool);
    expect(tool.metadata.category).toBe('test');
    expect(tool.metadata.tags).toContain('basic');
  });

  test('should create tool execution framework', () => {
    const framework = new ToolExecutionFramework();
    expect(framework).toBeInstanceOf(ToolExecutionFramework);
    expect(framework.register).toBeTypeOf('function');
    expect(framework.get).toBeTypeOf('function');
    expect(framework.getAll).toBeTypeOf('function');
  });

  test('should provide global framework instance', () => {
    expect(globalToolFramework).toBeInstanceOf(ToolExecutionFramework);
  });

  test('should provide tool patterns', () => {
    expect(ToolPatterns).toBeDefined();
    expect(ToolPatterns.query).toBeTypeOf('function');
    expect(ToolPatterns.transform).toBeTypeOf('function');
  });

  test('should create query pattern tool', () => {
    const queryTool = ToolPatterns.query({
      name: 'search',
      description: 'Search tool',
      queryFunction: async (query: string) => [{ result: query }],
    });

    expect(queryTool).toBeInstanceOf(EnhancedTool);
    expect(queryTool.metadata.category).toBe('search');
  });

  test('should create transform pattern tool', () => {
    const transformTool = ToolPatterns.transform({
      name: 'transformer',
      description: 'Transform tool',
      inputSchema: z.object({ value: z.string() }),
      transform: input => input.value.toUpperCase(),
    });

    expect(transformTool).toBeInstanceOf(EnhancedTool);
    expect(transformTool.metadata.category).toBe('transform');
  });
});

describe('framework Operations', () => {
  let framework: ToolExecutionFramework;

  beforeEach(() => {
    framework = new ToolExecutionFramework();
  });

  test('should register and retrieve tools', () => {
    const definition: EnhancedToolDefinition = {
      name: 'registered-tool',
      description: 'Registered tool',
      inputSchema: z.object({ data: z.string() }),
      metadata: {
        category: 'registry',
        tags: ['test'],
        version: '1.0.0',
      },
      execute: async (params: any) => `Registered: ${params.data}`,
    };

    framework.register(definition);
    const tool = framework.get('registered-tool');
    expect(tool).toBeInstanceOf(EnhancedTool);
    expect(tool?.metadata.category).toBe('registry');
  });

  test('should filter tools by category', () => {
    framework.register({
      name: 'data-tool',
      description: 'Data tool',
      inputSchema: z.object({}),
      metadata: { category: 'data', tags: [], version: '1.0.0' },
      execute: async () => 'data',
    });

    framework.register({
      name: 'util-tool',
      description: 'Utility tool',
      inputSchema: z.object({}),
      metadata: { category: 'utility', tags: [], version: '1.0.0' },
      execute: async () => 'utility',
    });

    const dataTools = framework.getByCategory('data');
    expect(dataTools).toHaveLength(1);
    expect(dataTools[0].metadata.category).toBe('data');
  });

  test('should filter tools by tags', () => {
    framework.register({
      name: 'tagged-tool',
      description: 'Tagged tool',
      inputSchema: z.object({}),
      metadata: { category: 'test', tags: ['important', 'urgent'], version: '1.0.0' },
      execute: async () => 'tagged',
    });

    const importantTools = framework.getByTags(['important']);
    expect(importantTools).toHaveLength(1);
    expect(importantTools[0].metadata.tags).toContain('important');
  });

  test('should export tools', () => {
    framework.register({
      name: 'export-tool',
      description: 'Export tool',
      inputSchema: z.object({}),
      metadata: { category: 'export', tags: [], version: '1.0.0' },
      execute: async () => 'exported',
    });

    const exported = framework.getToolsForExport();
    expect(exported).toBeDefined();
    expect(typeof exported).toBe('object');

    // Check if tools are exported
    const exportedKeys = Object.keys(exported);
    expect(exportedKeys).toBeDefined();
    expect(Array.isArray(exportedKeys)).toBeTruthy();

    // Test framework exports tools when they have a 'tool' property
    const exportedTool = exported['export-tool'];
    expect(exportedTool).toBeDefined();
  });
});
