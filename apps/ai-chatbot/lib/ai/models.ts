import { myProvider } from './providers';

/**
 * Default chat model identifier
 */
export const DEFAULT_CHAT_MODEL: string = 'chat-model';

/**
 * Interface for chat model configuration
 */
export interface ChatModel {
  id: string;
  name: string;
  description: string;
  provider?: string;
}

/**
 * Available chat models configuration
 */
export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Chat model',
    description: 'Primary model for all-purpose chat',
    provider: 'Anthropic',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning',
    provider: 'Anthropic',
  },
];

/**
 * Export model instances for testing and usage
 */
export const chatModel = myProvider.languageModel('chat-model');
export const reasoningModel = myProvider.languageModel('chat-model-reasoning');
export const titleModel = myProvider.languageModel('title-model');
export const artifactModel = myProvider.languageModel('artifact-model');
