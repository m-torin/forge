import type { LanguageModel, Provider } from 'ai';
import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from 'ai';

export interface CustomProviderConfig {
  languageModels?: Record<string, LanguageModel>;
  imageModels?: Record<string, any>;
  middlewares?: {
    reasoningText?: {
      model: string;
      tagName?: string;
    };
  };
}

/**
 * Creates a custom AI provider with optional middleware configuration
 */
export function createCustomProvider(config: CustomProviderConfig): Provider {
  const { languageModels = {}, imageModels = {}, middlewares } = config;

  // Apply reasoning middleware if configured
  if (middlewares?.reasoningText && languageModels[middlewares.reasoningText.model]) {
    const reasoningModel = languageModels[middlewares.reasoningText.model];
    languageModels[middlewares.reasoningText.model] = wrapLanguageModel({
      model: reasoningModel as any,
      middleware: extractReasoningMiddleware({
        tagName: middlewares.reasoningText.tagName || 'think',
      }),
    }) as LanguageModel;
  }

  return customProvider({
    languageModels: languageModels as any,
    ...(Object.keys(imageModels).length > 0 && { imageModels }),
  });
}

/**
 * Creates a test provider with mock models
 */
export function createTestProvider(models: Record<string, LanguageModel>): Provider {
  return customProvider({
    languageModels: models as any,
  });
}

/**
 * Wraps a language model with reasoning extraction middleware
 */
export function withReasoningMiddleware(model: LanguageModel, tagName?: string): LanguageModel;
export function withReasoningMiddleware(model: LanguageModel, tagName = 'think'): LanguageModel {
  return wrapLanguageModel({
    model: model as any,
    middleware: extractReasoningMiddleware({ tagName }),
  }) as LanguageModel;
}

/**
 * Configuration for environment-based provider
 */
export interface EnvironmentProviderConfig {
  production: CustomProviderConfig;
  test: CustomProviderConfig;
  development?: CustomProviderConfig;
}

/**
 * Creates a provider that switches based on environment
 */
export function createEnvironmentProvider(
  config: EnvironmentProviderConfig,
  options?: {
    testEnvironmentCheck?: () => boolean;
    developmentCheck?: () => boolean;
  },
): Provider {
  const isTest =
    options?.testEnvironmentCheck?.() ??
    (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true');

  const isDevelopment = options?.developmentCheck?.() ?? process.env.NODE_ENV === 'development';

  if (isTest) {
    return createCustomProvider(config.test);
  }

  if (isDevelopment && config.development) {
    return createCustomProvider(config.development);
  }

  return createCustomProvider(config.production);
}

/**
 * Provider model registry for organizing model configurations
 */
export interface ProviderModelRegistry {
  chat: string;
  reasoningText?: string;
  title?: string;
  artifact?: string;
  image?: string;
}

/**
 * Creates a provider with a standardized model registry
 */
export function createRegistryProvider(
  models: Record<string, LanguageModel>,
  registry: ProviderModelRegistry,
  options?: {
    enableReasoning?: boolean;
    reasoningTagName?: string;
    imageModels?: Record<string, any>;
  },
): Provider {
  const languageModels: Record<string, LanguageModel> = {};

  // Map registry to actual models
  Object.entries(registry).forEach(([key, modelId]) => {
    if (modelId && models[modelId]) {
      languageModels[`${key}-model`] = models[modelId];
    }
  });

  // Apply reasoning middleware if enabled and reasoning model exists
  if (options?.enableReasoning && registry.reasoningText && models[registry.reasoningText]) {
    languageModels['reasoning-model'] = withReasoningMiddleware(
      models[registry.reasoningText],
      options.reasoningTagName,
    ) as LanguageModel;
  }

  return customProvider({
    languageModels: languageModels as any,
    ...(options?.imageModels && { imageModels: options.imageModels }),
  });
}
