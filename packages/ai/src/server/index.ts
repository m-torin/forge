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
  type ModelConfig as AISDKModelConfig,
  type ProviderConfig as AISDKProviderConfig,
  type AnthropicGenerateResult,
  type AnthropicModelSettings,
  type AnthropicProviderConfig,
  type AnthropicProviderMetadata,
  type GenerateOptions,
} from './providers';

export * from './utils';

// Error handling - specific exports to avoid conflicts
export {
  ServerApplicationAIError as ApplicationAIError,
  handleAIProviderError,
} from './core/errors';

// Error recovery from middleware
export {
  createErrorRecovery,
  defaultErrorRecovery,
  type RetryStrategy,
} from './core/middleware/error-recovery';

// MCP Tools
export * from './mcp';

// MCP specific exports for convenience
export {
  createMCPToolsForStreamText,
  createMCPToolsWithDefaults,
  createMCPToolsWithStreamLifecycle,
  testMCPConnectivity,
} from './mcp/next-pattern';

// Bridge function for chat app compatibility
export async function createMCPToolsForStreamTextCompat(configs: any[]): Promise<{
  tools: Record<string, any>;
  clients: any[];
  closeAllClients: () => Promise<void>;
}> {
  try {
    const { createMCPToolsFromConfigs } = await import('./mcp/client');
    return createMCPToolsFromConfigs(configs, { gracefulDegradation: true });
  } catch {
    // Fallback to tools if MCP client unavailable
    const { createMCPToolset } = await import('./tools');
    const tools = await createMCPToolset({ autoDiscover: true });
    return { tools, clients: [], closeAllClients: async () => {} };
  }
}

// Tools - AI SDK v5 compatible exports
export {
  // Core tool registry (available)
  ToolRegistry,
  // Available tool implementations
  createDocumentTool as aiSdkCreateDocumentTool,
  weatherTool as aiSdkWeatherTool,
  combineTools,
  createToolsFromRegistry,
  globalToolRegistry,
  // Core AI SDK v5 patterns
  tool,
  // Tool metadata types
  type ToolMetadata,
} from './tools';

// AI SDK v5 core tool function - re-export from ai package
export { tool as createTool } from 'ai';

// AI Tools and Agents
export * from './core/ai-tools';

// System Tools (bash, editor, computer) - renamed to avoid conflicts
export {
  createSecureSystemTools,
  createSecureToolsForAI as createSecureSystemToolsForAI,
  /** @deprecated Use createSecureSystemTools instead */
  createSecureTools as createSecureSystemToolsLegacy,
  createSystemTools,
  createToolsForAI as createSystemToolsForAI,
  // Legacy exports for backwards compatibility
  /** @deprecated Use createSystemTools instead */
  createTools as createSystemToolsLegacy,
  type ToolsConfig as SystemToolsConfig,
  type SafeToolsConfig as SystemToolsSafeConfig,
} from '../shared/tools';

// Embedding Support - v5 Enhanced
export * from './utils/embedding';
// v5 Enhanced embedding utilities
export {
  EnhancedEmbeddingManager,
  createEnhancedEmbeddingManager,
  embeddingUtils,
  type EnhancedEmbeddingOptions,
} from './utils/embedding/embedding-utils';

// Vector Database Support
export * from './utils/vector';

// Enhanced Upstash Vector with AI SDK integration
export {
  AISDKRag,
  quickRAG as aiSdkQuickRAG,
  ragQuery as aiSdkRagQuery,
  createRAGChatHandler as createAISDKRAGChatHandler,
  createAISDKRagFromEnv,
} from './rag/ai-sdk-rag';
export * from './utils/vector/ai-sdk-integration';

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
} from './core/next/streaming-transformations';

// Artifact/Output handling
export * from './core/artifacts';

// AI SDK v5 Structured Data Generation
export * from './core/generation';
export {
  CommonSchemas,
  StructuredDataGenerator,
  StructuredUtils,
  createStructuredGenerator,
  quickGenerate,
} from './core/generation/structured-data';

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
} from './core/middleware';

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
} from './core/models';

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
} from './core/lifecycle';

// AI SDK v5 Media Generation
export {
  ImageGenerationManager,
  createImageGenerator,
  imageGenerators,
  imageUtils,
  quickImage,
  type ImageGenerationOptions,
  type ImageGenerationResult,
} from './utils/media/image-generation';

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
} from './utils/media/audio-processing';

// AI SDK v5 Experimental Features
export {
  OutputProcessor,
  generation,
  outputProcessors,
  outputSchemas,
  type OutputResult,
  type OutputTransformConfig,
  type StreamingOutputProcessor,
} from './core/experimental';

// AI SDK v5 Agent Framework - Core
export * from './agents';

// Agent Framework - specific exports for convenience
export {
  customCondition,
  hasError,
  hasToolCall,
  maxTotalTokens,
  needsClarification,
  stepCountAtLeast,
  stepCountAtMost,
  stepCountIs,
  stopWhenPresets,
  taskComplete,
  textContains,
  type StepCondition,
} from './agents/step-conditions';

export {
  agentControlPresets,
  combinePrepareStepCallbacks,
  createAgentControlStrategy,
  // Agent controls
  createModelSwitchingPrepareStep,
  createSystemPromptPrepareStep,
  createTemperatureAdjustingPrepareStep,
  createToolForcingPrepareStep,
  createToolLimitingPrepareStep,
  type AgentControlConfig,
  type PrepareStepCallback,
  type PrepareStepContext,
  type PrepareStepResult,
} from './agents/agent-controls';

export {
  // Multi-step execution
  executeMultiStepAgent,
  executeParallelAgents,
  executeSequentialAgents,
  multiStepPatterns,
  streamMultiStepAgent,
  type MultiStepConfig,
  type MultiStepResult,
} from './agents/multi-step-execution';

export {
  // Agent orchestration
  AgentOrchestrator,
  globalAgentOrchestrator,
  workflowPatterns,
  type AgentDefinition,
  type WorkflowContext,
  type WorkflowDefinition,
  type WorkflowExecutionResult,
  type WorkflowNode,
} from './agents/agent-orchestrator';

export {
  agentPatternMetadata,
  agentPatterns,
  createAnalysisAgent,
  createCodeGenerationAgent,
  createCommunicationAgent,
  createMultiAgentSystem,
  createPlanningAgent,
  createProblemSolvingAgent,
  // Agent patterns
  createResearchAgent,
  createValidationAgent,
  getRecommendedAgentPattern,
} from './agents/agent-patterns';

export {
  // Agent utilities
  AgentExecutor,
  AgentPerformanceAnalyzer,
  AgentValidator,
  agentUtils,
  globalAgentExecutor,
  type AgentExecutionContext,
  type AgentExecutionOptions,
  type AgentMetrics,
} from './agents/agent-utilities';

// Advanced Agent Features - Memory Management
export {
  AgentMemoryManager,
  createMemoryAwareAgent,
  memoryUtils,
  type AgentMemoryConfig,
  type AgentStateSnapshot,
  type MemoryConsolidationStrategy,
  type MemoryEntry,
  type MemoryEntryType,
  type MemorySearchResult,
} from './agents/agent-memory';

// Advanced Agent Features - Communication
export {
  AgentCommunicationManager,
  communicationUtils,
  createCommunicationAwareAgent,
  globalCommunicationManager,
  type AgentCapability,
  type AgentMessage,
  type AgentMessageType,
  type AgentStatus,
  type CommunicationChannel,
  type CoordinationProtocol,
  type CoordinationTask,
  type MessagePriority,
} from './agents/agent-communication';

// Advanced Agent Features - Tool Management
export {
  AdvancedToolManager,
  advancedToolUtils,
  createBuiltInTools,
  globalAdvancedToolManager,
  type ToolMetadata as AdvancedToolMetadata,
  type DynamicToolLoader,
  type ToolExecutionContext,
  type ToolExecutionResult,
  type ToolPerformanceMetrics,
  type ToolSelectionCriteria,
} from './agents/advanced-tool-management';

// Advanced Agent Features - Observability
export {
  AgentObservabilityManager,
  createObservableAgent,
  debugUtils,
  globalObservabilityManager,
  type AgentDebugContext,
  type AgentHealthStatus,
  type AgentMonitoringConfig,
  type AgentPerformanceSnapshot,
  type AgentTraceEvent,
  type AgentTraceEventType,
} from './agents/agent-observability';

// Advanced Agent Features - Configuration Templates
export {
  AgentConfigurationBuilder,
  AgentTemplateRegistry,
  agentConfigurationTemplates,
  configurationUtils,
  globalTemplateRegistry,
  type AgentComplexity,
  type AgentConfigurationTemplate,
  type AgentUseCase,
  type DeploymentEnvironment,
} from './agents/agent-configuration-templates';

// Prompt Management System
export * from './prompts';
export {
  // Cache
  PromptCache,
  globalPromptCache,
  promptCachePatterns,
  withPromptCache,
  type PromptCacheConfig,
  type PromptCacheEntry,
} from './prompts/prompt-cache';

export {
  // Templates
  PromptTemplateRegistry,
  commonTemplates,
  createPromptTemplate,
  globalTemplateRegistry as globalPromptTemplateRegistry,
  templateComposition,
  type PromptTemplate,
} from './prompts/prompt-templates';

export {
  DynamicPromptGenerator,
  // Composition
  PromptComposer,
  createPrompt,
  prompt,
  promptCompositionPatterns,
  type PromptComponent,
} from './prompts/prompt-composition';

export {
  // Versioning
  PromptVersionManager,
  globalVersionManager,
  versioningPatterns,
  type PromptVersion,
  type PromptVersioningConfig,
} from './prompts/prompt-versioning';

export {
  // Optimization
  PromptOptimizer,
  optimizationStrategies,
  type OptimizationResult,
  type PromptOptimizationConfig,
} from './prompts/prompt-optimization';

// Advanced Streaming
export * from './streaming/advanced';
export {
  // Stream Data
  EnhancedStreamData,
  createStreamingResponseWithData,
  streamDataPatterns,
  streamDataUtils,
} from './streaming/advanced/stream-data';

export {
  // Stream Metadata
  MetadataStream,
  createMetadataTransformer,
  metadataPatterns,
  type StreamMetadata,
} from './streaming/advanced/stream-metadata';

export {
  ResumableStreamManager,
  // Stream Interruption
  StreamInterruptionController,
  createGracefulShutdown,
  createInterruptibleStream,
  globalStreamManager,
  interruptionPatterns,
} from './streaming/advanced/stream-interruption';

export {
  // Backpressure
  BackpressureController,
  backpressurePatterns,
  createBackpressureTransform,
  type BackpressureConfig,
} from './streaming/advanced/backpressure';
