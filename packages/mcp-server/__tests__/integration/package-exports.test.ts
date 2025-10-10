import { describe, expect, vi } from 'vitest';

const stubTool = (name: string) => ({
  name,
  description: `${name} stub`,
  inputSchema: { type: 'object', properties: {} },
  async execute() {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true }),
        },
      ],
    };
  },
});

vi.mock('@repo/core-utils', () => {
  const server = {
    batchProcessorTool: stubTool('batch_processor'),
    fileDiscoveryTool: stubTool('file_discovery'),
    fileStreamingTool: stubTool('file_streaming'),
    pathManagerTool: stubTool('path_manager'),
    calculateComplexityTool: stubTool('calculate_complexity'),
    extractExportsTool: stubTool('extract_exports'),
    extractFileMetadataTool: stubTool('extract_file_metadata'),
    extractImportsTool: stubTool('extract_imports'),
    patternAnalyzerTool: stubTool('pattern_analyzer'),
    architectureDetectorTool: stubTool('architecture_detector'),
    dependencyAnalyzerTool: stubTool('dependency_analyzer'),
    circularDepsTool: stubTool('circular_deps'),
    memoryMonitorTool: stubTool('memory_monitor'),
    advancedMemoryMonitorTool: stubTool('advanced_memory_monitor'),
    memoryAwareCacheTool: stubTool('memory_aware_cache'),
    workflowOrchestratorTool: stubTool('workflow_orchestrator'),
    worktreeManagerTool: stubTool('worktree_manager'),
    resourceLifecycleManagerTool: stubTool('resource_lifecycle_manager'),
    initializeSessionTool: stubTool('initialize_session'),
    closeSessionTool: stubTool('close_session'),
    getSessionCacheKeyTool: stubTool('get_session_cache_key'),
    contextSessionManagerTool: stubTool('context_session_manager'),
    reportGeneratorTool: stubTool('report_generator'),
    optimizationEngineTool: stubTool('optimization_engine'),
    structuredCloneTool: stubTool('structured_clone'),
  };

  return { server };
});

describe('package exports integration', () => {
  describe('main exports', () => {
    test('exposes core utilities and config loader', async () => {
      const { safeStringify, createEntityName, loadConfig } = await import('../../src/index');

      const json = safeStringify({ hello: 'world' });
      expect(json).toBe('{"hello":"world"}');

      const entityName = createEntityName('AnalysisSession', 'session-123');
      expect(entityName).toBe('AnalysisSession_session-123');

      const config = loadConfig({ serverName: 'integration-test', transports: ['stdio'] });
      expect(config.serverName).toBe('integration-test');
      expect(config.transports).toStrictEqual(['stdio']);
    });

    test('exposes tool definitions', async () => {
      const { safeStringifyTool, reportGeneratorTool, workflowOrchestratorTool } = await import(
        '../../src/index'
      );

      expect(safeStringifyTool.name).toBe('safe_stringify');
      expect(typeof safeStringifyTool.execute).toBe('function');

      expect(reportGeneratorTool.name).toBe('report_generator');
      expect(workflowOrchestratorTool.name).toBe('workflow_orchestrator');
    });

    test('exposes registry singletons', async () => {
      const { globalCacheRegistry, globalLoggerRegistry, BoundedCache, AsyncLogger } = await import(
        '../../src/index'
      );

      expect(globalCacheRegistry).toBeDefined();
      expect(globalLoggerRegistry).toBeDefined();
      expect(typeof BoundedCache).toBe('function');
      expect(typeof AsyncLogger).toBe('function');
    });

    test('provides ALL_TOOLS listing', async () => {
      const { ALL_TOOLS } = await import('../../src/index');

      expect(Array.isArray(ALL_TOOLS)).toBeTruthy();
      expect(ALL_TOOLS).toContain('safe_stringify');
      expect(ALL_TOOLS).toContain('workflow_orchestrator');
      expect(ALL_TOOLS).toContain('report_generator');
    });
  });

  describe('targeted imports', () => {
    test('supports direct tool imports', async () => {
      const { safeStringifyTool } = await import('../../src/tools/safe-stringify');
      const { workflowOrchestratorTool } = await import('../../src/tools/index');

      expect(safeStringifyTool.name).toBe('safe_stringify');
      expect(workflowOrchestratorTool.name).toBe('workflow_orchestrator');
    });

    test('supports utility imports', async () => {
      const { safeStringify } = await import('../../src/utils/stringify');
      const { BoundedCache } = await import('../../src/utils/cache');
      const { AsyncLogger } = await import('../../src/utils/logger');

      expect(typeof safeStringify).toBe('function');
      expect(typeof BoundedCache).toBe('function');
      expect(typeof AsyncLogger).toBe('function');
    });
  });

  describe('singleton behaviour', () => {
    test('shares logger registry across modules', async () => {
      const { globalLoggerRegistry: registryA } = await import('../../src/index');
      const { globalLoggerRegistry: registryB } = await import('../../src/utils/logger');

      expect(registryA).toBe(registryB);

      const logger = registryA.create('singleton-test', { sessionId: 'singleton-test' });
      expect(registryB.get('singleton-test')).toBe(logger);
      await registryA.close('singleton-test');
    });
  });

  describe('functional workflows', () => {
    test('stringifies payloads via tool execution', async () => {
      const { safeStringifyTool } = await import('../../src/tools/safe-stringify');

      const result = await safeStringifyTool.execute({
        obj: { integration: 'test' },
        prettify: true,
        includeMetadata: true,
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.result).toContain('integration');
      expect(typeof parsed.truncated).toBe('boolean');
    });
  });
});
