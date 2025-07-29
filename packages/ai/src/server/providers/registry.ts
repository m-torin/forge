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
 * // Custom reasoning model with specific settings
 * const reasoningModel = registry.languageModel('openai:gpt-4o-reasoning');
 *
 * // Generate with custom provider options
 * const result = await generateText({
 *   model: reasoningModel,
 *   prompt: 'Complex reasoning task',
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

// Get environment configuration
const env = safeEnv();

/**
 * OpenAI Provider with custom configurations
 *
 * Provides access to OpenAI's language, embedding, and image models with
 * custom middleware configurations for different use cases like reasoning,
 * creative writing, and standard text generation.
 *
 * @remarks
 * - Includes both standard OpenAI models and custom-configured variants
 * - Uses wrapLanguageModel for advanced settings like reasoning effort
 * - Provides embedding models for vector operations
 * - Includes image generation capabilities
 *
 * @example
 * ```typescript
 * // Use pre-configured reasoning model
 * const reasoning = registry.languageModel('openai:gpt-4o-reasoning');
 *
 * // Use standard model
 * const standard = registry.languageModel('openai:gpt-4o');
 *
 * // Use embedding model
 * const embedding = registry.textEmbeddingModel('openai:text-embedding-3-small');
 * ```
 */
const openaiProvider = customProvider({
  languageModels: {
    // Standard OpenAI models
    'gpt-4o': openai('gpt-4o'),
    'gpt-4o-mini': openai('gpt-4o-mini'),
    'gpt-4-turbo': openai('gpt-4-turbo'),

    // Custom configured models
    'gpt-4o-reasoning': wrapLanguageModel({
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
    }),

    'gpt-4o-creative': wrapLanguageModel({
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
    }),
  },

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
 * Anthropic Provider with model aliases
 *
 * Provides access to Anthropic's Claude models with convenient aliases
 * and reasoning-enabled configurations. Includes support for Claude's
 * thinking mode and extended context capabilities.
 *
 * @remarks
 * - Uses friendly aliases (opus, sonnet, haiku) for easier model selection
 * - Includes reasoning configurations with thinking mode enabled
 * - Supports extended context lengths up to 8000 tokens
 * - Provides budget token management for reasoning tasks
 *
 * @example
 * ```typescript
 * // Use model aliases
 * const claude = registry.languageModel('anthropic:sonnet');
 * const reasoning = registry.languageModel('anthropic:sonnet-reasoning');
 *
 * // Generate with thinking enabled
 * const result = await generateText({
 *   model: reasoning,
 *   prompt: 'Complex analysis task',
 * });
 * ```
 */
const anthropicProvider = customProvider({
  languageModels: {
    // Model aliases for easier updates
    opus: anthropic('claude-3-opus-20240229'),
    sonnet: anthropic('claude-3-5-sonnet-20240620'),
    haiku: anthropic('claude-3-haiku-20240307'),

    // Latest models
    'claude-3-opus': anthropic('claude-3-opus-20240229'),
    'claude-3-sonnet': anthropic('claude-3-5-sonnet-20240620'),
    'claude-3-haiku': anthropic('claude-3-haiku-20240307'),

    // Reasoning-enabled configuration
    'sonnet-reasoning': wrapLanguageModel({
      model: anthropic('claude-3-5-sonnet-20240620'),
      middleware: defaultSettingsMiddleware({
        settings: {
          maxOutputTokens: 8000,
          providerOptions: {
            anthropic: {
              thinking: {
                type: 'enabled',
                budgetTokens: 15000,
              },
            },
          },
        },
      }),
    }),
  },

  fallbackProvider: anthropic,
});

/**
 * Google Provider configuration
 *
 * Conditionally provides access to Google's Gemini models and embedding
 * capabilities when GOOGLE_AI_API_KEY is available in the environment.
 *
 * @remarks
 * - Only available when GOOGLE_AI_API_KEY environment variable is set
 * - Includes both Gemini Pro and Flash variants
 * - Provides text embedding models for vector operations
 * - Returns undefined if API key is not configured
 *
 * @example
 * ```typescript
 * // Check if Google provider is available
 * if (googleProvider) {
 *   const gemini = registry.languageModel('google:gemini-pro');
 *   const embedding = registry.textEmbeddingModel('google:text-embedding-004');
 * }
 * ```
 */
const googleProvider = env.GOOGLE_AI_API_KEY
  ? customProvider({
      languageModels: {
        'gemini-pro': google('gemini-1.5-pro'),
        'gemini-flash': google('gemini-1.5-flash'),
        'gemini-1.5-pro': google('gemini-1.5-pro'),
        'gemini-1.5-flash': google('gemini-1.5-flash'),
      },

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
const deepinfraProvider = env.DEEP_INFRA_API_KEY
  ? customProvider({
      languageModels: {
        'llama-70b': createOpenAI({
          name: 'deepinfra',
          baseURL: 'https://api.deepinfra.com/v1/openai',
          apiKey: env.DEEP_INFRA_API_KEY,
        })('meta-llama/Meta-Llama-3.1-70B-Instruct'),

        'llama-405b': createOpenAI({
          name: 'deepinfra',
          baseURL: 'https://api.deepinfra.com/v1/openai',
          apiKey: env.DEEP_INFRA_API_KEY,
        })('meta-llama/Meta-Llama-3.1-405B-Instruct'),
      },
    })
  : undefined;

/**
 * Perplexity Provider for search-enabled models
 *
 * Provides access to Perplexity's search-enabled AI models that can
 * access real-time information from the internet. Only available when
 * PERPLEXITY_API_KEY is configured.
 *
 * @remarks
 * - Requires PERPLEXITY_API_KEY environment variable
 * - Models have real-time internet search capabilities
 * - Uses OpenAI-compatible API interface
 * - Ideal for tasks requiring current information
 *
 * @example
 * ```typescript
 * // Use search-enabled models
 * if (perplexityProvider) {
 *   const sonar = registry.languageModel('perplexity:sonar-large');
 *
 *   // Generate with real-time search
 *   const result = await generateText({
 *     model: sonar,
 *     prompt: 'What are the latest developments in AI?',
 *   });
 * }
 * ```
 */
const perplexityProvider = env.PERPLEXITY_API_KEY
  ? customProvider({
      languageModels: {
        'sonar-medium': createOpenAI({
          name: 'perplexity',
          baseURL: 'https://api.perplexity.ai/',
          apiKey: env.PERPLEXITY_API_KEY,
        })('llama-3.1-sonar-small-128k-online'),

        'sonar-large': createOpenAI({
          name: 'perplexity',
          baseURL: 'https://api.perplexity.ai/',
          apiKey: env.PERPLEXITY_API_KEY,
        })('llama-3.1-sonar-large-128k-online'),
      },
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
 * const embedding = registry.textEmbeddingModel('openai:text-embedding-3-small');
 *
 * // Use in AI SDK functions
 * const result = await generateText({
 *   model: gpt4,
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
  },
  {
    separator: ':', // default separator for model IDs
  },
);

/**
 * Helper functions for common model access patterns
 *
 * Provides convenient shortcuts for accessing frequently used models
 * without needing to remember specific provider:model combinations.
 * Organized by model type and use case.
 *
 * @namespace models
 *
 * @example Language Models
 * ```typescript
 * // Get the best available model
 * const best = models.language.best();
 *
 * // Get a fast model for simple tasks
 * const fast = models.language.fast();
 *
 * // Get reasoning-enabled models
 * const reasoning = models.language.reasoning();
 * const claudeReasoning = models.language.claudeReasoning();
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
  // Language models
  language: {
    // Most capable models
    best: () => registry.languageModel('openai:gpt-4o'),
    reasoning: () => registry.languageModel('openai:gpt-4o-reasoning'),
    creative: () => registry.languageModel('openai:gpt-4o-creative'),

    // Fast models
    fast: () => registry.languageModel('openai:gpt-4o-mini'),

    // Anthropic models
    claude: () => registry.languageModel('anthropic:sonnet'),
    claudeReasoning: () => registry.languageModel('anthropic:sonnet-reasoning'),

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
 * @param provider - Provider name (openai, anthropic, google, deepinfra, perplexity)
 * @param model - Model name as defined in the provider configuration
 *
 * @returns The requested language model
 *
 * @throws {Error} If the provider or model is not found in the registry
 *
 * @example
 * ```typescript
 * // Get specific models programmatically
 * const gpt4 = getModel('openai', 'gpt-4o');
 * const claude = getModel('anthropic', 'sonnet');
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
