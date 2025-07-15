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
  extractCacheMetadata,
  extractEntities,
  extractReasoning,
  formatProviderError,
  generateObjectWithConfig,
  generateTextWithConfig,
  moderateContent,
  streamTextWithConfig,
  validateCacheControl,
  validateGenerateOptions,
  webSearchWithGemini,
  webSearchWithPerplexity,
  type AnthropicGenerateResult,
  type AnthropicModelSettings,
  type AnthropicProviderConfig,
  type AnthropicProviderMetadata,
  // type EnhancedGenerateOptions, // Not available in current version
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
export * from './server/core/ai-tools';
export * from './server/mcp';
export * from './server/streaming/resumable';
export * from './server/utils/embedding';
export * from './server/utils/vector';
export * from './shared/tools';

// Error handling exports
export {
  ServerApplicationAIError as ApplicationAIError,
  handleAIProviderError,
} from './server/core/errors/application-errors';

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
} from './server/core/routes/ai-sdk-routes';

// AI SDK-compliant tools (recommended)
export {
  clearMetrics,
  combineTools,
  getMetrics,
  presets,
  ragTools,
  schemas,
  tool,
  tools,
  type ToolConfig,
  type ToolDefinition,
  type ToolsInput,
} from './server/tools/simple-tools';

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
} from './server/rag/rag-service';

// Vector configuration
export {
  DEFAULT_VECTOR_CONFIG,
  VECTOR_CONFIG,
  createVectorConfig,
} from './server/utils/vector/config';

// Export all new AI utilities for Next.js
export * from './server/providers/custom-providers';
export * from './server/tools/factory-simple';
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
