/**
 * Server-side AI exports for Next.js
 *
 * This file provides server-side AI functionality specifically for Next.js applications.
 */

import 'server-only';

// Next.js specific functionality

// Next.js server exports (extends server) - excluding conflicting types
// Server exports - AI SDK compliant only
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
  enhancedGenerateObject,
  enhancedGenerateText,
  enhancedStreamText,
  extractCacheMetadata,
  extractEntities,
  extractReasoning,
  formatProviderError,
  moderateContent,
  validateCacheControl,
  validateGenerateOptions,
  webSearchWithGemini,
  webSearchWithPerplexity,
  type AnthropicGenerateResult,
  type AnthropicModelSettings,
  type AnthropicProviderConfig,
  type AnthropicProviderMetadata,
  type EnhancedGenerateOptions,
  type ModelConfig as NextServerModelConfig,
} from './server';

// Standard Chat Provider (required by ai-chatbot)
export {
  createStandardChatProvider,
  type StandardChatProviderConfig,
} from './server/providers/standard-chat-provider';

// Streaming utilities (required by ai-chatbot)
export {
  createEmptyDataStream,
  createRestoredDataStream,
  createResumableDataStream,
  createResumableStreamContext,
  getStreamContext,
  initializeStreamContext,
  resetStreamContext,
  type ResumableStreamConfig,
  type ResumableStreamContext,
  type ResumableStreamStorage,
} from './server/streaming/resumable-streams';
export * from './shared/middleware';

// Additional exports needed by ai-chatbot
export * from './server/ai-tools';
export * from './server/embedding';
export * from './server/mcp';
export * from './server/streaming/resumable';
export * from './server/vector';
export * from './shared/tools';

// AI SDK-compliant route helpers (recommended)
export {
  createAIRoutes,
  createChatRoute,
  createGenerateRoute,
  createObjectRoute,
  createStreamRoute,
  createVectorChatRoute,
  setupAIRoutes,
  type AIRouteConfig,
} from './server/routes/ai-sdk-routes';

// AI SDK-compliant tools (recommended)
export {
  SimpleToolRegistry,
  calculatorTool,
  createDocumentTool,
  createToolSet,
  getAllTools,
  getToolsByCategory,
  getToolsByTags,
  registerStandardTools,
  searchTool,
  simpleToolRegistry,
  weatherTool,
  type ToolMetadata as SimpleToolMetadata,
  type ToolWithMetadata,
} from './server/tools/ai-sdk-tools';

// Enhanced RAG exports - explicit to avoid conflicts
export {
  DocumentProcessor,
  RAGService,
  createRAGSystem,
  type ChunkingOptions,
  type DocumentChunk,
  type DocumentProcessorConfig,
  type RAGContext,
  type RAGServiceConfig,
} from './server/rag/enhanced-rag';

// Vector configuration
export { DEFAULT_VECTOR_CONFIG, VECTOR_CONFIG, createVectorConfig } from './server/vector/config';

// Export all new AI utilities for Next.js
export * from './server/providers/custom-providers';
export * from './server/tools/factory';
export * from './server/tools/weather';
export * from './server/utils';

// Next.js specific streaming utilities
export * from './server/streaming/resumable';

// Security tools exports
export {
  createDefaultComputerTool,
  createSecureBashTool,
  createSecureTextEditorTool,
} from './shared/tools';
export type { SafeToolsConfig, SecurityConfig } from './shared/tools';

// Shared utilities
export * from './shared/streaming/data-stream';
export * from './shared/utils/messages';
export * from './shared/utils/perplexity-config';
export * from './shared/utils/schema-generation';
export * from './shared/utils/test-factory';

// UI utilities - loading messages
export * from './shared/ui/loading-messages';

// Shared models - use explicit exports to avoid naming conflicts
export {
  ANTHROPIC_MODELS,
  ANTHROPIC_MODEL_METADATA,
  getModelCapabilities as getAnthropicModelCapabilities,
  isImageInputModel as isAnthropicImageInputModel,
  isObjectGenerationModel as isAnthropicObjectGenerationModel,
  isToolUsageModel as isAnthropicToolUsageModel,
  isComputerToolsModel,
  isPDFSupportedModel,
  isReasoningModel,
} from './shared/models/anthropic';

export {
  PERPLEXITY_MODELS,
  PERPLEXITY_MODEL_METADATA,
  getModelCapabilities as getPerplexityModelCapabilities,
  isImageInputModel as isPerplexityImageInputModel,
  isObjectGenerationModel as isPerplexityObjectGenerationModel,
  isToolStreamingModel as isPerplexityToolStreamingModel,
  isToolUsageModel as isPerplexityToolUsageModel,
} from './shared/models/perplexity';

export {
  DEEPINFRA_MODELS,
  getModelCapabilities as getDeepInfraModelCapabilities,
  isImageInputModel as isDeepInfraImageInputModel,
  isObjectGenerationModel as isDeepInfraObjectGenerationModel,
  isToolStreamingModel as isDeepInfraToolStreamingModel,
  isToolUsageModel as isDeepInfraToolUsageModel,
} from './shared/models/deep-infra';

export * from './shared/models/openai-compatible';
export * from './shared/models/xai';

// Shared middleware
export * from './shared/middleware/reasoning';

/**
 * Next.js Server for AI Package with Vector Support
 * For use in Next.js API routes, server components, and middleware
 *
 * Enhanced with AI SDK vector integrations:
 * - Next.js API route handlers
 * - Server components integration
 * - Edge runtime support
 */
