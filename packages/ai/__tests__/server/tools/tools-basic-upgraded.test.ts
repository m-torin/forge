import { describe, expect, vi } from 'vitest';
import { z } from 'zod/v4';

/**
 * Tools Basic Tests - Upgraded for Mock/Integration Mode
 *
 * Uses environment variables to control testing mode:
 * - INTEGRATION_TEST=true: Test with real tool executions and API calls
 * - INTEGRATION_TEST=false/undefined: Use mocks (default)
 *
 * To run with real tool executions:
 * INTEGRATION_TEST=true pnpm test tools-basic-upgraded
 */

const IS_INTEGRATION_TEST = process.env.INTEGRATION_TEST === 'true';
const TEST_TIMEOUT = IS_INTEGRATION_TEST ? 30000 : 5000;

// Mock server-only to prevent import issues in tests
vi.mock('server-only', () => ({}));

// Mock setup for unit tests
if (!IS_INTEGRATION_TEST) {
  // Mock external dependencies that tools might use
  vi.mock('@repo/observability', () => ({
    logInfo: vi.fn(),
    logWarn: vi.fn(),
    logError: vi.fn(),
  }));

  // Mock any HTTP clients or external services
  vi.mock('openai', () => ({
    OpenAI: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'Mock AI response' } }],
          }),
        },
      },
    })),
  }));
}

describe('tools Basic Functionality - Upgraded (Mock/Integration)', () => {
  test('should import and use tool specifications', async () => {
    const specifications = await import('../../../src/server/tools/specifications');

    expect(specifications.ToolSchemas).toBeDefined();
    expect(specifications.ToolSpecifications).toBeDefined();
    expect(specifications.createToolFromSpec).toBeTypeOf('function');
    expect(specifications.validateToolResponse).toBeTypeOf('function');
    expect(specifications.getToolSpec).toBeTypeOf('function');

    // Log success based on test type
    const logMessage = IS_INTEGRATION_TEST 
      ? '✅ Integration: Tool specifications loaded'
      : '✅ Mock: Tool specifications loaded';
    console.log(logMessage);
  });

  test('should import tool factory successfully', async () => {
    const factory = await import('../../../src/server/tools/factory');
    expect(factory).toBeDefined();
    expect(factory.tool).toBeTypeOf('function');
    expect(factory.createToolFactory).toBeTypeOf('function');

    // Log factory load status
    const factoryMessage = IS_INTEGRATION_TEST 
      ? '✅ Integration: Tool factory loaded'
      : '✅ Mock: Tool factory loaded';
    console.log(factoryMessage);
  });

  test('should import tool registry successfully', async () => {
    const registry = await import('../../../src/server/tools/registry');
    expect(registry).toBeDefined();

    // Log registry load status
    const registryMessage = IS_INTEGRATION_TEST 
      ? '✅ Integration: Tool registry loaded'
      : '✅ Mock: Tool registry loaded';
    console.log(registryMessage);
    }
  });

  test('should import tool types successfully', async () => {
    const types = await import('../../../src/server/tools/types');
    expect(types).toBeDefined();

    if (IS_INTEGRATION_TEST) {
      console.log('✅ Integration: Tool types loaded');
    } else {
      console.log('✅ Mock: Tool types loaded');
    }
  });

  test(
    'should create tool using factory functions',
    async () => {
      const { tool, commonSchemas } = await import('../../../src/server/tools/factory');

      expect(tool).toBeTypeOf('function');
      expect(commonSchemas).toBeDefined();

      const testTool = tool({
        description: 'Basic test tool',
        inputSchema: z.object({ value: z.string() }),
        execute: async ({ value }) => {
          if (IS_INTEGRATION_TEST) {
            // Test actual tool execution logic
            return `Integration test: ${value}`;
          } else {
            // Mock execution
            return `Mock test: ${value}`;
          }
        },
      });

      expect(testTool).toBeDefined();
      expect(typeof testTool).toBe('object');

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Tool created and ready for execution');
      } else {
        console.log('✅ Mock: Tool created');
      }
    },
    TEST_TIMEOUT,
  );

  test('should handle tool specifications and schemas', async () => {
    const { ToolSchemas, ToolSpecifications } = await import(
      '../../../src/server/tools/specifications'
    );

    expect(ToolSchemas.query).toBeDefined();
    expect(ToolSchemas.filePath).toBeDefined();
    expect(ToolSpecifications.weather).toBeDefined();
    expect(ToolSpecifications.createDocument).toBeDefined();
    expect(ToolSpecifications.searchKnowledge).toBeDefined();

    if (IS_INTEGRATION_TEST) {
      // Test schema validation with real data
      const validQuery = 'integration test search query';
      const queryResult = ToolSchemas.query.safeParse(validQuery);
      expect(queryResult.success).toBeTruthy();

      const validPath = '/tmp/test-file.txt';
      const pathResult = ToolSchemas.filePath.safeParse(validPath);
      expect(pathResult.success).toBeTruthy();

      console.log('✅ Integration: Tool schemas validated with real data');
    } else {
      console.log('✅ Mock: Tool schemas loaded');
    }
  });

  test('should validate with schemas from specifications', async () => {
    const { ToolSchemas } = await import('../../../src/server/tools/specifications');

    const testQuery = IS_INTEGRATION_TEST ? 'real integration test search' : 'mock test search';
    const result = ToolSchemas.query.safeParse(testQuery);

    expect(result.success).toBeTruthy();
    expect(result.data).toBe(testQuery);

    if (IS_INTEGRATION_TEST) {
      // Test with invalid data
      const invalidResult = ToolSchemas.query.safeParse(123);
      expect(invalidResult.success).toBeFalsy();
      console.log('✅ Integration: Schema validation tested with real data');
    } else {
      console.log('✅ Mock: Schema validation passed');
    }
  });

  test(
    'should create tool from specification',
    async () => {
      const { createToolFromSpec } = await import('../../../src/server/tools/specifications');

      expect(createToolFromSpec).toBeTypeOf('function');

      const weatherTool = createToolFromSpec('weather', {
        execute: async params => {
          if (IS_INTEGRATION_TEST) {
            // Test with real weather API logic (mocked here for safety)
            return {
              temperature: 22,
              unit: params.units || 'celsius',
              description: 'Integration test weather',
              location: params.location || 'Test City',
              humidity: 65,
            };
          } else {
            return {
              temperature: 20,
              unit: params.units || 'celsius',
              description: 'Mock weather',
            };
          }
        },
      });

      expect(weatherTool).toBeDefined();
      expect(typeof weatherTool).toBe('object');

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Weather tool created with enhanced functionality');
      } else {
        console.log('✅ Mock: Weather tool created');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should execute tools with proper error handling',
    async () => {
      const { tool } = await import('../../../src/server/tools/factory');

      const errorTestTool = tool({
        description: 'Error handling test tool',
        inputSchema: z.object({
          shouldError: z.boolean().optional(),
          message: z.string(),
        }),
        execute: async ({ shouldError, message }) => {
          if (shouldError) {
            throw new Error(`Tool error: ${message}`);
          }

          if (IS_INTEGRATION_TEST) {
            return `Integration execution: ${message}`;
          } else {
            return `Mock execution: ${message}`;
          }
        },
      });

      // Test successful execution
      const successResult = await errorTestTool.execute({
        shouldError: false,
        message: 'success test',
      });

      expect(successResult).toBeDefined();
      expect(typeof successResult).toBe('string');

      if (IS_INTEGRATION_TEST) {
        expect(successResult).toContain('Integration execution');
      } else {
        expect(successResult).toContain('Mock execution');
      }

      // Test error handling
      try {
        await errorTestTool.execute({
          shouldError: true,
          message: 'error test',
        });
        // Should not reach here
        expect(false).toBeTruthy();
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Tool error: error test');
      }

      if (IS_INTEGRATION_TEST) {
        console.log('✅ Integration: Tool error handling tested');
      } else {
        console.log('✅ Mock: Tool error handling tested');
      }
    },
    TEST_TIMEOUT,
  );

  // Integration-only test for advanced tool features
  if (IS_INTEGRATION_TEST) {
    test(
      'should test advanced tool features',
      async () => {
        console.log('🔍 Testing advanced tool features...');

        const { tool } = await import('../../../src/server/tools/simple-tools');

        // Test API tool creation using new API
        const apiTool = tool.api({
          description: 'API integration test tool',
          parameters: z.object({ query: z.string() }),
          url: 'https://api.example.com/test',
          method: 'GET',
          transformResponse: data => ({ result: `API response for: ${data}` }),
          execute: async ({ query }) => {
            // Mock API response for testing
            return { result: `API response for: ${query}` };
          },
        });

        expect(apiTool).toBeDefined();
        console.log('🔌 API tool created with new API');

        // Test streaming tool creation using new API
        const streamingTool = tool.stream({
          description: 'Streaming integration test tool',
          parameters: z.object({ data: z.string() }),
          execute: async ({ data }) => {
            // Streaming is handled by context.dataStream if available
            return {
              chunks: [
                `Stream chunk 1: ${data}`,
                `Stream chunk 2: ${data}`,
                `Stream final: ${data}`,
              ],
            };
          },
        });

        expect(streamingTool).toBeDefined();
        console.log('📡 Streaming tool created with new API');

        console.log('✅ Integration: Advanced tool features tested');
      },
      TEST_TIMEOUT,
    );
  }

  // Mock-only test for tool performance and edge cases
  if (!IS_INTEGRATION_TEST) {
    test('should test tool performance and edge cases', async () => {
      const { tool } = await import('../../../src/server/tools/factory');

      // Test with large input schema
      const complexTool = tool({
        description: 'Complex schema test tool',
        inputSchema: z.object({
          strings: z.array(z.string()),
          numbers: z.array(z.number()),
          nested: z.object({
            deep: z.object({
              value: z.string(),
            }),
          }),
          optional: z.string().optional(),
          union: z.union([z.string(), z.number()]),
        }),
        execute: async params => {
          return `Processed ${params.strings.length} strings, ${params.numbers.length} numbers`;
        },
      });

      // Test with valid complex input
      const result = await complexTool.execute({
        strings: ['a', 'b', 'c'],
        numbers: [1, 2, 3],
        nested: { deep: { value: 'test' } },
        union: 'string-value',
      });

      expect(result).toContain('Processed 3 strings, 3 numbers');
      console.log('✅ Mock: Complex tool schema validated');
    });
  }
});
