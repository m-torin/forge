import { openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import { registry } from '@repo/ai';
import {
  MODEL_ALIASES,
  MODEL_REGISTRY,
  selectModel as aiSelectModel,
  getBestModelForTask,
  getModelConfig,
  getModelRecommendations,
  getModelsByProvider,
  type ModelSelectionStrategy,
  type UserTier,
} from '@repo/ai/models';
import { customProvider } from 'ai';

/**
 * Import and export the enhanced provider registry
 */
import { modelSelectionStrategies, providerRegistry, selectModel } from './provider-registry';

/**
 * Extend shared registry with app-specific model aliases using centralized model configuration
 */
const appSpecificProvider = customProvider({
  languageModels: {
    // App-specific model aliases with dynamic provider selection based on centralized registry
    'chat-model': (() => {
      // Use centralized model selection for chat tasks
      const recommendedModels = getModelRecommendations('chat', 'pro');
      const bestChatModel = recommendedModels[0] || getBestModelForTask('chat');

      // Override with xAI if available and preferred
      if (process.env.XAI_API_KEY) {
        return xai('grok-2-vision-1212');
      }

      // Use centralized model configuration
      const modelConfig = getModelConfig(bestChatModel);
      if (modelConfig?.provider === 'anthropic') {
        return (registry as any).languageModel(`anthropic:${bestChatModel}`);
      }

      return openai('gpt-4o'); // Fallback
    })(),

    'chat-model-reasoning': (() => {
      // Use centralized model selection for reasoning tasks
      const reasoningModel = getBestModelForTask('reasoning');

      // Override with xAI if available and preferred
      if (process.env.XAI_API_KEY) {
        return xai('grok-3-mini-beta');
      }

      // Use centralized model configuration
      const modelConfig = getModelConfig(reasoningModel);
      if (modelConfig?.provider === 'anthropic') {
        return (registry as any).languageModel(`anthropic:${reasoningModel}`);
      }

      return openai('gpt-4o'); // Fallback
    })(),

    'title-model': (() => {
      // Use fast model for simple title generation
      const fastModel = aiSelectModel({
        strategy: 'speed',
        userTier: 'pro',
        fallbackEnabled: true,
        excludeDeprecated: true,
      });

      // Override with xAI if available
      if (process.env.XAI_API_KEY) {
        return xai('grok-2-1212');
      }

      // Use centralized model configuration
      if (fastModel) {
        const modelConfig = getModelConfig(fastModel);
        if (modelConfig?.provider === 'anthropic') {
          return (registry as any).languageModel(`anthropic:${fastModel}`);
        }
      }

      return openai('gpt-4o-mini'); // Fallback
    })(),

    'artifact-model': (() => {
      // Use code-optimized model for artifacts
      const codeModel = getBestModelForTask('code');

      // Override with xAI if available
      if (process.env.XAI_API_KEY) {
        return xai('grok-2-1212');
      }

      // Use centralized model configuration
      const modelConfig = getModelConfig(codeModel);
      if (modelConfig?.provider === 'anthropic') {
        return (registry as any).languageModel(`anthropic:${codeModel}`);
      }

      return openai('gpt-4o'); // Fallback
    })(),
  },
  fallbackProvider: registry as any, // Type assertion to handle version mismatch
});

/**
 * Create a unified provider that supports multiple AI services following AI SDK v5 patterns
 */
export const myProvider = {
  languageModel: (modelId: string) => {
    // Try app-specific aliases first
    if (['chat-model', 'chat-model-reasoning', 'title-model', 'artifact-model'].includes(modelId)) {
      return appSpecificProvider.languageModel(modelId);
    }

    // For direct provider:model format, use shared registry
    if (modelId.includes(':')) {
      return (registry as any).languageModel(modelId); // Type assertion for version compatibility
    }

    // Use centralized MODEL_ALIASES first, then build provider-specific mapping
    const resolvedAlias = MODEL_ALIASES[modelId as keyof typeof MODEL_ALIASES];
    if (resolvedAlias) {
      const config = getModelConfig(resolvedAlias);
      if (config) {
        const mappedId = `${config.provider}:${resolvedAlias}`;
        return (registry as any).languageModel(mappedId);
      }
    }

    // Additional convenience aliases for backward compatibility
    const aliasMap: Record<string, string> = {
      'gpt-4o': 'openai:gpt-4o',
      'gpt-4o-mini': 'openai:gpt-4o-mini',
      'gpt-4o-reasoning': 'openai:gpt-4o-reasoning',
      // Use centralized aliases for Claude models
      'claude-sonnet': `anthropic:${MODEL_ALIASES['claude-chat'] || 'claude-4-sonnet-20250514'}`,
      'claude-sonnet-reasoning': `anthropic:${MODEL_ALIASES['claude-reasoning'] || 'claude-4-opus-20250514'}`,
      'claude-haiku': `anthropic:${MODEL_ALIASES['claude-title'] || 'claude-3-5-haiku-20241022'}`,
      // Other providers
      'gemini-pro': 'google:gemini-pro',
      'gemini-flash': 'google:gemini-flash',
      'perplexity-sonar': 'perplexity:sonar-medium',
      'perplexity-sonar-large': 'perplexity:sonar-large',
    };

    const mappedId = aliasMap[modelId] || modelId;
    return (registry as any).languageModel(mappedId);
  },

  imageModel: (modelId: string) => {
    // Check for xAI image models first
    if (modelId === 'small-model' && process.env.XAI_API_KEY) {
      return xai.image('grok-2-image');
    }

    const imageModelMap: Record<string, string> = {
      'small-model': 'dall-e-3',
    };

    const fullModelId = imageModelMap[modelId] || modelId;
    return (registry as any).imageModel(`openai:${fullModelId}`);
  },

  /**
   * Helper to get available models based on configured API keys and centralized registry
   * @returns Array of available model configurations
   */
  getAvailableModels: () => {
    const available: Array<{
      id: string;
      name: string;
      provider: string;
      description: string;
    }> = [];

    // Always include app-specific aliases (they handle provider fallbacks internally)
    available.push(
      {
        id: 'chat-model',
        name: process.env.XAI_API_KEY ? 'Grok Vision' : 'Chat Model',
        provider: process.env.XAI_API_KEY ? 'xAI' : 'Dynamic',
        description: 'Multimodal chat model',
      },
      {
        id: 'chat-model-reasoning',
        name: process.env.XAI_API_KEY ? 'Grok Reasoning' : 'Reasoning Model',
        provider: process.env.XAI_API_KEY ? 'xAI' : 'Dynamic',
        description: 'Advanced reasoning model',
      },
      {
        id: 'title-model',
        name: 'Title Model',
        provider: 'Dynamic',
        description: 'Title generation model',
      },
      {
        id: 'artifact-model',
        name: 'Artifact Model',
        provider: 'Dynamic',
        description: 'Document creation model',
      },
    );

    // Add models from centralized registry based on available API keys
    const providerKeyMap = {
      anthropic: 'ANTHROPIC_API_KEY',
      openai: 'OPENAI_API_KEY',
      google: 'GOOGLE_AI_API_KEY',
      perplexity: 'PERPLEXITY_API_KEY',
      xai: 'XAI_API_KEY',
    };

    // Get all available models from centralized registry
    Object.entries(providerKeyMap).forEach(([provider, envKey]) => {
      if (process.env[envKey]) {
        const providerModels = getModelsByProvider(provider);

        // Filter to non-deprecated models suitable for chat
        const chatModels = providerModels.filter(
          model =>
            !model.metadata.deprecated &&
            (model.metadata.capabilities?.includes('tools') ||
              model.metadata.capabilities?.includes('reasoning') ||
              model.metadata.capabilities?.includes('multimodal')),
        );

        // Add the most relevant models for each provider
        chatModels.slice(0, 4).forEach(model => {
          available.push({
            id: model.id,
            name: model.metadata.name,
            provider: model.metadata.provider || provider,
            description: model.metadata.description,
          });
        });
      }
    });

    // Deduplicate by ID (app-specific aliases take priority)
    const seen = new Set();
    return available.filter(model => {
      if (seen.has(model.id)) return false;
      seen.add(model.id);
      return true;
    });
  },

  /**
   * Helper to get default model based on centralized recommendations and provider priority
   * @returns Default model identifier
   */
  getDefaultModel: () => {
    // Priority order: xAI > Anthropic (centralized) > OpenAI > Google > Perplexity
    if (process.env.XAI_API_KEY) return 'chat-model';

    // Use centralized model selection for best default
    if (process.env.ANTHROPIC_API_KEY) {
      const bestModel = getBestModelForTask('chat');
      return bestModel || 'claude-4-sonnet-20250514';
    }

    if (process.env.OPENAI_API_KEY) return 'gpt-4o';
    if (process.env.GOOGLE_AI_API_KEY) return 'gemini-pro';
    if (process.env.PERPLEXITY_API_KEY) return 'perplexity-sonar';

    return 'chat-model'; // fallback to app-specific alias
  },
};

/**
 * Export the new enhanced registry as a secondary provider
 */
export const enhancedProvider = providerRegistry;

/**
 * Re-export model selection utilities
 */
export { modelSelectionStrategies, selectModel };

/**
 * Re-export centralized model utilities
 */
export {
  MODEL_REGISTRY,
  getBestModelForTask,
  getModelConfig,
  getModelRecommendations,
  aiSelectModel as selectModelByStrategy,
  type ModelSelectionStrategy,
  type UserTier,
};
