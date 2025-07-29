// Server exports

// Provider exports - AI SDK compliant only
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
  type ModelConfig as AISDKModelConfig,
  type ProviderConfig as AISDKProviderConfig,
  type AnthropicGenerateResult,
  type AnthropicModelSettings,
  type AnthropicProviderConfig,
  type AnthropicProviderMetadata,
  type EnhancedGenerateOptions,
} from './providers';

export * from './utils';

// Error handling - specific exports to avoid conflicts
export { ApplicationAIError, handleAIProviderError } from './errors';

// Error recovery from middleware
export {
  createErrorRecovery,
  defaultErrorRecovery,
  type RetryStrategy,
} from './middleware/error-recovery';

// MCP Tools
export * from './mcp';

// MCP specific exports for convenience
export {
  createMCPToolsForStreamText,
  createMCPToolsWithDefaults,
  createMCPToolsWithStreamLifecycle,
  testMCPConnectivity,
} from './mcp/next-pattern';

// Tools - specific exports to avoid conflicts
export {
  SimpleToolRegistry,
  ToolRegistry,
  createDocumentTool as aiSdkCreateDocumentTool,
  weatherTool as aiSdkWeatherTool,
  calculatorTool,
  combineTools,
  commonSchemas,
  createAPITool,
  createSecureTool,
  createStreamingTool,
  createToolFactory,
  createToolSet,
  createToolsFromRegistry,
  getAllTools,
  getToolsByCategory,
  getToolsByTags,
  /** @deprecated Legacy tool registry - use AI SDK v5 tools instead */
  globalToolRegistry,
  /** @deprecated Legacy tool registration - use AI SDK v5 tools instead */
  registerDefaultTools,
  registerStandardTools,
  searchTool,
  // AI SDK tools (recommended)
  simpleToolRegistry,
  tool,
  type ToolMetadata as AISDKToolMetadata,
  /** @deprecated Use AISDKToolMetadata instead */
  type ToolMetadata as LegacyToolMetadata,
  type ToolWithMetadata,
} from './tools';

// AI Tools and Agents
export * from './ai-tools';

// AI SDK Tools - specific exports to avoid conflicts
export {
  createSecureTools,
  createSecureToolsForAI,
  createTools,
  createToolsForAI,
  type SafeToolsConfig,
  type ToolsConfig,
} from '../shared/tools';

// Embedding Support - v5 Enhanced
export * from './embedding';
// v5 Enhanced embedding utilities
export {
  EnhancedEmbeddingManager,
  createEnhancedEmbeddingManager,
  enhancedEmbedding,
  type EnhancedEmbeddingOptions,
} from './embedding/enhanced-utils';

// Vector Database Support
export * from './vector';

// Enhanced Upstash Vector with AI SDK integration
export {
  AISDKRag,
  quickRAG as aiSdkQuickRAG,
  ragQuery as aiSdkRagQuery,
  createRAGChatHandler as createAISDKRAGChatHandler,
  createAISDKRagFromEnv,
} from './rag/ai-sdk-rag';
export * from './vector/ai-sdk-integration';

// Document Processing
// NOTE: Document loaders use Node.js fs/promises and should be imported separately if needed
// export * from './document';

// RAG (Retrieval Augmented Generation) - comprehensive enhanced implementation
export {
  // Complete RAG system
  createCompleteRAG,
  createProductionRAG,
  // Core RAG functionality
  createRAGDatabaseBridge,
  createRAGDatabaseBridgeFromEnv,
  createRAGMiddleware,
  createRAGMiddlewareFromEnv,
  createStructuredRAG,
  initializeRAGDegradation,
  initializeRAGHealthMonitoring,
  // Enhanced features
  ragCircuitBreakerRegistry,
  ragRetry,
  // Schemas for structured responses
  ragSchemas,
  type BaseRAGResponse,
  type CompleteRAGConfig,
  type RAGDatabaseBridge,
  // Types
  type RAGDatabaseConfig,
  type StructuredRAGConfig,
} from './rag';

// Streaming utilities
export * from './streaming';

// Next.js streaming utilities
export {
  streamObjectGeneration,
  streamTextGeneration,
  type StreamHandler,
  type StreamObjectConfig,
  type StreamTextConfig,
} from './next/streaming-transformations';

// Artifact/Output handling
export * from './artifacts';

// AI SDK v5 Structured Data Generation
export * from './generation';
export {
  CommonSchemas,
  StructuredDataGenerator,
  StructuredUtils,
  createStructuredGenerator,
  quickGenerate,
} from './generation/structured-data';

// AI SDK v5 Advanced Middleware
export {
  RetryError,
  cacheUtils,
  cachingMiddleware,
  createCachingMiddleware,
  createLoggingMiddleware,
  createRetryMiddleware,
  loggingMiddleware,
  retryPresets,
  retryUtils,
  type CacheEntry,
  type CachingOptions,
  type LoggingOptions,
  type RetryConfig,
  type RetryInfo,
} from './middleware';

// Model selection utilities - specific exports to avoid conflicts
export {
  ModelCapabilityDetection,
  ModelFallbackStrategy,
  ModelSelector,
  createModelSelector,
  type ModelCapabilities,
  type ModelMetadata,
  type ModelSelectionCriteria,
  type UserEntitlements,
} from './models';

// AI SDK v5 Provider Registry
export { getDefaultModel, getLegacyModel, getModel, models, registry } from './providers/registry';

// AI SDK v5 Enhanced Lifecycle Hooks
export {
  LifecycleManager,
  chainHooks,
  createLifecycleManager,
  createLifecycleWrapper,
  lifecyclePresets,
  wrapModelWithLifecycle,
  type CompletionHookContext,
  type ErrorHookContext,
  type GenerationHookContext,
  type GenerationHookResult,
  type LifecycleContext,
  type LifecycleHooks,
  type ToolCallHookContext,
} from './lifecycle';

// AI SDK v5 Media Generation
export {
  ImageGenerationManager,
  createImageGenerator,
  imageGenerators,
  imageUtils,
  quickImage,
  type ImageGenerationOptions,
  type ImageGenerationResult,
} from './media/image-generation';

export {
  SpeechManager,
  TranscriptionManager,
  audioUtils,
  createSpeechManager,
  createTranscriptionManager,
  quickAudio,
  type SpeechGenerationOptions,
  type SpeechResult,
  type TranscriptionOptions,
  type TranscriptionResult,
} from './media/audio-processing';

// AI SDK v5 Experimental Features
export {
  OutputProcessor,
  enhancedGeneration,
  outputProcessors,
  outputSchemas,
  type EnhancedOutputResult,
  type OutputTransformConfig,
  type StreamingOutputProcessor,
} from './experimental';
