/**
 * Integration tests for package exports and imports
 */
import { describe, expect } from 'vitest';

// Test direct imports from different export paths
describe('package Exports Integration', () => {
  describe('main exports', () => {
    test('should import utility functions from main export', async () => {
      const { safeStringify, extractObservation } = await import('../../src/index');

      expect(safeStringify).toBeTypeOf('function');
      expect(extractObservation).toBeTypeOf('function');

      // Test functionality
      const result = safeStringify({ test: 'value' });
      expect(result).toBe('{"test":"value"}');

      const entity = { observations: ['key:value'] };
      const extracted = extractObservation(entity, 'key');
      expect(extracted).toBe('value');
    });

    test('should import tool definitions from main export', async () => {
      const { safeStringifyTool, extractObservationTool } = await import('../../src/index');

      expect(safeStringifyTool).toBeDefined();
      expect(safeStringifyTool.name).toBe('safe_stringify');
      expect(safeStringifyTool.execute).toBeTypeOf('function');

      expect(extractObservationTool).toBeDefined();
      expect(extractObservationTool.name).toBe('extract_observation');
      expect(extractObservationTool.execute).toBeTypeOf('function');
    });

    test('should import registry classes from main export', async () => {
      const {
        globalCacheRegistry,
        globalLoggerRegistry,
        BoundedCache,
        CacheRegistry,
        AsyncLogger,
        LoggerRegistry,
      } = await import('../../src/index');

      expect(globalCacheRegistry).toBeDefined();
      expect(globalLoggerRegistry).toBeDefined();
      expect(BoundedCache).toBeTypeOf('function');
      expect(CacheRegistry).toBeTypeOf('function');
      expect(AsyncLogger).toBeTypeOf('function');
      expect(LoggerRegistry).toBeTypeOf('function');
    });

    test('should import ALL_TOOLS array', async () => {
      const { ALL_TOOLS } = await import('../../src/index');

      expect(ALL_TOOLS).toBeInstanceOf(Array);
      expect(ALL_TOOLS.length).toBeGreaterThan(0);
      expect(ALL_TOOLS).toContain('safeStringifyTool');
      expect(ALL_TOOLS).toContain('extractObservationTool');
    });
  });

  describe('tools export path', () => {
    test('should import tools from /tools export', async () => {
      const tools = await import('../../src/tools/index');

      expect(tools.safeStringifyTool).toBeDefined();
      expect(tools.extractObservationTool).toBeDefined();
      expect(tools.createBoundedCacheTool).toBeDefined();
      expect(tools.createAsyncLoggerTool).toBeDefined();
      expect(tools.ALL_TOOLS).toBeDefined();
    });

    test('should import specific tool modules', async () => {
      const { safeStringifyTool } = await import('../../src/tools/safe-stringify');
      const { extractObservationTool } = await import('../../src/tools/agent-utilities');
      const { createBoundedCacheTool } = await import('../../src/tools/bounded-cache');
      const { createAsyncLoggerTool } = await import('../../src/tools/async-logger');

      expect(safeStringifyTool.name).toBe('safe_stringify');
      expect(extractObservationTool.name).toBe('extract_observation');
      expect(createBoundedCacheTool.name).toBe('create_bounded_cache');
      expect(createAsyncLoggerTool.name).toBe('create_async_logger');
    });
  });

  describe('utils export path', () => {
    test('should import utilities from specific modules', async () => {
      const { safeStringify } = await import('../../src/utils/stringify');
      const { extractObservation } = await import('../../src/utils/agent-helpers');
      const { BoundedCache } = await import('../../src/utils/cache');
      const { AsyncLogger } = await import('../../src/utils/logger');

      expect(safeStringify).toBeTypeOf('function');
      expect(extractObservation).toBeTypeOf('function');
      expect(BoundedCache).toBeTypeOf('function');
      expect(AsyncLogger).toBeTypeOf('function');
    });
  });

  describe('cross-module compatibility', () => {
    test('should work with different import styles', async () => {
      // Named imports
      const { safeStringify: named } = await import('../../src/index');

      // Module import
      const module = await import('../../src/utils/stringify');
      const fromModule = module.safeStringify;

      // Both should be the same function
      expect(named).toBe(fromModule);

      // Both should work identically
      const testObj = { test: 'value' };
      expect(named(testObj)).toBe(fromModule(testObj));
    });

    test('should maintain singleton registry instances', async () => {
      const { globalCacheRegistry: global1 } = await import('../../src/index');
      const { globalCacheRegistry: global2 } = await import('../../src/utils/cache');

      expect(global1).toBe(global2);

      // Test functionality is shared
      global1.create('test-cache');
      expect(global2.get('test-cache')).toBeDefined();
    });
  });

  describe('type definitions', () => {
    test('should export TypeScript types', async () => {
      const types = await import('../../src/index');

      // Type exports don't have runtime values, but we can check the module structure
      expect(types).toBeDefined();

      // Test that imported types can be used (would fail at compile time if types missing)
      const entity: typeof types.MCPEntity = { observations: ['test:value'] };
      expect(entity.observations).toBeDefined();
    });
  });

  describe('functional integration', () => {
    test('should demonstrate end-to-end utility usage', async () => {
      const {
        safeStringify,
        extractObservation,
        createEntityName,
        globalCacheRegistry,
        globalLoggerRegistry,
      } = await import('../../src/index');

      // Create test data
      const testData = {
        session: 'integration-test',
        results: ['success', 'pending'],
        metadata: { timestamp: Date.now() },
      };

      // Test stringify
      const stringified = safeStringify(testData);
      expect(stringified).toContain('integration-test');

      // Test entity handling
      const entity = { observations: ['session:integration-test', 'status:success'] };
      const sessionId = extractObservation(entity, 'session');
      expect(sessionId).toBe('integration-test');

      // Test entity name creation
      const entityName = createEntityName('AnalysisSession', sessionId!);
      expect(entityName).toBe('AnalysisSession_integration-test');

      // Test cache integration
      const cache = globalCacheRegistry.create('integration-cache');
      cache.set('test-data', testData);
      expect(cache.get('test-data')).toStrictEqual(testData);

      // Test logger integration
      const logger = globalLoggerRegistry.create('integration-session', {
        sessionId: 'integration-session',
        logLevel: 'info',
      });
      expect(logger).toBeDefined();

      // Cleanup
      globalCacheRegistry.delete('integration-cache');
      await globalLoggerRegistry.close('integration-session');
    });

    test('should handle tool execution integration', async () => {
      const { safeStringifyTool, extractObservationTool } = await import('../../src/index');

      // Test tool execution
      const stringifyResult = await safeStringifyTool.execute({
        obj: { integration: 'test' },
        prettify: true,
      });

      expect(stringifyResult.content).toHaveLength(1);
      const parsed = JSON.parse(stringifyResult.content[0].text);
      expect(parsed.result).toContain('integration');

      // Test extraction tool
      const extractResult = await extractObservationTool.execute({
        entity: { observations: ['key:value'] },
        key: 'key',
      });

      const extractParsed = JSON.parse(extractResult.content[0].text);
      expect(extractParsed.value).toBe('value');
    });
  });
});
