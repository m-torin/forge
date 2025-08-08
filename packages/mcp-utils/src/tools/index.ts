/**
 * MCP Utils - Tools Index
 * Exports all MCP tool definitions
 */

// Safe stringify tools
export { legacySafeStringifyTool, safeStringifyTool } from './safe-stringify';

// Agent utility tools
export {
  createEntityNameTool,
  extractObservationTool,
  formatAgentResponseTool,
  validateAgentRequestTool,
} from './agent-utilities';

// Bounded cache tools
export {
  cacheAnalyticsTool,
  cacheCleanupTool,
  cacheOperationTool,
  createBoundedCacheTool,
} from './bounded-cache';

// Async logger tools
export {
  createAsyncLoggerTool,
  logMessageTool,
  loggerManagementTool,
  loggerStatsTool,
} from './async-logger';

// Code analysis tools
export {
  calculateComplexityTool,
  extractExportsTool,
  extractFileMetadataTool,
  extractImportsTool,
} from './code-analysis';

// Session management tools
export {
  closeSessionTool,
  getSessionCacheKeyTool,
  initializeSessionTool,
} from './session-management';

// Retry operation tools
export { getRetryConfigTool, retryOperationHelper } from './retry-operations';

// Simplified tools for agent DRY improvements
export { initSessionTool, retryOperationTool } from './simple-tools';

// Agent utility tools
export { architectureDetectorTool } from './architecture-detector';
export { batchProcessorTool } from './batch-processor';
export { circularDepsTool } from './circular-deps';
export { fileDiscoveryTool } from './file-discovery';
export { fileStreamingTool } from './file-streaming';
export { memoryMonitorTool } from './memory-monitor';
export { pathManagerTool } from './path-manager';

// Workflow orchestration tools
export { workflowOrchestratorTool } from './workflow-orchestrator';

// Security scanning tools
export { securityScannerTool } from './security-scanner';

// Testing tools
export { testRunnerTool } from './test-runner';

// Report generation tools
export { reportGeneratorTool } from './report-generator';

// Code transformation tools
export { codeTransformationTool } from './code-transformation';

// Dependency analysis tools
export { dependencyAnalyzerTool } from './dependency-analyzer';

// New comprehensive MCP tools
export { codeAnalysisTool } from './comprehensive-code-analysis';
export { contextManagerTool } from './context-manager';
export { contextSessionManagerTool } from './context-session-manager';
export { optimizationEngineTool } from './optimization-engine';
export { patternAnalyzerTool } from './pattern-analyzer';
export { performanceObserverTool } from './performance-observer';
export { streamingUtilitiesTool } from './streaming-utilities';
export { structuredCloneTool } from './structured-clone';
export { workerThreadsTool } from './worker-threads';
export { worktreeManagerTool } from './worktree-manager';

// Advanced Memory Management Tools (Node.js 22+ optimized)
export { advancedMemoryMonitorTool } from './advanced-memory-monitor';
export { memoryAwareCacheTool } from './memory-aware-cache';
export { resourceLifecycleManagerTool } from './resource-lifecycle-manager';

// Collect all tools for easy registration
export const ALL_TOOLS = [
  // String utilities
  'safeStringifyTool',
  'legacySafeStringifyTool',

  // Cache utilities
  'createBoundedCacheTool',
  'cacheOperationTool',
  'cacheAnalyticsTool',
  'cacheCleanupTool',

  // Logger utilities
  'createAsyncLoggerTool',
  'logMessageTool',
  'loggerStatsTool',
  'loggerManagementTool',

  // Agent utilities
  'extractObservationTool',
  'createEntityNameTool',
  'validateAgentRequestTool',
  'formatAgentResponseTool',

  // Code analysis tools
  'extractImportsTool',
  'extractExportsTool',
  'calculateComplexityTool',
  'extractFileMetadataTool',

  // Session management tools
  'initializeSessionTool',
  'closeSessionTool',
  'getSessionCacheKeyTool',

  // Retry operation tools
  'getRetryConfigTool',
  'retryOperationHelper',

  // Simplified wrapper tools
  'initSessionTool',
  'retryOperationTool',

  // Agent utility tools
  'memoryMonitorTool',
  'pathManagerTool',
  'architectureDetectorTool',
  'batchProcessorTool',
  'circularDepsTool',
  'fileDiscoveryTool',
  'fileStreamingTool',

  // Workflow orchestration tools
  'workflowOrchestratorTool',

  // Security scanning tools
  'securityScannerTool',

  // Testing tools
  'testRunnerTool',

  // Report generation tools
  'reportGeneratorTool',

  // Code transformation tools
  'codeTransformationTool',

  // Dependency analysis tools
  'dependencyAnalyzerTool',

  // New comprehensive MCP tools
  'contextManagerTool',
  'contextSessionManagerTool',
  'patternAnalyzerTool',
  'codeAnalysisTool',
  'optimizationEngineTool',
  'performanceObserverTool',
  'streamingUtilitiesTool',
  'structuredCloneTool',
  'workerThreadsTool',
  'worktreeManagerTool',

  // Advanced Memory Management Tools
  'advancedMemoryMonitorTool',
  'memoryAwareCacheTool',
  'resourceLifecycleManagerTool',
];
