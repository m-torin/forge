/**
 * Provider Factory Pattern
 *
 * Creates AI providers dynamically from centralized model configurations.
 * This factory pattern ensures consistency across all providers while
 * supporting provider-specific features and configurations.
 */

import { createOpenAI } from '@ai-sdk/openai';
import { perplexity } from '@ai-sdk/perplexity';
import type { LanguageModel } from 'ai';
import { customProvider, defaultSettingsMiddleware, wrapLanguageModel } from 'ai';
import { getModelsByProvider, type ProviderModelConfig } from '../../shared/models';

/**
 * Provider creation options
 */
export interface ProviderFactoryOptions {
  apiKey: string;
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
  providerClient?: any; // For providers with custom SDK clients
}

/**
 * Model wrapper options for applying middleware
 */
export interface ModelWrapperOptions {
  model: LanguageModel;
  config: ProviderModelConfig;
}

/**
 * Provider factory result
 */
export interface ProviderFactoryResult {
  provider: any; // ReturnType<typeof customProvider>
  models: Record<string, LanguageModel>;
  aliases: Record<string, string>;
}

/**
 * Apply reasoning configuration to a model
 */
function applyReasoningConfig(options: ModelWrapperOptions): LanguageModel {
  const { model, config } = options;
  const { metadata } = config;

  if (!metadata.reasoning?.supported) {
    return model;
  }

  // Build settings based on reasoning configuration
  const settings: any = {
    maxOutputTokens: metadata.outputLimit || 8192,
  };

  // Add provider-specific reasoning settings
  if (metadata.reasoning.headers) {
    settings.headers = metadata.reasoning.headers;
  }

  if (metadata.reasoning.budgetTokens) {
    // Provider-specific reasoning configuration
    const providerName = config.provider;
    settings.providerOptions = {
      [providerName]: {
        // Anthropic uses 'thinking', others may use 'reasoning'
        ...(providerName === 'anthropic' && {
          thinking: {
            type: 'enabled',
            budgetTokens: metadata.reasoning.budgetTokens,
          },
        }),
        // Generic reasoning pattern for other providers
        ...(providerName !== 'anthropic' && {
          reasoning: {
            enabled: true,
            budgetTokens: metadata.reasoning.budgetTokens,
          },
        }),
      },
    };
  }

  return wrapLanguageModel({
    model,
    middleware: defaultSettingsMiddleware({ settings }),
  });
}

/**
 * Create models for OpenAI-compatible providers
 */
export function createOpenAICompatibleProvider(
  providerName: string,
  options: ProviderFactoryOptions,
): ProviderFactoryResult {
  const models: Record<string, LanguageModel> = {};
  const aliases: Record<string, string> = {};
  const providerModels = getModelsByProvider(providerName);

  // Create OpenAI-compatible client
  const client = createOpenAI({
    name: providerName,
    baseURL: options.baseURL,
    apiKey: options.apiKey,
    headers: options.defaultHeaders,
  });

  // Build models from registry
  providerModels.forEach(modelConfig => {
    const { id, actualModelId, metadata } = modelConfig;

    // Create base model
    let model: LanguageModel = client(actualModelId);

    // Apply reasoning configuration if supported
    if (metadata.reasoning?.supported) {
      model = applyReasoningConfig({ model, config: modelConfig });
    }

    models[id] = model;
  });

  // Create provider
  const provider = customProvider({
    languageModels: models,
    fallbackProvider: client,
  });

  return { provider, models, aliases };
}

/**
 * Create models for providers with custom SDKs
 */
export function createCustomSDKProvider(
  providerName: string,
  options: ProviderFactoryOptions,
): ProviderFactoryResult {
  const models: Record<string, LanguageModel> = {};
  const aliases: Record<string, string> = {};
  const providerModels = getModelsByProvider(providerName);

  // Ensure we have a provider client
  if (!options.providerClient) {
    throw new Error(`Provider client is required for ${providerName}`);
  }

  const client = options.providerClient;

  // Build models from registry
  providerModels.forEach(modelConfig => {
    const { id, actualModelId, metadata } = modelConfig;

    // Create base model using provider's SDK
    let model: LanguageModel = client(actualModelId);

    // Apply reasoning configuration if supported
    if (metadata.reasoning?.supported) {
      model = applyReasoningConfig({ model, config: modelConfig });
    }

    models[id] = model;
  });

  // Add common aliases based on model capabilities
  const reasoningModels = providerModels.filter(m => m.metadata.reasoning?.supported);
  const visionModels = providerModels.filter(m => m.metadata.capabilities?.includes('vision'));
  const codeModels = providerModels.filter(m => m.metadata.capabilities?.includes('code'));

  const aliasModels: Record<string, LanguageModel> = {};
  if (reasoningModels.length > 0) {
    const reasoningModelId = reasoningModels[0].id;
    aliases.reasoning = reasoningModelId;
    if (models[reasoningModelId]) {
      aliasModels.reasoning = models[reasoningModelId];
    }
  }
  if (visionModels.length > 0) {
    const visionModelId = visionModels[0].id;
    aliases.vision = visionModelId;
    if (models[visionModelId]) {
      aliasModels.vision = models[visionModelId];
    }
  }
  if (codeModels.length > 0) {
    const codeModelId = codeModels[0].id;
    aliases.code = codeModelId;
    if (models[codeModelId]) {
      aliasModels.code = models[codeModelId];
    }
  }

  // Create provider
  const provider = customProvider({
    languageModels: { ...models, ...aliasModels },
    fallbackProvider: client,
  });

  return { provider, models, aliases };
}

/**
 * Main factory function to create providers
 */
export function createProviderFromRegistry(
  providerName: string,
  options: ProviderFactoryOptions,
): ProviderFactoryResult {
  // Determine provider type
  const openAICompatibleProviders = [
    'perplexity',
    'xai',
    'deepinfra',
    'lmstudio',
    'ollama',
    'deepseek',
  ];

  if (openAICompatibleProviders.includes(providerName)) {
    return createOpenAICompatibleProvider(providerName, options);
  } else {
    return createCustomSDKProvider(providerName, options);
  }
}

/**
 * Provider-specific factory functions
 */

/**
 * Create XAI provider
 */
export function createXAIProvider(apiKey: string): ProviderFactoryResult {
  return createOpenAICompatibleProvider('xai', {
    apiKey,
    baseURL: 'https://api.x.ai/v1',
  });
}

/**
 * Create DeepSeek provider
 */
export function createDeepSeekProvider(apiKey: string): ProviderFactoryResult {
  return createOpenAICompatibleProvider('deepseek', {
    apiKey,
    baseURL: 'https://api.deepseek.com/v1',
  });
}

/**
 * Create local LMStudio provider
 */
export function createLMStudioProvider(
  baseURL = 'http://localhost:1234/v1',
): ProviderFactoryResult {
  return createOpenAICompatibleProvider('lmstudio', {
    apiKey: 'lmstudio', // LMStudio doesn't require API key
    baseURL,
  });
}

/**
 * Create local Ollama provider
 */
export function createOllamaProvider(
  baseURL = 'http://localhost:11434/api',
): ProviderFactoryResult {
  return createOpenAICompatibleProvider('ollama', {
    apiKey: 'ollama', // Ollama doesn't require API key
    baseURL,
  });
}

/**
 * Create Perplexity provider using official SDK
 */
export function createPerplexityProvider(apiKey: string): ProviderFactoryResult {
  const models: Record<string, any> = {};
  const aliases: Record<string, string> = {};
  const providerModels = getModelsByProvider('perplexity');

  // Build models from registry using official SDK
  providerModels.forEach(modelConfig => {
    const { id, actualModelId, metadata } = modelConfig;

    // Create base model using official Perplexity SDK
    let model: any = perplexity(actualModelId);

    // Apply reasoning configuration if supported
    if (metadata.reasoning?.supported) {
      model = applyReasoningConfig({ model, config: modelConfig });
    }

    models[id] = model;
  });

  // Add convenient aliases based on model capabilities
  const searchModels = providerModels.filter(m => m.metadata.capabilities?.includes('search'));
  const reasoningModels = providerModels.filter(m => m.metadata.reasoning?.supported);

  if (searchModels.length > 0) {
    aliases.search = searchModels[0].id;
  }
  if (reasoningModels.length > 0) {
    aliases.reasoning = reasoningModels[0].id;
  }

  // Create provider using official SDK
  const provider = customProvider({
    languageModels: { ...models, ...aliases },
    fallbackProvider: perplexity,
  });

  return { provider, models, aliases };
}

/**
 * Helper to get all available providers from registry
 */
export function getAvailableProviders(): string[] {
  return [
    'anthropic',
    'openai',
    'google',
    'perplexity',
    'xai',
    'deepseek',
    'lmstudio',
    'ollama',
    'deepinfra',
  ];
}

/**
 * Helper to validate provider configuration
 */
export function validateProviderConfig(
  providerName: string,
  options: Partial<ProviderFactoryOptions>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if provider exists
  const availableProviders = getAvailableProviders();
  if (!availableProviders.includes(providerName)) {
    errors.push(`Unknown provider: ${providerName}`);
  }

  // Check required options
  const localProviders = ['lmstudio', 'ollama'];
  if (!localProviders.includes(providerName) && !options.apiKey) {
    errors.push(`API key is required for ${providerName}`);
  }

  // Check if provider has models in registry
  const models = getModelsByProvider(providerName);
  if (models.length === 0) {
    errors.push(`No models found for provider: ${providerName}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
