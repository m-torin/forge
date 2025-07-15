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
export {
  ApplicationAIError,
  createErrorRecovery,
  defaultErrorRecovery,
  handleAIProviderError,
  type AIErrorCode,
  type AIErrorType,
  type ErrorRecoveryStrategy,
  type ErrorSurface,
  type ErrorVisibility,
} from './errors';

// MCP Tools
export * from './mcp';

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
  // Legacy tools
  globalToolRegistry,
  registerDefaultTools,
  registerStandardTools,
  searchTool,
  // AI SDK tools (recommended)
  simpleToolRegistry,
  tool,
  type ToolMetadata as AISDKToolMetadata,
  type ToolMetadata as LegacyToolMetadata,
  type ToolContext,
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

// Embedding Support
export * from './embedding';

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
export * from './document';

// RAG (Retrieval Augmented Generation) - explicit exports to avoid conflicts
export {
  // From enhanced-rag.ts - using aliased exports
  DocumentProcessor,
  RAGService,
  createRAGSystem,
  type DocumentProcessorConfig,
  type ChunkingOptions as RAGChunkingOptions,
  // From types.ts
  type RAGConfig,
  type RAGContext,
  type RAGDocument,
  type DocumentChunk as RAGDocumentChunk,
  type RAGPipeline,
  type RAGResponse,
  type RAGSearchResult,
  type RAGServiceConfig,
} from './rag';

// Streaming utilities
export * from './streaming';

// Artifact/Output handling
export * from './artifacts';

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
