import { safeEnv } from '../../../env';

import { AIConfig } from '../types/config';
import { AIManagerConfig, ProviderConfig } from '../types/provider';

// Import the new v5 registry (lazy loaded to avoid env access during tests)
let registryCache: any = null;
let modelsCache: any = null;

export function convertToManagerConfig(config: AIConfig): AIManagerConfig {
  const providers: ProviderConfig[] = [];

  // Convert AIConfig providers to ProviderConfig array
  if (config.providers?.openai?.apiKey) {
    providers.push({
      config: config.providers.openai,
      name: 'openai-direct',
      type: 'direct',
    });
  }

  if (config.providers?.anthropic?.apiKey) {
    providers.push({
      config: config.providers.anthropic,
      name: 'anthropic-direct',
      type: 'direct',
    });
  }

  if (config.providers?.google?.apiKey) {
    providers.push({
      config: config.providers.google,
      name: 'google-ai-sdk',
      type: 'ai-sdk',
    });
  }

  if (config.providers?.deepinfra?.apiKey) {
    providers.push({
      config: config.providers.deepinfra,
      name: 'deepinfra-ai-sdk',
      type: 'ai-sdk',
    });
  }

  if (config.providers?.perplexity?.apiKey) {
    providers.push({
      config: config.providers.perplexity,
      name: 'perplexity-ai-sdk',
      type: 'ai-sdk',
    });
  }

  return {
    providers,
    ...(config.defaultProvider && { defaultProvider: config.defaultProvider }),
    ...(typeof config.enableLogging === 'boolean' && { enableLogging: config.enableLogging }),
    ...(typeof config.enableRateLimit === 'boolean' && { enableRateLimit: config.enableRateLimit }),
  };
}

export function createConfigFromEnv(): AIConfig {
  const env = safeEnv();

  return {
    defaultProvider: 'openai',
    enableLogging: env.NODE_ENV === 'development',
    enableRateLimit: env.NODE_ENV === 'production',
    providers: {
      ...(env.ANTHROPIC_API_KEY && {
        anthropic: {
          apiKey: env.ANTHROPIC_API_KEY,
        },
      }),
      ...(env.DEEP_INFRA_API_KEY && {
        deepinfra: {
          apiKey: env.DEEP_INFRA_API_KEY,
        },
      }),
      ...(env.GOOGLE_AI_API_KEY && {
        google: {
          apiKey: env.GOOGLE_AI_API_KEY,
        },
      }),
      ...(env.OPENAI_API_KEY && {
        openai: {
          apiKey: env.OPENAI_API_KEY,
        },
      }),
      ...(env.PERPLEXITY_API_KEY && {
        perplexity: {
          apiKey: env.PERPLEXITY_API_KEY,
          searchEnabled: env.NEXT_PUBLIC_PERPLEXITY_SEARCH_ENABLED === 'true',
          citationsEnabled: env.NEXT_PUBLIC_PERPLEXITY_CITATIONS_ENABLED === 'true',
          toolsEnabled: process.env.PERPLEXITY_TOOLS_ENABLED === 'true',
          imageEnabled: process.env.PERPLEXITY_IMAGE_ENABLED === 'true',
        },
      }),
    },
  };
}

export function validateConfig(config: AIConfig): string[] {
  const errors: string[] = [];

  if (!config) {
    errors.push('Configuration is required');
    return errors;
  }

  if (!config.providers || Object.keys(config.providers || {}).length === 0) {
    errors.push('At least one provider must be configured');
    return errors;
  }

  // Check that at least one provider has a valid API key
  let hasValidProvider = false;

  if (config.providers?.openai?.apiKey) {
    hasValidProvider = true;
  } else if (config.providers?.openai) {
    errors.push('OpenAI provider configured but missing API key');
  }

  if (config.providers?.anthropic?.apiKey) {
    hasValidProvider = true;
  } else if (config.providers?.anthropic) {
    errors.push('Anthropic provider configured but missing API key');
  }

  if (config.providers?.google?.apiKey) {
    hasValidProvider = true;
  } else if (config.providers?.google) {
    errors.push('Google provider configured but missing API key');
  }

  if (!hasValidProvider) {
    errors.push('No provider has a valid API key. At least one provider must have an API key.');
  }

  return errors;
}

/**
 * V5 Configuration Helpers
 * These functions provide access to the modern AI SDK v5 provider registry
 */

/**
 * Get the v5 provider registry
 * @returns The configured provider registry
 */
export function getProviderRegistry() {
  if (!registryCache) {
    const { registry } = require('../../server/providers/registry');
    registryCache = registry;
  }
  return registryCache;
}

/**
 * Get a model from the v5 registry
 * @param provider Provider name (openai, anthropic, etc.)
 * @param model Model name
 */
export function getV5Model(provider: string, model: string) {
  const registry = getProviderRegistry();
  return registry.languageModel(`${provider}:${model}` as any);
}

/**
 * Get default models for common use cases
 */
export function getV5Models() {
  if (!modelsCache) {
    const { models } = require('../../server/providers/registry');
    modelsCache = models;
  }
  return modelsCache;
}

/**
 * Create a v5-compatible config from environment
 * This bridges the old AIConfig with the new registry system
 */
export function createV5Config() {
  const env = safeEnv();
  const registry = getProviderRegistry();
  const models = getV5Models();

  return {
    // Use the v5 registry for model access
    registry,
    models,

    /** @deprecated Use registry providers directly instead */
    hasOpenAI: !!env.OPENAI_API_KEY,
    /** @deprecated Use registry providers directly instead */
    hasAnthropic: !!env.ANTHROPIC_API_KEY,
    /** @deprecated Use registry providers directly instead */
    hasGoogle: !!env.GOOGLE_AI_API_KEY,
    /** @deprecated Use registry providers directly instead */
    hasDeepInfra: !!env.DEEP_INFRA_API_KEY,
    /** @deprecated Use registry providers directly instead */
    hasPerplexity: !!env.PERPLEXITY_API_KEY,

    // Default selections
    defaultLanguageModel: models.language.best(),
    defaultEmbeddingModel: models.embedding.default(),
    defaultImageModel: models.image.default(),
  };
}
