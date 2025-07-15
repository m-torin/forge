/**
 * Server-side AI exports (non-Next.js)
 *
 * This file provides server-side AI functionality for non-Next.js environments.
 * For Next.js applications, use '@repo/ai/server/next' instead.
 */

// Server-side exports
export * from './server/index';

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
  createAnthropicWithCaching,
  createAnthropicWithReasoning,
  createBashTool,
  createCachedMessage,
  createComputerTool,
  createDeepInfraModel,
  createGoogleModel,
  // AI SDK utilities
  createModel,
  createModels,
  createOpenAIModel,
  createPerplexityModel,
  createTextEditorTool,
  createWebSearchGoogleModel,
  // Web Search Agent functions (Pure AI SDK patterns)
  createWebSearchPerplexityModel,
  extractCacheMetadata,
  extractEntities,
  extractReasoning,
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
  validateCacheControl,
  validateGenerateOptions,
  webSearchWithGemini,
  webSearchWithPerplexity,
  type AnthropicGenerateResult,
  type AnthropicModelSettings,
  type AnthropicProviderConfig,
  type AnthropicProviderMetadata,
  type GenerateOptions,
  type ModelConfig as ServerModelConfig,
  type ProviderConfig as ServerProviderConfig,
} from './server/providers/index';

export * from './server/streaming/index';
export * from './server/utils/embedding/index';

// Enhanced Vector Operations (existing)
export * from './server/utils/vector/index';

// Enhanced Vector Tools (Feature 1)
export { createVectorTools, type VectorToolsConfig } from './server/tools/vector-tools';

export {
  createNamespaceTools,
  type NamespaceTools,
  type NamespaceToolsConfig,
} from './server/tools/namespace-tools';

export {
  createBulkTools,
  type BulkOperationProgress,
  type BulkTools,
  type BulkToolsConfig,
} from './server/tools/bulk-tools';

export {
  createRangeTools,
  type PaginationState,
  type RangeTools,
  type RangeToolsConfig,
} from './server/tools/range-tools';

export {
  createMetadataTools,
  type MetadataTools,
  type MetadataToolsConfig,
} from './server/tools/metadata-tools';

export {
  streamTextWithVectorContext,
  type VectorStreamConfig,
} from './server/streaming/vector-context';

// Enhanced RAG Workflow (Feature 4)
export {
  VectorRAGWorkflow,
  createRAGWorkflow,
  quickRAG,
  type RAGContext,
  type RAGResponse,
  type RAGWorkflowConfig,
} from './server/core/workflows/vector-rag';

// Vector Analytics (Phase 5.2)
export {
  AnalyticsVectorDB,
  InMemoryVectorAnalytics,
  createAnalyticsVectorDB,
  type VectorAnalytics,
  type VectorMetrics,
  type VectorUsageStats,
} from './server/utils/analytics/vector-analytics';

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
} from './shared/types/vector';

// All exports above provide the complete Upstash Vector AI SDK integration
