import { xai } from '@ai-sdk/xai';
import type { LanguageModel } from 'ai';
import { createCustomProvider, withReasoningMiddleware } from './custom-providers';

// Simple mock model for testing
function createMockModel(): LanguageModel {
  return {
    id: 'mock-model',
    doGenerate: async () => ({
      text: 'Mock response',
      finishReason: 'stop',
      usage: { inputTokens: 10, outputTokens: 10 },
      rawCall: { rawPrompt: '', rawSettings: {} },
    }),
    doStream: async function* () {
      // V5 stream pattern: start -> delta -> end -> finish
      yield { type: 'stream-start' };
      yield { type: 'text', text: 'Mock response' };
      yield {
        type: 'finish',
        finishReason: 'stop',
        usage: { inputTokens: 10, outputTokens: 10 },
      };
    },
  } as unknown as LanguageModel;
}

/**
 * XAI provider configuration options
 */
export interface XAIProviderConfig {
  /** Models to use for different purposes */
  models: {
    chat?: string;
    chatReasoning?: string;
    title?: string;
    artifact?: string;
  };
  /** Image models configuration */
  imageModels?: {
    small?: string;
  };
  /** Test environment models (mock models for testing) */
  testModels?: {
    chat?: LanguageModel;
    chatReasoning?: LanguageModel;
    title?: LanguageModel;
    artifact?: LanguageModel;
  };
  /** Enable reasoning middleware for chat reasoning model */
  reasoningConfig?: {
    enabled: boolean;
    tagName?: string;
  };
}

/**
 * Default XAI model configuration
 */
export const DEFAULT_XAI_MODELS = {
  chat: 'grok-2-vision-1212',
  chatReasoning: 'grok-3-mini-beta',
  title: 'grok-2-1212',
  artifact: 'grok-2-1212',
} as const;

/**
 * Default XAI image models
 */
export const DEFAULT_XAI_IMAGE_MODELS = {
  small: 'grok-2-image',
} as const;

/**
 * Create XAI provider with custom configuration
 */
export function createXAIProvider(config: XAIProviderConfig, isTestEnvironment = false) {
  const {
    models = DEFAULT_XAI_MODELS,
    imageModels = DEFAULT_XAI_IMAGE_MODELS,
    testModels,
    reasoningConfig = { enabled: true, tagName: 'think' },
  } = config;

  // Use test models in test environment if provided
  if (isTestEnvironment && testModels) {
    return createCustomProvider({
      languageModels: {
        'chat-model': testModels.chat || createMockModel(),
        'chat-model-reasoning': testModels.chatReasoning || createMockModel(),
        'title-model': testModels.title || createMockModel(),
        'artifact-model': testModels.artifact || createMockModel(),
      },
    });
  }

  // Production XAI provider configuration
  const languageModels: Record<string, LanguageModel> = {
    'chat-model': xai(models.chat || DEFAULT_XAI_MODELS.chat),
    'title-model': xai(models.title || DEFAULT_XAI_MODELS.title),
    'artifact-model': xai(models.artifact || DEFAULT_XAI_MODELS.artifact),
  };

  // Add reasoning model with middleware if enabled
  if (reasoningConfig.enabled) {
    const reasoningModel = xai(models.chatReasoning || DEFAULT_XAI_MODELS.chatReasoning);
    languageModels['chat-model-reasoning'] = withReasoningMiddleware(
      reasoningModel,
      reasoningConfig.tagName || 'think',
    );
  } else {
    languageModels['chat-model-reasoning'] = xai(
      models.chatReasoning || DEFAULT_XAI_MODELS.chatReasoning,
    );
  }

  const providerConfig: Parameters<typeof createCustomProvider>[0] = {
    languageModels,
  };

  // Add image models if configured
  if (imageModels.small) {
    providerConfig.imageModels = {
      'small-model': xai.image(imageModels.small),
    };
  }

  return createCustomProvider(providerConfig);
}

/**
 * Create XAI provider with standard configuration
 */
export function createStandardXAIProvider(
  isTestEnvironment = false,
  testModels?: XAIProviderConfig['testModels'],
) {
  return createXAIProvider(
    {
      models: DEFAULT_XAI_MODELS,
      imageModels: DEFAULT_XAI_IMAGE_MODELS,
      testModels,
      reasoningConfig: { enabled: true, tagName: 'think' },
    },
    isTestEnvironment,
  );
}
