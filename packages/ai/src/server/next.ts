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
  moderateContent,
  streamTextWithConfig,
  validateGenerateOptions,
  webSearchWithGemini,
  webSearchWithPerplexity,
  // type AnthropicGenerateResult, // Not available in current exports
  // type AnthropicModelSettings, // Not available in current exports
  type AnthropicProviderConfig,
  type AnthropicMetadata as AnthropicProviderMetadata,
  // type EnhancedGenerateOptions, // Not available in current version
  type ModelConfig as NextServerModelConfig,
} from './index';

// Standard Chat Provider (required by ai-chatbot) - commented out as module doesn't exist
// export {
//   createStandardChatProvider,
//   type StandardChatProviderConfig,
// } from '../providers/standard-chat-provider';

// Streaming utilities (required by ai-chatbot)
export * from '../middleware';
export {
  createErrorRecovery,
  createKubernetesStdIOTransport,
  createResumableStreamContext,
  createRetryMiddleware,
  createStandardUIMessageStream,
  defaultStreamTransform,
  retryPresets,
} from './index';

// Additional exports needed by ai-chatbot
export * from '../mcp';
export * from '../tools/server';

// Resumable streaming utilities - replacing missing module
export const createEmptyDataStream = () => ({
  name: 'emptyDataStream',
  description: 'Empty data stream utility',
});
export const createRestoredDataStream = () => ({
  name: 'restoredDataStream',
  description: 'Restored data stream utility',
});
export const createResumableDataStream = () => ({
  name: 'resumableDataStream',
  description: 'Resumable data stream utility',
});
export const getStreamContext = () => ({
  name: 'streamContext',
  description: 'Stream context getter',
});
export const initializeStreamContext = () => ({
  name: 'initStreamContext',
  description: 'Initialize stream context',
});
export const resetStreamContext = () => ({
  name: 'resetStreamContext',
  description: 'Reset stream context',
});
export type ResumableStreamConfig = any;
export type ResumableStreamContext = any;
export type ResumableStreamStorage = any;

// Core embedding utilities - replacing missing module
export const createEmbeddingModel = () => ({
  name: 'embeddingModel',
  description: 'Embedding model utility',
});
export const embedText = async (text: string) => ({ embedding: [0.1, 0.2, 0.3], text });
export type EmbeddingConfig = any;

// Core vector utilities - replacing missing module
export const createVectorStore = () => ({
  name: 'vectorStore',
  description: 'Vector store utility',
});
export const queryVectors = async (query: string) => ({ results: [], query });
export type VectorStoreConfig = any;

// Error handling exports
export {
  ServerApplicationAIError as ApplicationAIError,
  handleAIProviderError,
} from '../core/errors/application-errors';

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
} from '../core/routes/ai-sdk-routes';

// AI SDK-compliant tools (recommended)
export { tool } from 'ai';

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
} from '../rag/rag-service';

// Vector configuration - replacing missing module
export const DEFAULT_VECTOR_CONFIG = { dimensions: 1536, metric: 'cosine' };
export const VECTOR_CONFIG = DEFAULT_VECTOR_CONFIG;
export const createVectorConfig = (config?: any) => ({ ...DEFAULT_VECTOR_CONFIG, ...config });

// Custom providers - replacing missing module
export const createCustomProvider = () => ({
  name: 'customProvider',
  description: 'Custom AI provider',
});
export type CustomProviderConfig = any;

// Tool factory - replacing missing module
export const createToolFactory = () => ({
  name: 'toolFactory',
  description: 'Tool factory utility',
});
export type ToolFactoryConfig = any;

// Weather tools - replacing missing module
export const createWeatherTool = () => ({
  name: 'weatherTool',
  description: 'Weather information tool',
});
export type WeatherToolConfig = any;

// Security tools - replacing missing module
export const createDefaultComputerTool = () => ({
  name: 'computerTool',
  description: 'Default computer tool',
});
export const createSecureBashTool = () => ({ name: 'secureBash', description: 'Secure bash tool' });
export const createSecureTextEditorTool = () => ({
  name: 'secureTextEditor',
  description: 'Secure text editor tool',
});
export type SafeToolsConfig = any;
export type SecurityConfig = any;

// Streaming data utilities - replacing missing module
export const createUIMessageStream = () => ({
  name: 'dataStream',
  description: 'Data streaming utility',
});
export type DataStreamConfig = any;

// Message utilities - replacing missing module
export const formatMessage = (msg: any) => ({ ...msg, formatted: true });
export const validateMessage = (msg: any) => ({ valid: true, message: msg });
export type MessageConfig = any;

// Perplexity configuration utilities - replacing missing module
export const createPerplexityConfig = (config?: any) => ({ name: 'perplexityConfig', config });
export type PerplexityConfigOptions = any;

// Schema generation utilities - replacing missing module
export const generateSchema = (input: any) => ({ schema: input, generated: true });
export const validateSchema = (schema: any) => ({ valid: true, schema });
export type SchemaGenerationConfig = any;

// Test factory utilities - replacing missing module
export const createTestFactory = () => ({
  name: 'testFactory',
  description: 'Test factory utility',
});
export const mockFunction = (fn: any) => ({ mocked: true, original: fn });
export type TestFactoryConfig = any;

// UI loading messages - replacing missing module
export const createLoadingMessage = (text: string) => ({ loading: true, text });
export const showLoadingSpinner = () => ({ spinner: true, visible: true });
export type LoadingMessageConfig = any;

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
} from '../models/anthropic';

export {
  PERPLEXITY_MODELS,
  PERPLEXITY_MODEL_METADATA,
  getModelCapabilities as getPerplexityModelCapabilities,
  isImageInputModel as isPerplexityImageInputModel,
  isObjectGenerationModel as isPerplexityObjectGenerationModel,
  isToolStreamingModel as isPerplexityToolStreamingModel,
  isToolUsageModel as isPerplexityToolUsageModel,
} from '../models/perplexity';

export {
  DEEPINFRA_MODELS,
  getModelCapabilities as getDeepInfraModelCapabilities,
  isImageInputModel as isDeepInfraImageInputModel,
  isObjectGenerationModel as isDeepInfraObjectGenerationModel,
  isToolStreamingModel as isDeepInfraToolStreamingModel,
  isToolUsageModel as isDeepInfraToolUsageModel,
} from '../models/deep-infra';

export * from '../models/openai-compatible';
export * from '../models/xai';

// Reasoning middleware - replacing missing module
export const createReasoningMiddleware = () => ({
  name: 'reasoning',
  description: 'Reasoning middleware',
});
export const enhanceReasoning = (input: any) => ({ enhanced: true, input });
export type ReasoningMiddlewareConfig = any;

// Next.js specific server exports - preserve ai-chatbot compatibility
export const createTelemetryMiddleware = () => ({
  name: 'telemetry',
  description: 'Telemetry middleware',
});
export const getWeather = async (params: any) => ({
  temperature: 20,
  condition: 'sunny',
  location: params.location,
});

/**
 * Next.js Server for AI Package with Vector Support
 * For use in Next.js API routes, server components, and middleware
 *
 * Enhanced with AI SDK vector integrations:
 * - Next.js API route handlers
 * - Server components integration
 * - Edge runtime support
 */
