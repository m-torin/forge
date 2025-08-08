/**
 * MCP Utils Server Implementation
 * Provides MCP server for claude-utils tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Import cleanup utilities statically to avoid dynamic import vulnerabilities
import { globalAdvancedMemoryMonitor } from './tools/advanced-memory-monitor';
import { globalResourceLifecycleManager } from './tools/resource-lifecycle-manager';
import { cleanupAllSessions } from './tools/test-runner';
import { globalCacheRegistry } from './utils/cache';
import { createEnhancedMCPErrorResponse } from './utils/error-handling';
import { globalLoggerRegistry } from './utils/logger';
import { globalPerformanceMonitor } from './utils/performance';
import { destroyGlobalWorkerPool } from './utils/worker-pool';

// Import centralized lifecycle management
import { CLEANUP_PRIORITIES, registerCleanupHandler } from './runtime/lifecycle';

// Import all tools
import {
  // Advanced Memory Management Tools
  advancedMemoryMonitorTool,
  architectureDetectorTool,
  batchProcessorTool,
  cacheAnalyticsTool,
  cacheCleanupTool,
  cacheOperationTool,
  calculateComplexityTool,
  circularDepsTool,
  codeAnalysisTool,
  codeTransformationTool,
  // New comprehensive MCP tools
  contextManagerTool,
  contextSessionManagerTool,
  // Logger utilities
  createAsyncLoggerTool,
  // Cache utilities
  createBoundedCacheTool,
  createEntityNameTool,
  dependencyAnalyzerTool,
  extractExportsTool,
  extractFileMetadataTool,
  // Code analysis tools
  extractImportsTool,
  // Agent utilities
  extractObservationTool,
  fileDiscoveryTool,
  fileStreamingTool,
  formatAgentResponseTool,
  // Simple wrapper tools
  initSessionTool,
  legacySafeStringifyTool,
  logMessageTool,
  loggerManagementTool,
  loggerStatsTool,
  memoryAwareCacheTool,
  // New agent utility tools
  memoryMonitorTool,
  optimizationEngineTool,
  pathManagerTool,
  patternAnalyzerTool,
  performanceObserverTool,
  reportGeneratorTool,
  resourceLifecycleManagerTool,
  // String utilities
  safeStringifyTool,
  securityScannerTool,
  streamingUtilitiesTool,
  structuredCloneTool,
  testRunnerTool,
  validateAgentRequestTool,
  workerThreadsTool,
  workflowOrchestratorTool,
  worktreeManagerTool,
} from './tools';

// Map tool names to their implementations
const TOOL_MAP = {
  safe_stringify: safeStringifyTool,
  legacy_safe_stringify: legacySafeStringifyTool,
  create_bounded_cache: createBoundedCacheTool,
  cache_operation: cacheOperationTool,
  cache_analytics: cacheAnalyticsTool,
  cache_cleanup: cacheCleanupTool,
  create_async_logger: createAsyncLoggerTool,
  log_message: logMessageTool,
  logger_stats: loggerStatsTool,
  logger_management: loggerManagementTool,
  extract_observation: extractObservationTool,
  create_entity_name: createEntityNameTool,
  validate_agent_request: validateAgentRequestTool,
  format_agent_response: formatAgentResponseTool,
  // Code analysis tools
  extract_imports: extractImportsTool,
  extract_exports: extractExportsTool,
  calculate_complexity: calculateComplexityTool,
  extract_file_metadata: extractFileMetadataTool,
  // Session tools
  init_session: initSessionTool,

  // New agent utility tools
  memory_monitor: memoryMonitorTool,
  path_manager: pathManagerTool,
  architecture_detector: architectureDetectorTool,
  batch_processor: batchProcessorTool,
  file_discovery: fileDiscoveryTool,
  file_streaming: fileStreamingTool,
  workflow_orchestrator: workflowOrchestratorTool,
  security_scanner: securityScannerTool,
  test_runner: testRunnerTool,
  report_generator: reportGeneratorTool,
  code_transformation: codeTransformationTool,
  dependency_analyzer: dependencyAnalyzerTool,

  // New comprehensive MCP tools
  context_manager: contextManagerTool,
  context_session_manager: contextSessionManagerTool,
  pattern_analyzer: patternAnalyzerTool,
  code_analysis: codeAnalysisTool,
  optimization_engine: optimizationEngineTool,
  performance_observer: performanceObserverTool,
  streaming_utilities: streamingUtilitiesTool,
  structured_clone: structuredCloneTool,
  worker_threads: workerThreadsTool,
  worktree_manager: worktreeManagerTool,

  // Advanced Memory Management Tools
  advanced_memory_monitor: advancedMemoryMonitorTool,
  memory_aware_cache: memoryAwareCacheTool,
  resource_lifecycle_manager: resourceLifecycleManagerTool,

  // Code Quality Tools
  circular_deps: circularDepsTool,
} as const;

export default class MCPUtilsServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'claude-utils',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // Handle tools/list request
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = Object.entries(TOOL_MAP).map(([name, tool]) => ({
        name,
        description: tool.description || `MCP utility tool: ${name}`,
        inputSchema: tool.inputSchema || {
          type: 'object',
          properties: {},
          required: [],
        },
      }));

      return { tools };
    });

    // Handle tools/call request
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      const tool = TOOL_MAP[name as keyof typeof TOOL_MAP];
      if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        // Execute the tool with provided arguments
        const result = await (tool as any).execute(args || {});

        // If tool returns MCP format already, return it
        if (result && typeof result === 'object' && 'content' in result) {
          return result;
        }

        // Otherwise, wrap the result in MCP format
        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result),
            },
          ],
        };
      } catch (error) {
        // Use enhanced error response for consistency
        return createEnhancedMCPErrorResponse(error, name, {
          contextInfo: `Tool execution for ${name}`,
        });
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Log to stderr to avoid interfering with stdio transport
    console.error(`MCP Utils server running (v1.0.0)`);
    console.error(`Available tools: ${Object.keys(TOOL_MAP).length}`);

    // Register cleanup handlers for graceful shutdown
    this.registerCleanupHandlers();
  }

  private registerCleanupHandlers() {
    // Register server cleanup with centralized lifecycle management
    registerCleanupHandler(
      'mcp-server-cleanup',
      async () => {
        console.error('MCP Utils server shutting down, cleaning up resources...');
        try {
          // Use statically imported cleanup functions for security
          await cleanupAllSessions();

          // Cleanup monitoring and management systems
          globalPerformanceMonitor?.dispose();
          globalAdvancedMemoryMonitor?.dispose();
          globalResourceLifecycleManager?.stopMonitoring();

          // Cleanup worker pools
          await destroyGlobalWorkerPool();

          // Cleanup logging and caching
          await globalLoggerRegistry.closeAll();
          globalCacheRegistry.cleanup(true);

          console.error('MCP server resource cleanup completed');
        } catch (error) {
          console.error('Error during MCP server cleanup:', error);
        }
      },
      CLEANUP_PRIORITIES.CRITICAL_RESOURCES,
    );
  }
}
