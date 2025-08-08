/**
 * Unified Model Registry
 * Single source of truth for all model configurations across providers
 * Consolidates model metadata, aliases, and provider mappings
 */

import {
  ANTHROPIC_MODEL_METADATA,
  GOOGLE_MODEL_METADATA,
  OPENAI_COMPATIBLE_MODEL_METADATA,
  OPENAI_MODEL_METADATA,
  PERPLEXITY_MODEL_METADATA,
  XAI_MODEL_METADATA,
  type ModelCapability,
  type ModelMetadata,
  type ReasoningConfig,
} from './metadata';

// Provider-specific model configurations
export interface ProviderModelConfig {
  id: string;
  actualModelId: string;
  provider: string;
  metadata: ModelMetadata;
}

// Unified model registry interface
export interface ModelRegistry {
  // All available models by ID
  models: Record<string, ProviderModelConfig>;

  // Models grouped by provider
  providers: Record<string, ProviderModelConfig[]>;

  // Model aliases (for backward compatibility)
  aliases: Record<string, string>;

  // Capability-based model groups
  capabilities: Record<ModelCapability, ProviderModelConfig[]>;
}

/**
 * Model aliases for convenience
 */
export const MODEL_ALIASES = {
  // Convenience aliases
  'claude-4-opus': 'claude-4-opus-20250514',
  'claude-4-sonnet': 'claude-4-sonnet-20250514',
  'claude-3-7-sonnet': 'claude-3-7-sonnet-20250219',
  'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku': 'claude-3-5-haiku-20241022',
  // Legacy aliases for backward compatibility
  'claude-chat': 'claude-4-sonnet-20250514',
  'claude-reasoning': 'claude-4-opus-20250514',
  'claude-title': 'claude-3-5-haiku-20241022',
} as const;

/**
 * Provider model mappings with actual model IDs
 */
const PROVIDER_MODELS: Record<string, Record<string, string>> = {
  anthropic: {
    // Claude 4 models
    'claude-4-opus-20250514': 'claude-4-opus-20250514',
    'claude-4-sonnet-20250514': 'claude-4-sonnet-20250514',
    // Claude 3.7 models
    'claude-3-7-sonnet-20250219': 'claude-3-7-sonnet-20250219',
    // Claude 3.5 models
    'claude-3-5-sonnet-20241022': 'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620': 'claude-3-5-sonnet-20240620',
    'claude-3-5-haiku-20241022': 'claude-3-5-haiku-20241022',
  },
  perplexity: {
    // Search models
    sonar: 'llama-3.1-sonar-small-128k-online',
    'sonar-pro': 'llama-3.1-sonar-large-128k-online',
    'sonar-deep-research': 'sonar-deep-research',
    // Reasoning models
    'sonar-reasoning': 'sonar-reasoning',
    'sonar-reasoning-pro': 'sonar-reasoning-pro',
    // Offline models
    'r1-1776': 'r1-1776',
    // Additional models
    'llama-3.1-sonar-small-128k-online': 'llama-3.1-sonar-small-128k-online',
    'llama-3.1-sonar-large-128k-online': 'llama-3.1-sonar-large-128k-online',
  },
  xai: {
    // Grok 2 models
    'grok-2-1212': 'grok-2-1212',
    'grok-2-vision-1212': 'grok-2-vision-1212',
    'grok-2': 'grok-2',
    // Grok 3 models
    'grok-3-mini': 'grok-3-mini',
    'grok-3-mini-reasoning': 'grok-3-mini-reasoning',
  },
  google: {
    'gemini-1.5-pro-latest': 'gemini-1.5-pro-latest',
    'gemini-1.5-flash': 'gemini-1.5-flash',
    'gemini-2.0-flash-exp': 'gemini-2.0-flash-exp',
  },
  openai: {
    'gpt-4o': 'gpt-4o',
    'gpt-4o-mini': 'gpt-4o-mini',
    'o1-preview': 'o1-preview',
    'o1-mini': 'o1-mini',
  },
};

/**
 * Build the unified model registry
 */
function buildModelRegistry(): ModelRegistry {
  const models: Record<string, ProviderModelConfig> = {};
  const providers: Record<string, ProviderModelConfig[]> = {};
  const capabilities: Record<ModelCapability, ProviderModelConfig[]> = {
    reasoning: [],
    vision: [],
    tools: [],
    'computer-use': [],
    'pdf-support': [],
    search: [],
    code: [],
    multimodal: [],
  };

  // Helper to add model to registry
  const addModel = (
    id: string,
    actualModelId: string,
    provider: string,
    metadata: ModelMetadata,
  ) => {
    const config: ProviderModelConfig = {
      id,
      actualModelId,
      provider,
      metadata,
    };

    models[id] = config;

    // Group by provider
    if (!providers[provider]) {
      providers[provider] = [];
    }
    providers[provider].push(config);

    // Group by capabilities
    if (metadata.capabilities) {
      metadata.capabilities.forEach(capability => {
        capabilities[capability].push(config);
      });
    }
  };

  // Add Anthropic models
  Object.entries(ANTHROPIC_MODEL_METADATA).forEach(([id, metadata]) => {
    const actualModelId = PROVIDER_MODELS.anthropic[id] || id;
    addModel(id, actualModelId, 'anthropic', metadata);
  });

  // Add Perplexity models
  Object.entries(PERPLEXITY_MODEL_METADATA).forEach(([id, metadata]) => {
    const actualModelId = PROVIDER_MODELS.perplexity[id] || id;
    addModel(id, actualModelId, 'perplexity', metadata);
  });

  // Add XAI models
  Object.entries(XAI_MODEL_METADATA).forEach(([id, metadata]) => {
    const actualModelId = PROVIDER_MODELS.xai[id] || id;
    addModel(id, actualModelId, 'xai', metadata);
  });

  // Add Google models
  Object.entries(GOOGLE_MODEL_METADATA).forEach(([id, metadata]) => {
    const actualModelId = PROVIDER_MODELS.google[id] || id;
    addModel(id, actualModelId, 'google', metadata);
  });

  // Add OpenAI models
  Object.entries(OPENAI_MODEL_METADATA).forEach(([id, metadata]) => {
    const actualModelId = PROVIDER_MODELS.openai[id] || id;
    addModel(id, actualModelId, 'openai', metadata);
  });

  // Add OpenAI-compatible models (LMStudio, Ollama, DeepSeek)
  Object.entries(OPENAI_COMPATIBLE_MODEL_METADATA).forEach(([id, metadata]) => {
    const provider = id.includes('lmstudio')
      ? 'lmstudio'
      : id.includes('ollama')
        ? 'ollama'
        : id.includes('deepseek')
          ? 'deepseek'
          : 'openai-compatible';
    addModel(id, id, provider, metadata);
  });

  return {
    models,
    providers,
    aliases: MODEL_ALIASES,
    capabilities,
  };
}

/**
 * The unified model registry - single source of truth
 */
export const MODEL_REGISTRY = buildModelRegistry();

/**
 * Utility functions for working with the model registry
 */

/**
 * Get model configuration by ID (supports aliases)
 */
export function getModelConfig(modelId: string): ProviderModelConfig | null {
  // Check aliases first
  const resolvedId = MODEL_REGISTRY.aliases[modelId] || modelId;
  return MODEL_REGISTRY.models[resolvedId] || null;
}

/**
 * Get all models for a specific provider
 */
export function getModelsByProvider(provider: string): ProviderModelConfig[] {
  return MODEL_REGISTRY.providers[provider] || [];
}

/**
 * Get models by capability
 */
export function getModelsByCapability(capability: ModelCapability): ProviderModelConfig[] {
  return MODEL_REGISTRY.capabilities[capability] || [];
}

/**
 * Check if a model supports a specific capability
 */
export function modelHasCapability(modelId: string, capability: ModelCapability): boolean {
  const config = getModelConfig(modelId);
  return config?.metadata.capabilities?.includes(capability) || false;
}

/**
 * Check if a model supports reasoning
 */
export function modelSupportsReasoning(modelId: string): boolean {
  const config = getModelConfig(modelId);
  return config?.metadata.reasoningText?.supported || false;
}

/**
 * Get reasoning configuration for a model
 */
export function getModelReasoningConfig(modelId: string): ReasoningConfig | null {
  const config = getModelConfig(modelId);
  return config?.metadata.reasoningText || null;
}

/**
 * Get all available model IDs (including aliases)
 */
export function getAllModelIds(): string[] {
  const modelIds = Object.keys(MODEL_REGISTRY.models);
  const aliasIds = Object.keys(MODEL_REGISTRY.aliases);
  return [...new Set([...modelIds, ...aliasIds])];
}

/**
 * Get models suitable for chat (non-deprecated with good capabilities)
 */
export function getChatModels(): ProviderModelConfig[] {
  return Object.values(MODEL_REGISTRY.models).filter(
    config =>
      !config.metadata.deprecated &&
      (config.metadata.capabilities?.includes('tools') ||
        config.metadata.capabilities?.includes('reasoning') ||
        config.metadata.capabilities?.includes('multimodal')),
  );
}

/**
 * Get the best model for a specific task
 */
export function getBestModelForTask(task: 'reasoning' | 'vision' | 'code' | 'chat'): string {
  const taskToCapability: Record<string, ModelCapability> = {
    reasoningText: 'reasoning',
    vision: 'vision',
    code: 'code',
    chat: 'tools',
  };

  const capability = taskToCapability[task];
  const models = getModelsByCapability(capability);

  // Prefer non-deprecated models
  const nonDeprecated = models.filter(m => !m.metadata.deprecated);
  if (nonDeprecated.length > 0) {
    return nonDeprecated[0].id;
  }

  return models[0]?.id || 'claude-4-sonnet-20250514';
}

/**
 * Export commonly used model collections
 */
export const REASONING_MODELS = getModelsByCapability('reasoning').map(m => m.id);
export const VISION_MODELS = getModelsByCapability('vision').map(m => m.id);
export const CODE_MODELS = getModelsByCapability('code').map(m => m.id);
export const COMPUTER_USE_MODELS = getModelsByCapability('computer-use').map(m => m.id);

/**
 * Model validation helpers
 */
export function isValidModelId(modelId: string): boolean {
  return getModelConfig(modelId) !== null;
}

export function isDeprecatedModel(modelId: string): boolean {
  const config = getModelConfig(modelId);
  return config?.metadata.deprecated || false;
}

/**
 * Get provider-specific model ID from our internal ID
 */
export function getProviderModelId(modelId: string): string {
  const config = getModelConfig(modelId);
  return config?.actualModelId || modelId;
}

/**
 * Get provider name for a model
 */
export function getModelProvider(modelId: string): string | null {
  const config = getModelConfig(modelId);
  return config?.provider || null;
}
