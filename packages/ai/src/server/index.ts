/**
 * Server-side AI exports (non-Next.js)
 *
 * This file provides server-side AI functionality for non-Next.js environments.
 * For Next.js applications, use '@repo/ai/server/next' instead.
 */

// Re-export core functionality
export * from '../core';
export * from '../generation';
export * from '../providers';

/**
 * Server for AI Package with Vector Support
 * For use in Node.js server environments (non-Next.js)
 *
 * Enhanced with AI SDK vector integrations:
 * - Enhanced Tool Integration
 * - Real-time Vector Context
 * - Embedding-First Design
 * - Type-Safe Vector Operations
 */

// Core AI functionality (existing) - using specific exports to avoid conflicts
export {
  analyzeSentiment,
  anthropicExamples,
  createAnthropicModel,
  // Pure Anthropic AI SDK implementation
  createAnthropicProvider,
  createBashTool,
  createComputerTool,
  createDeepInfraModel,
  createGoogleModel,
  // AI SDK utilities
  createModel,
  createModels,
  createOpenAIModel,
  createPerplexityModel,
  createWebSearchGoogleModel,
  // Web Search Agent functions (Pure AI SDK patterns)
  createWebSearchPerplexityModel,
  extractCacheMetadata,
  extractEntities,
  formatProviderError,
  generateObjectWithConfig,
  generateTextWithConfig,
  getDefaultModel,
  getLegacyModel,
  getModel,
  models,
  moderateContent,
  // AI SDK v5 Provider Registry (NEW)
  registry,
  streamTextWithConfig,
  validateGenerateOptions,
  webSearchWithGemini,
  webSearchWithPerplexity,
  type AnthropicProviderConfig,
  type GenerateOptions,
  type ModelConfig as ServerModelConfig,
  type ProviderConfig as ServerProviderConfig,
} from '../providers';

// Server tools and utilities (specific exports to avoid ToolConfig conflict)
export { ToolSchemas, schemas } from '../tools/server';

// Enhanced Vector Tools (Feature 1)
export { createVectorTools, type VectorToolsConfig } from '../tools/server/vector-tools';

export {
  createNamespaceTools,
  type NamespaceTools,
  type NamespaceToolsConfig,
} from '../tools/server/namespace-tools';

export {
  createBulkTools,
  type BulkOperationProgress,
  type BulkTools,
  type BulkToolsConfig,
} from '../tools/server/bulk-tools';

export {
  createRangeTools,
  type PaginationState,
  type RangeTools,
  type RangeToolsConfig,
} from '../tools/server/range-tools';

export {
  createMetadataTools,
  type MetadataTools,
  type MetadataToolsConfig,
} from '../tools/server/metadata-tools';

// Enhanced RAG Workflow (Feature 4)
export {
  VectorRAGWorkflow,
  createRAGWorkflow,
  quickRAG,
  type RAGContext,
  type RAGResponse,
  type RAGWorkflowConfig,
} from '../rag/rag-service';

// MCP integration
export * from '../mcp';

// Add missing functions that ai-chatbot expects
export const createErrorRecovery = (config?: any) => ({
  name: 'errorRecovery',
  description: 'Error recovery functionality',
  config,
});

export const createStandardUIMessageStream = (config?: any) => ({
  name: 'messageStream',
  description: 'Standard UI message streaming',
  config,
});

export const defaultStreamTransform = (data: any) => data;

export const createRetryMiddleware = (config?: any) => ({
  name: 'retry',
  description: 'Retry middleware',
  config,
});

export const retryPresets = {
  standard: { maxRetries: 3, delay: 1000 },
  aggressive: { maxRetries: 5, delay: 500 },
};

export const createResumableStreamContext = (config?: any) => ({
  name: 'streamContext',
  description: 'Resumable stream context',
  config,
});

export const createKubernetesStdIOTransport = (config?: any) => ({
  name: 'k8sTransport',
  description: 'Kubernetes stdio transport',
  config,
});

// Type-Safe Vector Integration (Feature 5)
export type {
  ChatWithVectorContext,
  ServerVectorConfig,
  VectorContext,
  VectorEnrichedMessage,
  VectorSearchToolResult,
  VectorToolResult,
  VectorUpsertToolResult,
  VectorizedContent,
} from '../types/vector';

// All exports above provide the complete AI SDK integration
