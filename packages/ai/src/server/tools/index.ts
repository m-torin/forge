/**
 * AI SDK Tools Index
 * Centralized exports for all Vercel AI SDK tools
 * Following best practices for tool organization and discovery
 */

// NEW SIMPLIFIED API (RECOMMENDED) - Start here!
export {
  clearMetrics,
  combineTools,
  getMetrics,
  presets,
  ragTools,
  schemas,
  tool,
  tools,
  type APIToolConfig,
  type SecureToolConfig,
  type StreamingToolConfig,
  type ToolConfig,
  type ToolDefinition,
  type ToolsInput,
  type ToolsOptions,
} from './simple-tools';

// Previous simplified API (still supported but more complex)
export * from './tools';
export { tools as createToolsAdvanced } from './tools';

// Unified Tool Registry (for advanced use cases)
export * from './tool-registry';

// Simple tool factories for AI SDK v5 (avoid ToolContext conflict)
export { createSimpleTool, type SimpleToolContext } from './factory-simple';

export { Tool } from './execution-framework';
export * from './specifications';
export * from './types';

export type {
  ToolDefinition as ExecutionToolDefinition,
  ToolMetadata as ExecutionToolMetadata,
  ToolExecutionContext,
  ToolSecurityConfig,
} from './execution-framework';

// Tool implementations
export {
  createDocumentTool,
  searchDocumentsTool,
  updateDocumentTool,
} from './implementations/document';
export { weatherTool } from './implementations/weather';

// Vector tools (Upstash Vector specific)
export {
  createBulkTools,
  type BulkOperationProgress,
  type BulkTools,
  type BulkToolsConfig,
} from './bulk-tools';
export {
  createMetadataTools,
  type MetadataTools,
  type MetadataToolsConfig,
} from './metadata-tools';
export {
  createNamespaceTools,
  type NamespaceTools,
  type NamespaceToolsConfig,
} from './namespace-tools';
export {
  createRangeTools,
  type PaginationState,
  type RangeTools,
  type RangeToolsConfig,
} from './range-tools';
export { createVectorTools, type VectorToolsConfig } from './vector-tools';

/**
 * Legacy weather tool export for backward compatibility
 * @deprecated Use weatherTool from './implementations/weather' instead
 */
export { getWeather } from './weather';

// Agentic tool patterns for multi-step workflows
export {
  AgenticPatterns,
  StepHistoryTracker,
  StoppingConditions,
  agenticTool,
  commonAgenticTools,
  createAgentWorkflow,
  type AgentLifecycleHooks,
  type AgentStepContext,
  type AgenticToolConfig,
  type MultiStepWorkflowConfig,
} from './agentic-tools';

// Tool repair mechanisms for handling imperfect model outputs
export {
  createRepairableTool,
  inputSanitizers as repairInputSanitizers,
  repairPresets,
  repairStrategies,
  repairToolCall,
  repairableTools,
  type RepairAttemptContext,
  type RepairFailureContext,
  type RepairResult,
  type RepairStrategy,
  type RepairSuccessContext,
  type ToolRepairConfig,
} from './tool-repair';

// Language model middleware as tools for guardrails, caching, and logging
export {
  caches,
  contentFilters,
  createMiddlewareTool,
  loggers,
  middlewarePresets,
  middlewareTools,
  rateLimiters,
  type MiddlewareConfig,
  type MiddlewareContext,
  type MiddlewareResult,
  type MiddlewareType,
} from './middleware-tools';

// Enhanced MCP integration as tools with latest client patterns
export {
  MCPToolManager,
  commonMCPServers,
  createMCPToolset,
  createServerToolset,
  mcpHealthTool,
  mcpToolManager,
  type MCPConnectionStatus,
  type MCPServerConfig,
  type MCPToolContext,
  type MCPToolDefinition,
} from './mcp-tools';

// Tool execution validation and error recovery patterns
export {
  createValidatedTool,
  errorClassifiers,
  getExecutionMetrics,
  getToolMetrics,
  recoveryPresets,
  resetMetrics,
  validatedTools,
  inputSanitizers as validationInputSanitizers,
  validationPresets,
  validators,
  type ErrorRecoveryConfig,
  type ErrorRecoveryStrategy,
  type ToolExecutionMetrics,
  type ToolValidationConfig,
  type ValidationLevel,
  type ValidationResult,
} from './validated-tools';

// Tool result streaming and progressive disclosure
export {
  cleanupStreamingSessions,
  createStreamingTool,
  getActiveStreamingSessions,
  streamingExamples,
  streamingUtils,
  type ProgressInfo,
  type StreamingToolConfig as StreamToolConfig,
  type StreamingChunk,
  type StreamingResultType,
  type StreamingToolContext,
} from './streaming-tools';

// Anthropic Computer Use Tools
export * from './computer-use';
export {
  // Constants
  COMPUTER_USE_TOOL_NAMES,
  bashToolPatterns,
  combinePresets as combineComputerUsePresets,
  // Patterns
  computerToolPatterns,
  computerUsePatterns,
  // Presets
  computerUsePresets,
  createBashTool,
  // Main functions
  createComputerTool,
  createComputerUseTools,
  createCustomPreset as createCustomComputerUsePreset,
  createSecureComputerUseTools,
  createTextEditorTool,
  getComputerUsePreset,
  textEditorPatterns,
  type BashToolConfig,
  type BashToolInput,
  // Types
  type ComputerToolConfig,
  type ComputerToolInput,
  type ComputerUseToolsConfig,
  type TextEditorConfig,
  type TextEditorInput,
} from './computer-use';

// Code Quality Analysis Tools - Temporarily disabled for build issues
// TODO: Re-enable after fixing mcp-utils bundling issues
/*
export {
  // Individual tools
  analysisTool,
  // Workflows
  codeQualityWorkflow,
  createCodeQualityWorkflow,
  fileDiscoveryTool,
  patternDetectionTool,
  prCreationTool,
  reportGenerationTool,
  vercelOptimizationTool,
  workflowPresets,
  worktreeTool,
  // Types
  type CodeQualityConfig,
  type CodeQualitySession,
  type CodeQualityWorkflowConfig,
} from './code-quality';
*/
