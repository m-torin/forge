import type { LanguageModel } from 'ai';

/**
 * Standard model configuration interface for AI providers
 */
export interface ModelConfig {
  chat: string;
  chatReasoning?: string;
  title?: string;
  artifact?: string;
  embedding?: string;
}

/**
 * Language model interface with role identification
 */
export interface NamedLanguageModel {
  model: LanguageModel;
  modelId: string;
  provider: string;
}

/**
 * Creates a language model wrapper with metadata
 */
export function createNamedModel(
  model: LanguageModel,
  modelId: string,
  provider: string,
): NamedLanguageModel {
  return {
    model,
    modelId,
    provider,
  };
}

/**
 * Standard model roles for different use cases
 */
export const MODEL_ROLES = {
  CHAT: 'chat',
  CHAT_REASONING: 'chatReasoning',
  TITLE: 'title',
  ARTIFACT: 'artifact',
  EMBEDDING: 'embedding',
} as const;

export type ModelRole = (typeof MODEL_ROLES)[keyof typeof MODEL_ROLES];
