import { describe, expect, vi } from 'vitest';
import { z } from 'zod/v4';

// Mock AI SDK
vi.mock('ai', () => ({
  tool: vi.fn().mockImplementation(({ description, parameters, execute }) => ({
    description,
    parameters,
    execute,
  })),
}));

// Mock the tool function from factory to return a proper object
vi.mock('@/server/tools/factory', async () => {
  const actual = await vi.importActual<any>('@/server/tools/factory');
  return {
    ...actual,
    tool: vi.fn().mockImplementation(({ description, parameters, execute }) => ({
      description,
      parameters,
      execute,
    })),
    commonSchemas: {
      id: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
    },
  };
});

// Mock server-only to prevent import issues in tests
vi.mock('server-only', () => ({}));

describe('tools Basic Functionality', () => {
  test('should import and use tool specifications', async () => {
    const specifications = await import('@/server/tools/specifications');

    expect(specifications.ToolSchemas).toBeDefined();
    expect(specifications.ToolSpecifications).toBeDefined();
    expect(specifications.createToolFromSpec).toBeTypeOf('function');
    expect(specifications.validateToolResponse).toBeTypeOf('function');
    expect(specifications.getToolSpec).toBeTypeOf('function');
  });

  test('should import tool factory successfully', async () => {
    const factory = await import('@/server/tools/factory');
    expect(factory).toBeDefined();
    expect(factory.tool).toBeTypeOf('function');
    expect(factory.createToolFactory).toBeTypeOf('function');
    expect(factory.createAPITool).toBeTypeOf('function');
    expect(factory.createStreamingTool).toBeTypeOf('function');
    expect(factory.createSecureTool).toBeTypeOf('function');
  });

  test('should import tool registry successfully', async () => {
    const registry = await import('@/server/tools/registry');
    expect(registry).toBeDefined();
  });

  test('should import tool types successfully', async () => {
    const types = await import('@/server/tools/types');
    expect(types).toBeDefined();
  });

  test('should create tool using factory functions', async () => {
    const { tool, commonSchemas } = await import('@/server/tools/factory');

    expect(tool).toBeTypeOf('function');
    expect(commonSchemas).toBeDefined();

    const testTool = tool({
      description: 'Basic test tool',
      parameters: z.object({ value: z.string() }),
      execute: async ({ value }) => `Basic: ${value}`,
    });

    expect(testTool).toBeDefined();
    expect(typeof testTool).toBe('object');
  });

  test('should handle tool specifications and schemas', async () => {
    const { ToolSchemas, ToolSpecifications } = await import('@/server/tools/specifications');

    expect(ToolSchemas.query).toBeDefined();
    expect(ToolSchemas.filePath).toBeDefined();
    expect(ToolSpecifications.weather).toBeDefined();
    expect(ToolSpecifications.createDocument).toBeDefined();
    expect(ToolSpecifications.searchKnowledge).toBeDefined();
  });

  test('should validate with schemas from specifications', async () => {
    const { ToolSchemas } = await import('@/server/tools/specifications');

    const validQuery = 'test search';
    const result1 = ToolSchemas.query.safeParse(validQuery);

    expect(result.success).toBeTruthy();
    expect(result.data).toBe(validQuery);
  });

  test('should create tool from specification', async () => {
    const { createToolFromSpec } = await import('@/server/tools/specifications');

    {
      expect(createToolFromSpec).toBeTypeOf('function');

      const weatherTool = createToolFromSpec('weather', {
        execute: async params => ({
          temperature: 20,
          unit: params.units || 'celsius',
          description: 'Sunny',
        }),
      });

      expect(weatherTool).toBeDefined();
      expect(typeof weatherTool).toBe('object');
    }
  });
});
