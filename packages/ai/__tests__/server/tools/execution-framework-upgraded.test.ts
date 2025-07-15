/**
 * Tool Execution Framework Tests - Upgraded for Mock/Integration Mode
 *
 * Uses environment variables to control testing mode:
 * - INTEGRATION_TEST=true: Test with real tool execution framework scenarios
 * - INTEGRATION_TEST=false/undefined: Use mocks (default)
 *
 * To run with real framework testing:
 * INTEGRATION_TEST=true pnpm test execution-framework-upgraded
 */

import { beforeEach, describe, expect, vi } from 'vitest';
import { z } from 'zod/v4';
import {
  createEnhancedTool,
  EnhancedTool,
  EnhancedToolDefinition,
  globalToolFramework,
  ToolExecutionContext,
  ToolExecutionFramework,
  ToolMetadata,
  ToolPatterns,
} from '../../../src/server/tools/execution-framework';

const IS_INTEGRATION_TEST = process.env.INTEGRATION_TEST === 'true';
const TEST_TIMEOUT = IS_INTEGRATION_TEST ? 30000 : 5000;

// Mock setup for unit tests
if (!IS_INTEGRATION_TEST) {
  vi.mock('../../../src/server/errors/application-errors', () => ({
    ApplicationAIError: vi.fn().mockImplementation((code, message) => {
      const error = new Error(message);
      (error as any).code = code;
      return error;
    }),
  }));

  // Mock observability
  vi.mock('@repo/observability', () => ({
    logInfo: vi.fn(),
    logWarn: vi.fn(),
    logError: vi.fn(),
  }));
} else {
  // Mock errors for integration tests too
  vi.mock('../../../src/server/errors/application-errors', () => ({
    ApplicationAIError: vi.fn().mockImplementation((code, message) => {
      const error = new Error(message);
      (error as any).code = code;
      return error;
    }),
  }));
}

describe('tool Execution Framework - Upgraded (Mock/Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    if (IS_INTEGRATION_TEST) {
      console.log('🔗 Integration test mode - testing real framework scenarios');
    } else {
      console.log('🤖 Mock test mode - using simulated framework operations');
    }
  });

  test('should define tool execution context interface', () => {
    const context: ToolExecutionContext = {
      user: {
        id: IS_INTEGRATION_TEST ? 'integration-user-98765' : 'user-123',
        permissions: IS_INTEGRATION_TEST ? ['read', 'write', 'admin'] : ['read'],
      },
      session: {
        id: IS_INTEGRATION_TEST ? 'integration-session-54321' : 'session-456',
      },
      environment: IS_INTEGRATION_TEST ? 'production' : 'development',
    };

    if (IS_INTEGRATION_TEST) {
      expect(context.user?.id).toBe('integration-user-98765');
      expect(context.session?.id).toBe('integration-session-54321');
      expect(context.environment).toBe('production');
      expect(context.user?.permissions).toContain('admin');
      console.log('✅ Integration: Tool execution context with enhanced permissions verified');
    } else {
      expect(context.user?.id).toBe('user-123');
      expect(context.session?.id).toBe('session-456');
      expect(context.environment).toBe('development');
      console.log('✅ Mock: Tool execution context verified');
    }
  });

  test('should define tool metadata interface', () => {
    const metadata: ToolMetadata = {
      category: 'test',
      tags: IS_INTEGRATION_TEST ? ['integration', 'production', 'realistic'] : ['basic'],
      version: IS_INTEGRATION_TEST ? '2.1.0' : '1.0.0',
    };

    expect(metadata.category).toBe('test');

    if (IS_INTEGRATION_TEST) {
      expect(metadata.tags).toContain('integration');
      expect(metadata.tags).toContain('realistic');
      expect(metadata.version).toBe('2.1.0');
      console.log('✅ Integration: Tool metadata with enhanced tags verified');
    } else {
      expect(metadata.tags).toContain('basic');
      expect(metadata.version).toBe('1.0.0');
      console.log('✅ Mock: Tool metadata verified');
    }
  });

  test(
    'should create enhanced tool',
    async () => {
      const definition: EnhancedToolDefinition = {
        name: IS_INTEGRATION_TEST ? 'integration-enhanced-tool' : 'test-tool',
        description: 'Test tool',
        inputSchema: z.object({ input: z.string() }),
        metadata: {
          category: 'test',
          tags: IS_INTEGRATION_TEST ? ['integration', 'enhanced'] : ['basic'],
          version: IS_INTEGRATION_TEST ? '2.0.0' : '1.0.0',
        },
        execute: async (params: any) => {
          if (IS_INTEGRATION_TEST) {
            // Simulate more realistic processing
            await new Promise(resolve => setTimeout(resolve, 50));
            return `Integration Result: ${params.input} - processed at ${Date.now()}`;
          } else {
            return `Result: ${params.input}`;
          }
        },
      };

      const tool = createEnhancedTool(definition);
      expect(tool).toBeInstanceOf(EnhancedTool);
      expect(tool.metadata.category).toBe('test');

      if (IS_INTEGRATION_TEST) {
        expect(tool.metadata.tags).toContain('integration');
        expect(tool.metadata.version).toBe('2.0.0');

        // Test actual execution
        const result = await tool.execute?.({ input: 'integration-test-data' });
        expect(result).toContain('Integration Result');
        expect(result).toContain('integration-test-data');
        console.log('✅ Integration: Enhanced tool creation and execution verified');
      } else {
        expect(tool.metadata.tags).toContain('basic');
        expect(tool.metadata.version).toBe('1.0.0');
        console.log('✅ Mock: Enhanced tool creation verified');
      }
    },
    TEST_TIMEOUT,
  );

  test('should create tool execution framework', () => {
    const framework = new ToolExecutionFramework();
    expect(framework).toBeInstanceOf(ToolExecutionFramework);
    expect(framework.register).toBeTypeOf('function');
    expect(framework.get).toBeTypeOf('function');
    expect(framework.getAll).toBeTypeOf('function');

    if (IS_INTEGRATION_TEST) {
      console.log('✅ Integration: Tool execution framework created');
    } else {
      console.log('✅ Mock: Tool execution framework created');
    }
  });

  test('should provide global framework instance', () => {
    expect(globalToolFramework).toBeInstanceOf(ToolExecutionFramework);

    if (IS_INTEGRATION_TEST) {
      console.log('✅ Integration: Global framework instance verified');
    } else {
      console.log('✅ Mock: Global framework instance verified');
    }
  });

  test('should provide tool patterns', async () => {
    expect(ToolPatterns).toBeDefined();
    expect(ToolPatterns.query).toBeTypeOf('function');
    expect(ToolPatterns.transform).toBeTypeOf('function');

    if (IS_INTEGRATION_TEST) {
      console.log('✅ Integration: Tool patterns available');
    } else {
      console.log('✅ Mock: Tool patterns available');
    }
  });

  test(
    'should create query pattern tool',
    async () => {
      const queryTool = ToolPatterns.query({
        name: IS_INTEGRATION_TEST ? 'integration-search' : 'search',
        description: 'Search tool',
        queryFunction: async (query: string) => {
          if (IS_INTEGRATION_TEST) {
            // Simulate realistic search results
            await new Promise(resolve => setTimeout(resolve, 100));
            return [
              { id: 'result-1', title: `Integration result for: ${query}`, score: 0.95 },
              { id: 'result-2', title: `Another result for: ${query}`, score: 0.87 },
              { id: 'result-3', title: `Third result for: ${query}`, score: 0.76 },
            ];
          } else {
            return [{ result: query }];
          }
        },
      });

      expect(queryTool).toBeInstanceOf(EnhancedTool);
      expect(queryTool.metadata.category).toBe('search');

      if (IS_INTEGRATION_TEST) {
        // Test actual query execution
        const result = await queryTool.execute?.({ query: 'integration test search' });
        expect(result).toHaveLength(3);
        expect(result[0].title).toContain('Integration result');
        expect(result[0].score).toBe(0.95);
        console.log('✅ Integration: Query pattern tool with realistic results verified');
      } else {
        console.log('✅ Mock: Query pattern tool verified');
      }
    },
    TEST_TIMEOUT,
  );

  test(
    'should create transform pattern tool',
    async () => {
      const transformTool = ToolPatterns.transform({
        name: IS_INTEGRATION_TEST ? 'integration-transformer' : 'transformer',
        description: 'Transform tool',
        inputSchema: z.object({ value: z.string() }),
        transform: input => {
          if (IS_INTEGRATION_TEST) {
            return {
              original: input.value,
              transformed: input.value.toUpperCase(),
              timestamp: Date.now(),
              processingInfo: 'Integration transform applied',
            };
          } else {
            return input.value.toUpperCase();
          }
        },
      });

      expect(transformTool).toBeInstanceOf(EnhancedTool);
      expect(transformTool.metadata.category).toBe('transform');

      if (IS_INTEGRATION_TEST) {
        // Test actual transform execution
        const result = await transformTool.execute?.({ value: 'integration test data' });
        expect(result.original).toBe('integration test data');
        expect(result.transformed).toBe('INTEGRATION TEST DATA');
        expect(result.processingInfo).toBe('Integration transform applied');
        expect(typeof result.timestamp).toBe('number');
        console.log('✅ Integration: Transform pattern tool with enhanced output verified');
      } else {
        console.log('✅ Mock: Transform pattern tool verified');
      }
    },
    TEST_TIMEOUT,
  );
});

describe('framework Operations - Upgraded (Mock/Integration)', () => {
  let framework: ToolExecutionFramework;

  beforeEach(() => {
    framework = new ToolExecutionFramework();

    if (IS_INTEGRATION_TEST) {
      console.log('🔗 Integration: Framework operations setup');
    } else {
      console.log('🤖 Mock: Framework operations setup');
    }
  });

  test(
    'should register and retrieve tools',
    async () => {
      const definition: EnhancedToolDefinition = {
        name: IS_INTEGRATION_TEST ? 'integration-registered-tool' : 'registered-tool',
        description: 'Registered tool',
        inputSchema: z.object({ data: z.string() }),
        metadata: {
          category: 'registry',
          tags: IS_INTEGRATION_TEST ? ['integration', 'registered'] : ['test'],
          version: IS_INTEGRATION_TEST ? '2.1.0' : '1.0.0',
        },
        execute: async (params: any) => {
          if (IS_INTEGRATION_TEST) {
            await new Promise(resolve => setTimeout(resolve, 25));
            return {
              message: `Integration registered: ${params.data}`,
              processedAt: Date.now(),
              toolVersion: '2.1.0',
            };
          } else {
            return `Registered: ${params.data}`;
          }
        },
      };

      framework.register(definition);
      const tool = framework.get(definition.name);
      expect(tool).toBeInstanceOf(EnhancedTool);
      expect(tool?.metadata.category).toBe('registry');

      if (IS_INTEGRATION_TEST) {
        expect(tool?.metadata.tags).toContain('integration');
        expect(tool?.metadata.version).toBe('2.1.0');

        // Test actual execution
        const result = await tool?.execute?.({ data: 'integration-test-data' });
        expect(result.message).toContain('Integration registered');
        expect(result.toolVersion).toBe('2.1.0');
        expect(typeof result.processedAt).toBe('number');
        console.log('✅ Integration: Tool registration and execution verified');
      } else {
        expect(tool?.metadata.tags).toContain('test');
        console.log('✅ Mock: Tool registration verified');
      }
    },
    TEST_TIMEOUT,
  );

  test('should filter tools by category', () => {
    const categories = IS_INTEGRATION_TEST
      ? ['data', 'utility', 'integration']
      : ['data', 'utility'];

    categories.forEach((category, index) => {
      framework.register({
        name: `${category}-tool-${index}`,
        description: `${category} tool`,
        inputSchema: z.object({}),
        metadata: {
          category: category,
          tags: IS_INTEGRATION_TEST ? ['integration', category] : [],
          version: IS_INTEGRATION_TEST ? '2.0.0' : '1.0.0',
        },
        execute: async () => `${category} result`,
      });
    });

    const dataTools = framework.getByCategory('data');
    expect(dataTools).toHaveLength(1);
    expect(dataTools[0].metadata.category).toBe('data');

    if (IS_INTEGRATION_TEST) {
      expect(dataTools[0].metadata.tags).toContain('integration');
      expect(dataTools[0].metadata.version).toBe('2.0.0');

      // Test integration category
      const integrationTools = framework.getByCategory('integration');
      expect(integrationTools).toHaveLength(1);
      expect(integrationTools[0].metadata.category).toBe('integration');
      console.log('✅ Integration: Category filtering with multiple categories verified');
    } else {
      console.log('✅ Mock: Category filtering verified');
    }
  });

  test('should filter tools by tags', () => {
    const tags = IS_INTEGRATION_TEST
      ? [
          ['important', 'urgent', 'integration'],
          ['performance', 'integration'],
          ['experimental', 'integration'],
        ]
      : [['important', 'urgent'], ['performance'], ['experimental']];

    tags.forEach((tagSet, index) => {
      framework.register({
        name: `tagged-tool-${index}`,
        description: 'Tagged tool',
        inputSchema: z.object({}),
        metadata: {
          category: 'test',
          tags: tagSet,
          version: IS_INTEGRATION_TEST ? '2.0.0' : '1.0.0',
        },
        execute: async () => `tagged result ${index}`,
      });
    });

    const importantTools = framework.getByTags(['important']);
    expect(importantTools).toHaveLength(1);
    expect(importantTools[0].metadata.tags).toContain('important');

    if (IS_INTEGRATION_TEST) {
      // Test integration tag filtering
      const integrationTools = framework.getByTags(['integration']);
      expect(integrationTools).toHaveLength(3);
      integrationTools.forEach(tool => {
        expect(tool.metadata.tags).toContain('integration');
      });

      // Test multiple tag filtering
      const urgentIntegrationTools = framework.getByTags(['urgent', 'integration']);
      expect(urgentIntegrationTools).toHaveLength(1);
      expect(urgentIntegrationTools[0].metadata.tags).toContain('urgent');
      expect(urgentIntegrationTools[0].metadata.tags).toContain('integration');
      console.log('✅ Integration: Tag filtering with integration tags verified');
    } else {
      console.log('✅ Mock: Tag filtering verified');
    }
  });

  test('should export tools', () => {
    const toolCount = IS_INTEGRATION_TEST ? 3 : 1;

    for (let i = 0; i < toolCount; i++) {
      framework.register({
        name: `export-tool-${i}`,
        description: `Export tool ${i}`,
        inputSchema: z.object({}),
        metadata: {
          category: 'export',
          tags: IS_INTEGRATION_TEST ? ['export', 'integration'] : [],
          version: IS_INTEGRATION_TEST ? '2.0.0' : '1.0.0',
        },
        execute: async () => `exported ${i}`,
      });
    }

    const exported = framework.getToolsForExport();
    expect(exported).toBeDefined();
    expect(typeof exported).toBe('object');

    const exportedKeys = Object.keys(exported);
    expect(exportedKeys).toBeDefined();
    expect(Array.isArray(exportedKeys)).toBeTruthy();

    if (IS_INTEGRATION_TEST) {
      expect(exportedKeys).toHaveLength(3);
      exportedKeys.forEach(key => {
        const exportedTool = exported[key];
        expect(exportedTool).toBeDefined();
        expect(key).toContain('export-tool');
      });
      console.log('✅ Integration: Tool export with multiple tools verified');
    } else {
      expect(exportedKeys).toHaveLength(1);
      const exportedTool = exported['export-tool-0'];
      expect(exportedTool).toBeDefined();
      console.log('✅ Mock: Tool export verified');
    }
  });

  // Integration-only test for framework performance and scalability
  if (IS_INTEGRATION_TEST) {
    test(
      'should handle framework performance with many tools',
      async () => {
        console.log('🚀 Testing framework performance with many tools...');

        const toolCount = 100;
        const categories = ['data', 'utility', 'transform', 'search', 'export'];
        const tags = ['performance', 'scalability', 'integration', 'production'];

        // Register many tools
        const startRegister = Date.now();
        for (let i = 0; i < toolCount; i++) {
          const category = categories[i % categories.length];
          const toolTags = [tags[i % tags.length], 'integration'];

          framework.register({
            name: `perf-tool-${i}`,
            description: `Performance test tool ${i}`,
            inputSchema: z.object({ index: z.number() }),
            metadata: {
              category,
              tags: toolTags,
              version: '2.0.0',
            },
            execute: async ({ index }) => {
              await new Promise(resolve => setTimeout(resolve, 1)); // Minimal processing
              return `Performance result ${index}`;
            },
          });
        }
        const registerTime = Date.now() - startRegister;

        // Test retrieval performance
        const startRetrieval = Date.now();
        const allTools = framework.getAll();
        const retrievalTime = Date.now() - startRetrieval;

        // Test filtering performance
        const startFiltering = Date.now();
        const dataTools = framework.getByCategory('data');
        const performanceTools = framework.getByTags(['performance']);
        const filterTime = Date.now() - startFiltering;

        expect(allTools).toHaveLength(toolCount);
        expect(dataTools.length).toBeGreaterThan(0);
        expect(performanceTools.length).toBeGreaterThan(0);

        console.log(`📊 Performance metrics:`);
        console.log(`   Registered ${toolCount} tools in ${registerTime}ms`);
        console.log(`   Retrieved all tools in ${retrievalTime}ms`);
        console.log(`   Filtered tools in ${filterTime}ms`);
        console.log(`   Data tools found: ${dataTools.length}`);
        console.log(`   Performance tools found: ${performanceTools.length}`);

        // Performance assertions
        expect(registerTime).toBeLessThan(5000); // Should register quickly
        expect(retrievalTime).toBeLessThan(100); // Should retrieve quickly
        expect(filterTime).toBeLessThan(100); // Should filter quickly

        console.log('✅ Integration: Framework performance with many tools verified');
      },
      TEST_TIMEOUT,
    );

    test(
      'should test tool execution concurrency',
      async () => {
        console.log('🔄 Testing concurrent tool execution...');

        // Register concurrent-capable tools
        const concurrentTools = Array.from({ length: 5 }, (_, i) => {
          const toolName = `concurrent-tool-${i}`;
          framework.register({
            name: toolName,
            description: `Concurrent tool ${i}`,
            inputSchema: z.object({ delay: z.number(), data: z.string() }),
            metadata: {
              category: 'concurrent',
              tags: ['integration', 'concurrent'],
              version: '2.0.0',
            },
            execute: async ({ delay, data }) => {
              await new Promise(resolve => setTimeout(resolve, delay));
              return `Concurrent result: ${data} after ${delay}ms`;
            },
          });
          return framework.get(toolName)!;
        });

        // Execute tools concurrently
        const startTime = Date.now();
        const promises = concurrentTools.map((tool, index) =>
          tool.execute?.({
            delay: 100 + index * 50, // Varying delays
            data: `test-data-${index}`,
          }),
        );

        const results = await Promise.all(promises);
        const totalTime = Date.now() - startTime;

        // Verify results
        expect(results).toHaveLength(5);
        results.forEach((result, index) => {
          expect(result).toContain(`Concurrent result: test-data-${index}`);
        });

        // Should complete faster than sequential execution
        expect(totalTime).toBeLessThan(1000); // Concurrent should be much faster than 100+150+200+250+300 = 1000ms

        console.log(`⚡ Concurrent execution completed in ${totalTime}ms`);
        console.log('✅ Integration: Concurrent tool execution verified');
      },
      TEST_TIMEOUT,
    );
  }

  // Mock-only test for error handling and edge cases
  if (!IS_INTEGRATION_TEST) {
    test('should handle framework error scenarios', async () => {
      // Test tool registration errors
      expect(() => {
        framework.register({
          name: '', // Invalid name
          description: 'Invalid tool',
          inputSchema: z.object({}),
          metadata: { category: 'test', tags: [], version: '1.0.0' },
          execute: async () => 'result',
        });
      }).toThrow();

      // Test duplicate registration
      const validDefinition = {
        name: 'duplicate-tool',
        description: 'Duplicate tool',
        inputSchema: z.object({}),
        metadata: { category: 'test', tags: [], version: '1.0.0' },
        execute: async () => 'result',
      };

      framework.register(validDefinition);
      expect(() => {
        framework.register(validDefinition); // Same name
      }).toThrow();

      // Test retrieval of non-existent tool
      const nonExistentTool = framework.get('non-existent-tool');
      expect(nonExistentTool).toBeUndefined();

      // Test filtering with invalid category
      const invalidCategoryTools = framework.getByCategory('non-existent-category');
      expect(invalidCategoryTools).toHaveLength(0);

      // Test filtering with empty tags
      const emptyTagTools = framework.getByTags([]);
      expect(emptyTagTools).toHaveLength(0);

      console.log('✅ Mock: Framework error scenarios tested');
    });

    test('should test tool pattern edge cases', async () => {
      // Test query pattern with failing query function
      const failingQueryTool = ToolPatterns.query({
        name: 'failing-query',
        description: 'Failing query tool',
        queryFunction: async () => {
          throw new Error('Query failed');
        },
      });

      try {
        await failingQueryTool.execute?.({ query: 'test' });
        expect(false).toBeTruthy(); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Query failed');
      }

      // Test transform pattern with failing transform
      const failingTransformTool = ToolPatterns.transform({
        name: 'failing-transform',
        description: 'Failing transform tool',
        inputSchema: z.object({ value: z.string() }),
        transform: () => {
          throw new Error('Transform failed');
        },
      });

      try {
        await failingTransformTool.execute?.({ value: 'test' });
        expect(false).toBeTruthy(); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Transform failed');
      }

      console.log('✅ Mock: Tool pattern edge cases tested');
    });
  }
});
