import { openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import { registry } from '@repo/ai';
import { customProvider } from 'ai';

/**
 * Import and export the enhanced provider registry
 */
import { modelSelectionStrategies, providerRegistry, selectModel } from './provider-registry';

/**
 * Extend shared registry with app-specific model aliases using AI SDK v5 patterns
 */
const appSpecificProvider = customProvider({
  languageModels: {
    // App-specific model aliases with dynamic provider selection
    'chat-model': (() => {
      // Default to xAI if available, otherwise OpenAI
      if (process.env.XAI_API_KEY) {
        return xai('grok-2-vision-1212');
      }
      return openai('gpt-4o');
    })(),

    'chat-model-reasoning': (() => {
      if (process.env.XAI_API_KEY) {
        return xai('grok-3-mini-beta');
      }
      return openai('gpt-4o');
    })(),

    'title-model': (() => {
      if (process.env.XAI_API_KEY) {
        return xai('grok-2-1212');
      }
      return openai('gpt-4o-mini');
    })(),

    'artifact-model': (() => {
      if (process.env.XAI_API_KEY) {
        return xai('grok-2-1212');
      }
      return openai('gpt-4o');
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

    // For convenience aliases, try shared registry first
    const aliasMap: Record<string, string> = {
      'gpt-4o': 'openai:gpt-4o',
      'gpt-4o-mini': 'openai:gpt-4o-mini',
      'gpt-4o-reasoning': 'openai:gpt-4o-reasoning',
      'claude-sonnet': 'anthropic:sonnet',
      'claude-sonnet-reasoning': 'anthropic:sonnet-reasoning',
      'claude-haiku': 'anthropic:haiku',
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
   * Helper to get available models based on configured API keys
   * @returns Array of available model configurations
   */
  getAvailableModels: () => {
    const available: Array<{
      id: string;
      name: string;
      provider: string;
      description: string;
    }> = [];

    // Check which providers are available based on API keys and add app-specific aliases
    if (process.env.XAI_API_KEY) {
      available.push(
        {
          id: 'chat-model',
          name: 'Grok Vision',
          provider: 'xAI',
          description: 'Multimodal chat model',
        },
        {
          id: 'chat-model-reasoning',
          name: 'Grok Reasoning',
          provider: 'xAI',
          description: 'Advanced reasoning model',
        },
        {
          id: 'title-model',
          name: 'Grok Title',
          provider: 'xAI',
          description: 'Title generation model',
        },
        {
          id: 'artifact-model',
          name: 'Grok Artifact',
          provider: 'xAI',
          description: 'Document creation model',
        },
      );
    } else {
      // Fallback to OpenAI when xAI is not available
      available.push(
        {
          id: 'chat-model',
          name: 'GPT-4o Chat',
          provider: 'OpenAI',
          description: 'Multimodal chat model',
        },
        {
          id: 'chat-model-reasoning',
          name: 'GPT-4o Reasoning',
          provider: 'OpenAI',
          description: 'Advanced reasoning model',
        },
        {
          id: 'title-model',
          name: 'GPT-4o Mini',
          provider: 'OpenAI',
          description: 'Title generation model',
        },
        {
          id: 'artifact-model',
          name: 'GPT-4o Artifact',
          provider: 'OpenAI',
          description: 'Document creation model',
        },
      );
    }

    if (process.env.OPENAI_API_KEY) {
      available.push(
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Most capable model' },
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          provider: 'OpenAI',
          description: 'Fast and efficient',
        },
        {
          id: 'gpt-4o-reasoning',
          name: 'GPT-4o Reasoning',
          provider: 'OpenAI',
          description: 'Advanced reasoning',
        },
      );
    }

    if (process.env.ANTHROPIC_API_KEY) {
      available.push(
        {
          id: 'claude-sonnet',
          name: 'Claude Sonnet',
          provider: 'Anthropic',
          description: 'Balanced performance',
        },
        {
          id: 'claude-sonnet-reasoning',
          name: 'Claude Sonnet Reasoning',
          provider: 'Anthropic',
          description: 'Advanced reasoning',
        },
        {
          id: 'claude-haiku',
          name: 'Claude Haiku',
          provider: 'Anthropic',
          description: 'Fast and efficient',
        },
      );
    }

    if (process.env.GOOGLE_AI_API_KEY) {
      available.push(
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          provider: 'Google',
          description: 'Most capable Google model',
        },
        {
          id: 'gemini-flash',
          name: 'Gemini Flash',
          provider: 'Google',
          description: 'Fast and efficient',
        },
      );
    }

    if (process.env.PERPLEXITY_API_KEY) {
      available.push(
        {
          id: 'perplexity-sonar',
          name: 'Perplexity Sonar',
          provider: 'Perplexity',
          description: 'Web-enhanced model',
        },
        {
          id: 'perplexity-sonar-large',
          name: 'Perplexity Sonar Large',
          provider: 'Perplexity',
          description: 'Large web-enhanced model',
        },
      );
    }

    return available;
  },

  /**
   * Helper to get default model based on provider priority
   * @returns Default model identifier
   */
  getDefaultModel: () => {
    // Priority order: xAI > OpenAI > Anthropic > Google > Perplexity
    if (process.env.XAI_API_KEY) return 'chat-model';
    if (process.env.OPENAI_API_KEY) return 'gpt-4o';
    if (process.env.ANTHROPIC_API_KEY) return 'claude-sonnet';
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
