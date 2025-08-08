/**
 * AI SDK v5 Provider Registry
 *
 * Modern provider configuration using createProviderRegistry and customProvider patterns.
 * This replaces legacy provider configuration patterns and provides a unified
 * interface for accessing multiple AI providers with custom configurations.
 *
 * @example Basic Usage
 * ```typescript
 * import { registry, models } from '@repo/ai/server';
 *
 * // Access specific models
 * const gpt4 = registry.languageModel('openai:gpt-4o');
 * const claude = registry.languageModel('anthropic:sonnet');
 *
 * // Use helper functions
 * const bestModel = models.language.best();
 * const embedding = models.embedding.default();
 * ```
 *
 * @example Advanced Configuration
 * ```typescript
 * // Access models from different providers
 * const gptReasoning = registry.languageModel('openai:o1-preview');
 * const claudeReasoning = registry.languageModel('anthropic:claude-4-opus-20250514');
 * const perplexitySearch = registry.languageModel('perplexity:sonar-pro');
 *
 * // Generate with provider-specific features
 * const result = await generateText({
 *   model: perplexitySearch,
 *   prompt: 'What are the latest AI developments?',
 *   experimental_telemetry: { isEnabled: true },
 * });
 * ```
 *
 * @since 1.0.0
 * @author AI SDK v5 Migration Team
 */

import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { logInfo } from '@repo/observability';
import {
  createProviderRegistry,
  customProvider,
  defaultSettingsMiddleware,
  wrapLanguageModel,
} from 'ai';
import { safeEnv } from '../../../env';
import { getBestModelForTask, getModelConfig, getModelsByProvider } from '../../shared/models';
import { LMSTUDIO_MODELS } from '../../shared/models/openai-compatible';
import { createPerplexityProvider, createXAIProvider } from './factory';

// Get environment configuration
const env = safeEnv();

/**
 * OpenAI Provider with centralized model configuration
 *
 * Dynamically builds OpenAI provider configuration using the centralized
 * model registry. Automatically includes all available OpenAI models with
 * their proper configurations and capabilities.
 *
 * @remarks
 * - Uses centralized MODEL_REGISTRY for consistent model definitions
 * - Automatically applies reasoning configurations for O1 models
 * - Includes both standard models and custom-configured variants
 * - Provides embedding models for vector operations
 * - Includes image generation capabilities
 *
 * @example
 * ```typescript
 * // Use standard models
 * const gpt4 = registry.languageModel('openai:gpt-4o');
 * const mini = registry.languageModel('openai:gpt-4o-mini');
 *
 * // Use reasoning models
 * const o1 = registry.languageModel('openai:o1-preview');
 * const o1Mini = registry.languageModel('openai:o1-mini');
 *
 * // Use embedding model
 * const embedding = registry.textEmbeddingModel('openai:text-embedding-3-small');
 * ```
 */
const openaiProvider = customProvider({
  languageModels: (() => {
    const models: Record<string, any> = {};
    const openaiModels = getModelsByProvider('openai');

    // Build language models from registry
    openaiModels.forEach(modelConfig => {
      const { id, actualModelId, metadata } = modelConfig;

      // Create base model
      const baseModel = openai(actualModelId);

      // Apply reasoning configuration if supported (O1 models)
      if (metadata.reasoningText?.supported) {
        models[id] = wrapLanguageModel({
          model: baseModel,
          middleware: defaultSettingsMiddleware({
            settings: {
              maxOutputTokens: metadata.outputLimit || 32768,
              temperature: 0.1, // Lower temperature for reasoning models
              // O1 models have internal reasoning, no special headers needed
            },
          }),
        });
      } else {
        // Standard model without special configuration
        models[id] = baseModel;
      }
    });

    // Add custom configured variants for common use cases
    models['gpt-4o-reasoning'] = wrapLanguageModel({
      model: openai('gpt-4o'),
      middleware: defaultSettingsMiddleware({
        settings: {
          temperature: 0.1,
          maxOutputTokens: 4000,
          providerOptions: {
            openai: {
              reasoningEffort: 'high',
            },
          },
        },
      }),
    });

    models['gpt-4o-creative'] = wrapLanguageModel({
      model: openai('gpt-4o'),
      middleware: defaultSettingsMiddleware({
        settings: {
          temperature: 0.9,
          maxOutputTokens: 4000,
          providerOptions: {
            openai: {
              reasoningEffort: 'medium',
            },
          },
        },
      }),
    });

    return models;
  })(),

  // Text embedding models
  textEmbeddingModels: {
    'text-embedding-3-small': openai.textEmbeddingModel('text-embedding-3-small'),
    'text-embedding-3-large': openai.textEmbeddingModel('text-embedding-3-large'),
    'text-embedding-ada-002': openai.textEmbeddingModel('text-embedding-ada-002'),
  },

  // Image models
  imageModels: {
    'dall-e-3': openai.imageModel('dall-e-3'),
    'dall-e-2': openai.imageModel('dall-e-2'),
  },

  fallbackProvider: openai,
});

/**
 * Anthropic Provider with centralized model configuration
 *
 * Dynamically builds Anthropic provider configuration using the centralized
 * model registry. Automatically includes all available Anthropic models with
 * their proper reasoning configurations and capabilities.
 *
 * @remarks
 * - Uses centralized MODEL_REGISTRY for consistent model definitions
 * - Automatically applies reasoning configurations where supported
 * - Includes all Claude models with proper versioning
 * - Supports dynamic model addition without code changes
 *
 * @example
 * ```typescript
 * // Access Claude 4 models
 * const claude4 = registry.languageModel('anthropic:claude-4-sonnet-20250514');
 * const reasoning = registry.languageModel('anthropic:claude-4-opus-20250514');
 *
 * // Generate with automatic reasoning support
 * const result = await generateText({
 *   model: reasoning,
 *   prompt: 'Complex analysis task',
 * });
 * ```
 */
const anthropicProvider = customProvider({
  languageModels: (() => {
    const models: Record<string, any> = {};
    const anthropicModels = getModelsByProvider('anthropic');

    // Build language models from registry
    anthropicModels.forEach(modelConfig => {
      const { id, actualModelId, metadata } = modelConfig;

      // Create base model
      const baseModel = anthropic(actualModelId);

      // Apply reasoning configuration if supported
      if (metadata.reasoningText?.supported) {
        models[id] = wrapLanguageModel({
          model: baseModel,
          middleware: defaultSettingsMiddleware({
            settings: {
              maxOutputTokens: metadata.outputLimit || 100000,
              ...(metadata.reasoningText.headers && {
                headers: metadata.reasoningText.headers,
              }),
              ...(metadata.reasoningText.budgetTokens && {
                providerOptions: {
                  anthropic: {
                    thinking: {
                      type: 'enabled',
                      budgetTokens: metadata.reasoningText.budgetTokens,
                    },
                  },
                },
              }),
            },
          }),
        });
      } else {
        // Standard model without reasoning
        models[id] = baseModel;
      }
    });

    // Add convenient aliases
    models.opus = models['claude-4-opus-20250514'];
    models.sonnet = models['claude-4-sonnet-20250514'] || models['claude-3-5-sonnet-20241022'];
    models.haiku = models['claude-3-5-haiku-20241022'];
    models['sonnet-reasoning'] =
      models['claude-4-sonnet-20250514'] || models['claude-3-7-sonnet-20250219'];

    return models;
  })(),

  fallbackProvider: anthropic,
});

/**
 * Google Provider with centralized model configuration
 *
 * Dynamically builds Google provider configuration using the centralized
 * model registry. Provides access to Google's Gemini models including
 * reasoning-enabled Gemini 2.0 models when available.
 *
 * @remarks
 * - Only available when GOOGLE_AI_API_KEY environment variable is set
 * - Uses centralized MODEL_REGISTRY for consistent model definitions
 * - Automatically applies reasoning configurations for Gemini 2.0 models
 * - Includes all Gemini variants (Pro, Flash, 2.0 experimental)
 * - Provides text embedding models for vector operations
 * - Returns undefined if API key is not configured
 *
 * @example
 * ```typescript
 * // Check if Google provider is available
 * if (googleProvider) {
 *   const geminiPro = registry.languageModel('google:gemini-1.5-pro-latest');
 *   const geminiFlash = registry.languageModel('google:gemini-1.5-flash');
 *   const gemini2 = registry.languageModel('google:gemini-2.0-flash-exp');
 *   const embedding = registry.textEmbeddingModel('google:text-embedding-004');
 * }
 * ```
 */
const googleProvider = safeEnv().GOOGLE_AI_API_KEY
  ? customProvider({
      languageModels: (() => {
        const models: Record<string, any> = {};
        const googleModels = getModelsByProvider('google');

        // Build language models from registry
        googleModels.forEach(modelConfig => {
          const { id, actualModelId, metadata } = modelConfig;

          // Create base model
          const baseModel = google(actualModelId);

          // Apply reasoning configuration if supported (Gemini 2.0)
          if (metadata.reasoningText?.supported) {
            models[id] = wrapLanguageModel({
              model: baseModel,
              middleware: defaultSettingsMiddleware({
                settings: {
                  maxOutputTokens: metadata.outputLimit || 8192,
                  // Gemini 2.0 has built-in reasoning capabilities
                },
              }),
            });
          } else {
            // Standard model without special configuration
            models[id] = baseModel;
          }
        });

        // Add convenient aliases
        models['gemini-pro'] = models['gemini-1.5-pro-latest'] || models['gemini-1.5-pro'];
        models['gemini-flash'] = models['gemini-1.5-flash'];
        models['gemini-2'] = models['gemini-2.0-flash-exp'];

        return models;
      })(),

      textEmbeddingModels: {
        'text-embedding-004': google.textEmbeddingModel('text-embedding-004'),
      },

      fallbackProvider: google,
    })
  : undefined;

/**
 * DeepInfra Provider for open source models
 *
 * Provides access to open source models through DeepInfra's API,
 * including Meta Llama models. Only available when DEEP_INFRA_API_KEY
 * is configured in the environment.
 *
 * @remarks
 * - Requires DEEP_INFRA_API_KEY environment variable
 * - Uses OpenAI-compatible API interface
 * - Includes large parameter models (70B, 405B)
 * - Cost-effective alternative for open source model access
 *
 * @example
 * ```typescript
 * // Use open source models via DeepInfra
 * if (deepinfraProvider) {
 *   const llama70b = registry.languageModel('deepinfra:llama-70b');
 *   const llama405b = registry.languageModel('deepinfra:llama-405b');
 * }
 * ```
 */
const deepinfraProvider = safeEnv().DEEP_INFRA_API_KEY
  ? customProvider({
      languageModels: {
        'llama-70b': createOpenAI({
          name: 'deepinfra',
          baseURL: 'https://api.deepinfra.com/v1/openai',
          apiKey: safeEnv().DEEP_INFRA_API_KEY,
        })('meta-llama/Meta-Llama-3.1-70B-Instruct'),

        'llama-405b': createOpenAI({
          name: 'deepinfra',
          baseURL: 'https://api.deepinfra.com/v1/openai',
          apiKey: safeEnv().DEEP_INFRA_API_KEY,
        })('meta-llama/Meta-Llama-3.1-405B-Instruct'),
      },
    })
  : undefined;

/**
 * Perplexity Provider using official SDK and factory pattern
 *
 * Uses the centralized provider factory with official @ai-sdk/perplexity SDK
 * to create Perplexity provider. Provides access to search-enabled AI models
 * with native sources, citations, and reasoning capabilities.
 *
 * @remarks
 * - Requires PERPLEXITY_API_KEY environment variable
 * - Uses official @ai-sdk/perplexity SDK for native features
 * - Uses centralized MODEL_REGISTRY for consistent model definitions
 * - Models have real-time internet search capabilities
 * - Supports native sources and citations display
 * - Supports both search-enabled and reasoning models
 * - Ideal for tasks requiring current information
 *
 * @example
 * ```typescript
 * // Use search-enabled models with sources
 * if (perplexityProvider) {
 *   const sonar = registry.languageModel('perplexity:sonar-pro');
 *   const reasoning = registry.languageModel('perplexity:sonar-reasoning-pro');
 *   const deepResearch = registry.languageModel('perplexity:sonar-deep-research');
 *
 *   // Generate with real-time search and sources
 *   const result = streamText({
 *     model: sonar,
 *     prompt: 'What are the latest developments in AI?',
 *   });
 *
 *   // Access sources and citations
 *   return result.toUIMessageStreamResponse({ sendSources: true });
 * }
 * ```
 */
const perplexityProvider = (() => {
  const env = safeEnv();
  const apiKey = env.PERPLEXITY_API_KEY;
  if (!apiKey) return null;

  const { provider, models, aliases } = createPerplexityProvider(apiKey);

  // Add Perplexity-specific aliased models
  const aliasedModels: Record<string, any> = {
    ...models,
    search: models['sonar-pro'] || models['sonar'],
    reasoningText: models['sonar-reasoning-pro'] || models['sonar-reasoning'],
    research: models['sonar-deep-research'],
    offline: models['r1-1776'],
    ...aliases,
  };

  return customProvider({
    languageModels: aliasedModels,
    fallbackProvider: provider.fallbackProvider,
  });
})();

/**
 * XAI Provider using factory pattern
 *
 * Uses the centralized provider factory to create XAI (Grok) provider
 * with all models configured from the model registry. Provides access
 * to Grok models including vision and reasoning capabilities.
 *
 * @remarks
 * - Requires XAI_API_KEY environment variable
 * - Uses factory pattern for consistent provider creation
 * - Includes Grok 2 and Grok 3 models
 * - Supports vision, reasoning, and code capabilities
 * - Uses OpenAI-compatible API interface
 *
 * @example
 * ```typescript
 * // Use XAI models
 * if (xaiProvider) {
 *   const grok2 = registry.languageModel('xai:grok-2-1212');
 *   const grok2Vision = registry.languageModel('xai:grok-2-vision-1212');
 *   const grok3Reasoning = registry.languageModel('xai:grok-3-mini-reasoning');
 * }
 * ```
 */
const xaiProvider = (() => {
  const env = safeEnv();
  const apiKey = env.XAI_API_KEY;
  if (!apiKey) return null;

  const { provider: _provider, models, aliases } = createXAIProvider(apiKey);

  // Add XAI-specific aliases
  const aliasedModels: Record<string, any> = {
    ...models,
    grok: models['grok-2-1212'] || models['grok-2'],
    'grok-vision': models['grok-2-vision-1212'],
    'grok-reasoning': models['grok-3-mini-reasoning'] || models['grok-3-mini'],
    ...aliases,
  };

  return customProvider({
    languageModels: aliasedModels,
    fallbackProvider: createOpenAI({
      name: 'xai',
      baseURL: 'https://api.x.ai/v1',
      apiKey,
    }),
  });
})();

/**
 * LM Studio Provider for local models
 *
 * Provides access to locally running models via LM Studio's OpenAI-compatible API.
 * Only available when LM_STUDIO_BASE_URL is configured (defaults to localhost:1234).
 *
 * @remarks
 * - Uses OpenAI-compatible API interface
 * - Supports custom model configuration via environment variables
 * - Includes chat, code, and reasoning model variants
 * - No API key required for local usage
 *
 * @example
 * ```typescript
 * // Use local models via LM Studio
 * if (lmstudioProvider) {
 *   const localChat = registry.languageModel('lmstudio:lmstudio-chat');
 *   const localCode = registry.languageModel('lmstudio:lmstudio-code');
 * }
 * ```
 */
const lmstudioProvider =
  safeEnv().LM_STUDIO_BASE_URL || process.env.NODE_ENV === 'development'
    ? customProvider({
        languageModels: LMSTUDIO_MODELS,
      })
    : undefined;

/**
 * Main AI Provider Registry
 *
 * The central registry for all configured AI providers and models.
 * Use this to access language models, embedding models, and image models
 * across different providers with a unified interface.
 *
 * @remarks
 * - Created using AI SDK v5's createProviderRegistry pattern
 * - Supports dynamic provider inclusion based on API key availability
 * - Uses ':' separator for model IDs (e.g., 'openai:gpt-4o')
 * - Includes fallback mechanisms for provider failures
 *
 * @example Model Access
 * ```typescript
 * // Access models by provider:model format
 * const gpt4 = registry.languageModel('openai:gpt-4o');
 * const claude = registry.languageModel('anthropic:sonnet');
 * const perplexity = registry.languageModel('perplexity:sonar-pro');
 * const grok = registry.languageModel('xai:grok-2-1212');
 * const gemini = registry.languageModel('google:gemini-1.5-pro-latest');
 * const embedding = registry.textEmbeddingModel('openai:text-embedding-3-small');
 *
 * // Use in AI SDK functions
 * const result = await generateText({
 *   model: claude,
 *   prompt: 'Your prompt here',
 * });
 * ```
 *
 * @see {@link models} For convenient helper functions
 * @see {@link getModel} For programmatic model access
 */
export const registry = createProviderRegistry(
  {
    // Core providers
    openai: openaiProvider,
    anthropic: anthropicProvider,

    // Optional providers (only included if API keys are available)
    ...(googleProvider && { google: googleProvider }),
    ...(deepinfraProvider && { deepinfra: deepinfraProvider }),
    ...(perplexityProvider && { perplexity: perplexityProvider }),
    ...(xaiProvider && { xai: xaiProvider }),
    ...(lmstudioProvider && { lmstudio: lmstudioProvider }),
  },
  {
    separator: ':', // default separator for model IDs
  },
);

/**
 * Helper functions for common model access patterns
 *
 * Provides convenient shortcuts for accessing frequently used models
 * using the centralized model registry. Models are automatically selected
 * based on capabilities and performance characteristics.
 *
 * @namespace models
 *
 * @example Language Models
 * ```typescript
 * // Get the best available model
 * const best = models.language.best();
 *
 * // Get models for specific tasks
 * const fast = models.language.fast();
 * const reasoning = models.language.reasoning();
 * const vision = models.language.vision();
 * const code = models.language.code();
 * ```
 *
 * @example Embedding Models
 * ```typescript
 * // Default embedding model
 * const embedding = models.embedding.default();
 *
 * // High-dimensional embedding model
 * const largeEmbedding = models.embedding.large();
 * ```
 *
 * @example Image Models
 * ```typescript
 * // Latest image generation model
 * const imageGen = models.image.default();
 * ```
 */
export const models = {
  // Language models - using centralized registry for selection
  language: {
    // Most capable models
    best: () => {
      const bestModel = getBestModelForTask('chat');
      return registry.languageModel(`anthropic:${bestModel}` as any);
    },

    reasoningText: () => {
      const reasoningModel = getBestModelForTask('reasoning');
      const config = getModelConfig(reasoningModel);
      const provider = config?.provider || 'anthropic';
      return registry.languageModel(`${provider}:${reasoningModel}` as any);
    },

    creative: () => registry.languageModel('anthropic:claude-4-sonnet-20250514'),

    // Fast models
    fast: () => registry.languageModel('anthropic:claude-3-5-haiku-20241022'),

    // Anthropic models - using latest available
    claude: () => registry.languageModel('anthropic:claude-4-sonnet-20250514'),
    claudeReasoning: () => registry.languageModel('anthropic:claude-4-opus-20250514'),

    // Vision models
    vision: () => {
      const visionModel = getBestModelForTask('vision');
      const config = getModelConfig(visionModel);
      const provider = config?.provider || 'anthropic';
      return registry.languageModel(`${provider}:${visionModel}` as any);
    },

    // Code models
    code: () => {
      const codeModel = getBestModelForTask('code');
      const config = getModelConfig(codeModel);
      const provider = config?.provider || 'anthropic';
      return registry.languageModel(`${provider}:${codeModel}` as any);
    },

    // Google models (if available)
    gemini: () =>
      googleProvider ? registry.languageModel('google:gemini-pro') : models.language.best(),
  },

  // Embedding models
  embedding: {
    default: () => registry.textEmbeddingModel('openai:text-embedding-3-small'),
    large: () => registry.textEmbeddingModel('openai:text-embedding-3-large'),
    /** @deprecated Use default() or large() instead */
    legacy: () => registry.textEmbeddingModel('openai:text-embedding-ada-002'),
  },

  // Image models
  image: {
    default: () => registry.imageModel('openai:dall-e-3'),
    /** @deprecated Use default() instead */
    legacy: () => registry.imageModel('openai:dall-e-2'),
  },
};

/**
 * Get a model by provider and name
 *
 * Programmatically constructs a model identifier and retrieves the
 * corresponding language model from the registry.
 *
 * @param provider - Provider name (openai, anthropic, google, perplexity, xai, deepinfra)
 * @param model - Model name as defined in the provider configuration
 *
 * @returns The requested language model
 *
 * @throws {Error} If the provider or model is not found in the registry
 *
 * @example
 * ```typescript
 * // Get specific models programmatically from different providers
 * const gpt4 = getModel('openai', 'gpt-4o');
 * const claude = getModel('anthropic', 'sonnet');
 * const perplexity = getModel('perplexity', 'sonar-pro');
 * const grok = getModel('xai', 'grok-2-1212');
 *
 * // Use with dynamic provider selection
 * const provider = userPreferences.provider;
 * const modelName = userPreferences.model;
 * const selectedModel = getModel(provider, modelName);
 * ```
 *
 * @see {@link registry.languageModel} For direct registry access
 * @see {@link models} For convenient helper functions
 */
export function getModel(provider: string, model: string) {
  return registry.languageModel(`${provider}:${model}` as any);
}

/**
 * Get default model for a specific use case
 *
 * Returns the best available language model as the default choice.
 * This is equivalent to calling models.language.best() and provides
 * a stable API for getting a high-quality model.
 *
 * @returns The default language model (currently OpenAI GPT-4o)
 *
 * @example
 * ```typescript
 * // Get the default model
 * const defaultModel = getDefaultModel();
 *
 * // Use in generation
 * const result = await generateText({
 *   model: defaultModel,
 *   prompt: 'Your prompt here',
 * });
 * ```
 *
 * @see {@link models.language.best} For direct access
 */
export function getDefaultModel() {
  return models.language.best();
}

/**
 * Get language model with automatic fallback
 *
 * Safely retrieves a language model from the registry with automatic fallback
 * to either a specified fallback model or the best available model.
 * This is useful for handling cases where a specific model might not be available.
 *
 * @param modelId - The model identifier (e.g., 'xai:grok-2-vision-1212')
 * @param fallback - Optional fallback model ID (defaults to best available model)
 *
 * @returns The requested language model or fallback
 *
 * @example
 * ```typescript
 * // Get model with automatic fallback to best model
 * const model = getLanguageModel('xai:grok-2-vision-1212');
 *
 * // Get model with specific fallback
 * const model = getLanguageModel(
 *   'perplexity:sonar-pro',
 *   'anthropic:claude-4-sonnet-20250514'
 * );
 * ```
 */
export function getLanguageModel(modelId: string, fallback?: string) {
  try {
    return registry.languageModel(modelId as any);
  } catch (error) {
    logInfo(`Model ${modelId} not available, using fallback`, { modelId, fallback });
    if (fallback) {
      try {
        return registry.languageModel(fallback as any);
      } catch {
        // Fallback also failed, use best available
        return models.language.best();
      }
    }
    return models.language.best();
  }
}

/**
 * Get embedding model with fallback support
 *
 * Provides safe access to embedding models with automatic fallback handling.
 * Used by RAG systems and vector operations that require embedding generation.
 *
 * @param modelId - Full model ID in format 'provider:model' (e.g., 'openai:text-embedding-3-small')
 * @param fallback - Optional fallback model ID to try if primary fails
 *
 * @returns The requested embedding model or fallback model
 *
 * @example Basic Usage
 * ```typescript
 * // Get specific embedding model
 * const embedding = getEmbeddingModel('openai:text-embedding-3-small');
 *
 * // With fallback for resilience
 * const embeddingWithFallback = getEmbeddingModel(
 *   'openai:text-embedding-3-large',
 *   'openai:text-embedding-3-small'
 * );
 * ```
 *
 * @example RAG Integration
 * ```typescript
 * // Use in RAG systems
 * const ragEmbedding = getEmbeddingModel('openai:text-embedding-3-small', 'openai:text-embedding-ada-002');
 *
 * // Generate embeddings
 * const result = await embed({
 *   model: ragEmbedding,
 *   value: 'Document content to embed'
 * });
 * ```
 */
export function getEmbeddingModel(modelId: string, fallback?: string) {
  try {
    return registry.textEmbeddingModel(modelId as any);
  } catch (error) {
    logInfo(`Embedding model ${modelId} not available, using fallback`, {
      modelId,
      fallback,
      error: error instanceof Error ? error.message : String(error),
    });

    if (fallback) {
      try {
        return registry.textEmbeddingModel(fallback as any);
      } catch {
        logInfo(`Fallback embedding model ${fallback} also failed, using default`, { fallback });
        return models.embedding.default();
      }
    }

    return models.embedding.default();
  }
}

/**
 * Legacy compatibility - get model using old patterns
 *
 * Provides backward compatibility for code using pre-v5 model access patterns.
 * This function is deprecated and will be removed in a future version.
 *
 * @deprecated Use registry.languageModel() or models.* helpers instead
 *
 * @param provider - Legacy provider name
 * @param modelName - Optional model name (uses provider default if not specified)
 *
 * @returns The requested language model
 *
 * @example Migration
 * ```typescript
 * // OLD (deprecated)
 * const model = getLegacyModel('openai', 'gpt-4o');
 *
 * // NEW (recommended)
 * const model = registry.languageModel('openai:gpt-4o');
 * // or
 * const model = models.language.best();
 * ```
 *
 * @see {@link registry.languageModel} For modern model access
 * @see {@link models} For convenient helper functions
 */
export function getLegacyModel(provider: 'openai' | 'anthropic' | 'google', modelName?: string) {
  logInfo('getLegacyModel is deprecated. Use registry.languageModel() instead.');

  switch (provider) {
    case 'openai':
      return modelName ? getModel('openai', modelName) : models.language.best();
    case 'anthropic':
      return modelName ? getModel('anthropic', modelName) : models.language.claude();
    case 'google':
      return modelName ? getModel('google', modelName) : models.language.gemini();
    default:
      return models.language.best();
  }
}
