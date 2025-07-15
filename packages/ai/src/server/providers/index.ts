// AI SDK-compliant providers (recommended)
export {
  createAnthropicModel,
  createDeepInfraModel,
  createGoogleModel,
  createModel,
  createModels,
  createOpenAIModel,
  createPerplexityModel,
  createWebSearchGoogleModel,
  // Web Search Agent functions (Pure AI SDK patterns)
  createWebSearchPerplexityModel,
  formatProviderError,
  generateObjectWithConfig,
  generateTextWithConfig,
  streamTextWithConfig,
  validateGenerateOptions,
  webSearchWithGemini,
  webSearchWithPerplexity,
  type GenerateOptions,
  type ModelConfig,
  type ProviderConfig,
} from './ai-sdk-utils';

// Pure Anthropic AI SDK implementation
export {
  analyzeSentiment,
  examples as anthropicExamples,
  createAnthropicProvider,
  createAnthropicWithCaching,
  createAnthropicWithReasoning,
  createBashTool,
  createCachedMessage,
  createComputerTool,
  createTextEditorTool,
  extractCacheMetadata,
  extractEntities,
  extractReasoning,
  moderateContent,
  validateCacheControl,
  type AnthropicGenerateResult,
  type AnthropicModelSettings,
  type AnthropicProviderConfig,
  type AnthropicProviderMetadata,
} from './anthropic';

// AI SDK v5 Provider Registry (Recommended)
export * from './registry';

// Keep existing exports for backward compatibility
export * from './custom-providers';
export * from './model-factory';
export * from './xai-provider';
