import { getBestModelForTask, getChatModels, getModelConfig } from '@repo/ai/models';
import { myProvider } from './providers';

/**
 * Default chat model identifier - uses centralized selection
 */
export const DEFAULT_CHAT_MODEL: string = (() => {
  const bestChatModel = getBestModelForTask('chat');
  return bestChatModel || 'chat-model';
})();

/**
 * Interface for chat model configuration - extended from centralized registry
 */
export interface ChatModel {
  id: string;
  name: string;
  description: string;
  provider?: string;
  capabilities?: string[];
  reasoning?: boolean;
  deprecated?: boolean;
}

/**
 * Available chat models configuration - dynamically built from centralized registry
 */
export const chatModels: Array<ChatModel> = (() => {
  const models: ChatModel[] = [];

  // Always include app-specific aliases
  models.push(
    {
      id: 'chat-model',
      name: 'Chat Model',
      description: 'Primary model for all-purpose chat (dynamic provider selection)',
      provider: 'Dynamic',
      capabilities: ['tools', 'multimodal', 'reasoning'],
      reasoning: true,
    },
    {
      id: 'chat-model-reasoning',
      name: 'Reasoning Model',
      description: 'Advanced reasoning model (dynamic provider selection)',
      provider: 'Dynamic',
      capabilities: ['reasoning', 'tools', 'multimodal'],
      reasoning: true,
    },
  );

  // Add models from centralized registry
  const centralizedChatModels = getChatModels();

  // Convert centralized models to chatbot format
  centralizedChatModels.forEach(modelConfig => {
    // Skip deprecated models for main UI
    if (modelConfig.metadata.deprecated) return;

    models.push({
      id: modelConfig.id,
      name: modelConfig.metadata.name,
      description: modelConfig.metadata.description,
      provider: modelConfig.metadata.provider,
      capabilities: modelConfig.metadata.capabilities,
      reasoning: modelConfig.metadata.reasoning?.supported || false,
      deprecated: modelConfig.metadata.deprecated || false,
    });
  });

  return models;
})();

/**
 * Get models by capability
 */
export function getModelsByCapability(capability: string): ChatModel[] {
  return chatModels.filter(model => model.capabilities?.includes(capability) || false);
}

/**
 * Get reasoning-enabled models
 */
export function getReasoningModels(): ChatModel[] {
  return chatModels.filter(model => model.reasoning);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: string): ChatModel[] {
  return chatModels.filter(model => model.provider?.toLowerCase() === provider.toLowerCase());
}

/**
 * Get model recommendations for specific use cases
 */
export function getModelRecommendationsForUseCase(useCase: string): ChatModel[] {
  const useCaseMap: Record<string, string[]> = {
    'general-chat': ['reasoning', 'tools', 'multimodal'],
    coding: ['tools', 'code'],
    analysis: ['reasoning', 'tools'],
    creative: ['tools', 'multimodal'],
    vision: ['vision', 'multimodal'],
    automation: ['computer-use', 'tools'],
  };

  const requiredCapabilities = useCaseMap[useCase] || ['tools'];

  return chatModels
    .filter(model => {
      if (model.deprecated) return false;
      return requiredCapabilities.some(cap => model.capabilities?.includes(cap));
    })
    .slice(0, 5); // Limit to top 5 recommendations
}

/**
 * Export model instances for testing and usage
 */
export const chatModel = myProvider.languageModel('chat-model');
export const reasoningModel = myProvider.languageModel('chat-model-reasoning');
export const titleModel = myProvider.languageModel('title-model');
export const artifactModel = myProvider.languageModel('artifact-model');

/**
 * Helper to get a model instance by ID
 */
export function getModelInstance(modelId: string) {
  return myProvider.languageModel(modelId);
}

/**
 * Check if a model is available based on current API key configuration
 */
export function isModelAvailable(modelId: string): boolean {
  const config = getModelConfig(modelId);
  if (!config) return false;

  const providerKeyMap: Record<string, string> = {
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    google: 'GOOGLE_AI_API_KEY',
    perplexity: 'PERPLEXITY_API_KEY',
    xai: 'XAI_API_KEY',
  };

  const requiredKey = providerKeyMap[config.provider];
  return requiredKey ? Boolean(process.env[requiredKey]) : true;
}
