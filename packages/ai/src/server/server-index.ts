/**
 * Server-side exports for @repo/ai
 * Simplified to include only existing modules
 */

// Core provider exports that actually exist
export { getDefaultModel, models, registry } from '../providers/registry';

// Core utilities that actually exist
export {
  calculateCost,
  formatUsage,
  generateOperationId,
  isRetryableError,
  mergeConfigs,
  messageUtils,
  retryWithBackoff,
  validateConfig,
} from '../core/utils';

// Shared constants that actually exist
export { TEMPS, TOKENS, TOP_P, commonModes } from '../providers/shared';

// Tool utilities that actually exist
export { createBaseAITool, type BaseToolConfig } from '../shared/tool-base';

// Common schemas that actually exist
export {
  commonSchemas,
  compositeSchemas,
  extendSchema,
  makeArray,
  makeOptional,
} from '../shared/common-schemas';

// Generation functions that actually exist
export {
  StreamProcessor,
  generateText,
  generateTextWithStructuredOutput,
  streamText,
  streamTextWithFullStream,
  streamTextWithStructuredOutput,
} from '../generation/text';

// MCP tools that actually exist
export * from '../mcp';

// Error handling utilities that actually exist
export { executeToolSafely, executeWithFallback } from '../tools/errors';

export { checkMCPConnection, createMCPTool } from '../tools/mcp';

// Standard tools that actually exist
export {
  authCheckTool,
  commonToolSets,
  databaseQueryTool,
  fileSystemTool,
  getStandardToolsByCategory,
  httpRequestTool,
  sendEmailTool,
  standardTools,
  toolCategories,
  trackEventTool,
  webSearchTool,
} from '../tools/standard';

// Tool patterns that actually exist
export { commonTemplates, createToolTemplate, getAvailablePatterns } from '../tools/patterns';

// Multi-step execution that actually exists
export { executeMultiStep, streamMultiStep } from '../core/multi-step';

// Middleware (placeholders) that exist
export { cache, compose, rateLimit, telemetry } from '../middleware';

// === TODO: Future server-side modules ===
// The following would be implemented as server-side modules are created:

// TODO: Agent framework
// export * from './agents';

// TODO: RAG utilities
// export * from './rag';

// TODO: Vector database support
// export * from './vector';

// TODO: Streaming utilities
// export * from './streaming';

// TODO: Media processing
// export * from './media';

// TODO: Advanced middleware
// export * from './advanced-middleware';

// TODO: Lifecycle hooks
// export * from './lifecycle';

// TODO: Prompt templates
// export * from './prompts';
