/**
 * AI Combined Package - DRY helpers only
 * Following package philosophy: "DRY helper functions that reduce boilerplate without adding complexity"
 *
 * Only exports helpers that eliminate repeated patterns across the monorepo
 * Single-use configurations should be inline in consuming code
 */

// === CORE UTILITIES ===
// Core DRY configuration fragments (used 3+ times across monorepo)
export { chatFragments, outputStrategyFragments, structuredFragments } from './core/fragments';

// Registry exports (centralized model access)
export {
  models,
  registry,
  type EmbeddingModelId,
  type LanguageModelId,
} from './providers/registry';

// Shared constants and utilities
export {
  TEMPS,
  TOKENS,
  TOP_P,
  commonModes,
  type CommonMode,
  type TemperaturePreset,
  type TokenPreset,
  type TopPPreset,
} from './providers/shared';

// === TOOLS & UTILITIES ===
// Standard AI SDK v5 tools for common operations
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
} from './tools/standard';

// Error handling and MCP helpers
export { executeToolSafely, executeWithFallback } from './tools/errors';

export { checkMCPConnection, createMCPTool } from './tools/mcp';

// Tool patterns (consolidates multiple pattern files)
export { commonTemplates, createToolTemplate, getAvailablePatterns } from './tools/patterns';

// Multi-step execution helper
export { executeMultiStep, streamMultiStep } from './core/multi-step';

// === ANTHROPIC PROVIDER ===
// Core provider and unique capabilities
export {
  ANTHROPIC_MODEL_CAPABILITIES,
  ANTHROPIC_MODEL_GROUPS,
  // Constants and types
  ANTHROPIC_MODEL_IDS,
  ANTHROPIC_PRESETS,
  anthropic,
  anthropicTools,
  extractProviderMetadata as extractAnthropicMetadata,
  extractCacheMetadata,
  // Response processing
  extractReasoningDetails,
  extractToolErrors,
  getMaxContextTokens as getAnthropicMaxContextTokens,
  getCacheMinTokens,
  isReasoningModel as isAnthropicReasoningModel,
  isMultimodalModel,
  supportsWebSearch as supportsAnthropicWebSearch,
  supportsCodeExecution,
  supportsComputerUse,
  supportsPDF,
  // Capability detection
  supportsReasoning,
  withCacheControl,
  withComputerUse,
  withExtendedCache,
  withPDFSupport,
  // Unique Anthropic features (reasoning, cache control, PDF, computer use)
  withReasoning,
  withSendReasoning,
  type AnthropicMetadata,
  type ModelCapabilities as AnthropicModelCapabilities,
  type AnthropicProviderOptions,
  type CacheMetadata,
  type ReasoningDetails,
  type ToolError,
} from './providers/anthropic';

// === OPENAI PROVIDER ===
// Core provider and unique features
export {
  // Constants and types
  OPENAI_MODEL_IDS,
  OPENAI_PRESETS,
  createOpenAI,
  extractOpenAIMetadata,
  // Response processing
  extractReasoningTokens,
  openai,
  supportsPromptCaching,
  // Capability detection
  supportsReasoningMode,
  supportsServiceTier,
  supportsStructuredOutputs,
  withPredictedOutput,
  withPromptCache,
  withReasoningMode,
  withServiceTier,
  withStrictMode,
  // Unique OpenAI features
  withStructuredOutput,
  type OpenAIMetadata,
} from './providers/openai';

// === GOOGLE PROVIDER ===
// Core provider and unique features (thinking, safety, multimodal)
export {
  GOOGLE_MODEL_CAPABILITIES,
  GOOGLE_MODEL_GROUPS,
  // Constants and types
  GOOGLE_MODEL_IDS,
  GOOGLE_MULTIMODAL_PRESETS,
  GOOGLE_PRESETS,
  GOOGLE_SAFETY_PRESETS,
  createGoogleGenerativeAI,
  // Response processing
  extractGoogleMetadata,
  extractSafetyRatings,
  extractThinkingDetails,
  google,
  googleTools,
  isGemmaModel,
  supportsCodeExecution as supportsGoogleCodeExecution,
  supportsGoogleSearch,
  supportsImageGeneration,
  supportsImplicitCaching,
  supportsMultimodal,
  // Capability detection
  supportsThinking,
  supportsUrlContext,
  withEmbeddingConfig,
  withGoogleImageGeneration,
  withResponseModalities,
  withSafetySettings,
  withStructuredOutputs,
  // Unique Google features
  withThinking,
  withYouTubeContext,
  type GoogleMetadata,
  type SafetyRating,
  type ThinkingDetails,
} from './providers/google';

// === XAI GROK PROVIDER ===
// Core provider and unique features (live search, reasoning effort)
export {
  GROK_MODEL_GROUPS,
  // Constants and types
  GROK_MODEL_IDS,
  createXai,
  // Response processing
  extractSources as extractGrokSources,
  extractSearchMetadata,
  grok,
  grokImage,
  isVisionModel as isGrokVisionModel,
  isReasoningEffortModel,
  supportsImageGeneration as supportsGrokImageGeneration,
  supportsVision as supportsGrokVision,
  // Capability detection
  supportsLiveSearch,
  supportsReasoningEffort,
  withReasoningEffort,
  // Unique xAI features (live search, reasoning effort)
  withSearchParameters,
  withSearchSources,
  type GrokModelCapabilities,
  type WebSearchSource,
  type XAISearchMetadata,
  type XAISource,
  type XSearchSource,
} from './providers/grok';

// === PERPLEXITY PROVIDER ===
// Core provider and unique features (citations, images, research)
export {
  PERPLEXITY_MODEL_GROUPS,
  // Constants and types
  PERPLEXITY_MODEL_IDS,
  extractImages,
  extractProviderMetadata,
  // Response processing
  extractSources,
  extractUsageMetadata,
  isReasoningModel,
  isResearchModel,
  perplexity,
  supportsCitations,
  // Capability detection
  supportsImageResponses,
  supportsWebSearch,
  // Unique Perplexity features
  withImages,
  withResearchMode,
  type PerplexityImage,
  type PerplexityMetadata,
  type PerplexitySource,
  type PerplexityUsageMetadata,
} from './providers/perplexity';

// === SPECIALIZED PROVIDERS ===
// LM Studio (local models)
export {
  LM_STUDIO_DEFAULTS,
  createLMStudio,
  lmstudio,
  type LMStudioConfig,
} from './providers/lm-studio';

// Claude Code (community provider)
export {
  CLAUDE_CODE_MODEL_IDS,
  claudeCode,
  createClaudeCode,
  supportsExtendedThinking,
  type ClaudeCodeConfig,
} from './providers/claude-code';

// === GATEWAY PROVIDERS ===
// Cloudflare AI Gateway (infrastructure proxy)
export {
  CLOUDFLARE_AI_GATEWAY_DEFAULTS,
  createAiGateway,
  extractCloudflareMetadata,
  withCaching,
  withRetryStrategy,
  type CloudflareAiGatewayConfig,
  type CloudflareMetadata,
} from './providers/cloudflare-ai-gateway';

// Vercel AI Gateway (unified API)
export {
  VERCEL_GATEWAY_MODEL_PRESETS,
  createVercelAiGateway,
  discoverModels,
  extractGatewayMetadata,
  findBalancedModels,
  vercelAiGateway,
  withAppAttribution,
  withCostLimit,
  withGatewayRouting,
  withModelVariant,
  type VercelAiGatewayConfig,
} from './providers/vercel-ai-gateway';

// === GENERATION FUNCTIONS ===
// Object and structured data generation
export {
  commonSchemas,
  generateArray,
  generateCommon,
  generateEnum,
  generateNoSchema,
  generateObject,
  streamArray,
  streamObject,
  streamObjectWithPartials,
} from './generation/object';

// Text and stream generation
export {
  StreamProcessor,
  generateText,
  generateTextWithStructuredOutput,
  streamText,
  streamTextWithFullStream,
  streamTextWithStructuredOutput,
} from './generation/text';

export { processFullStream, streamText as streamTextAlt } from './generation/stream';

export { Chat } from './generation/chat';

// === UI COMPONENTS ===
// React components and hooks
export { ChatContainer, MessageList, StatusIndicator, useChat } from './ui/react';

// === ESSENTIAL TYPES ===
export type {
  AIOperationConfig,
  AIOperationResult,
  ArrayGenerationResult,
  ChatConfig,
  ChatResult,
  EnumGenerationResult,
  NoSchemaGenerationResult,
  ObjectGenerationResult,
  StructuredDataConfig,
} from './core/types';
