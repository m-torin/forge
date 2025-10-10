import { getModelConfig } from '@repo/ai/models';

const FALLBACK_MODEL_ID = 'grok-2-vision-1212' as const;

export const CHAT_MODEL_IDS = ['grok-2-vision-1212', 'grok-3-mini-reasoning'] as const;

export type ChatModelId = (typeof CHAT_MODEL_IDS)[number];

export interface ChatModel {
  id: ChatModelId;
  name: string;
  description: string;
  provider?: string;
  capabilities: string[];
}

function resolveChatModelMetadata(modelId: ChatModelId): ChatModel {
  const config = getModelConfig(modelId);

  if (!config) {
    return {
      id: modelId,
      name: modelId,
      description: 'Model metadata unavailable',
      capabilities: [],
    };
  }

  const { metadata, provider } = config;

  return {
    id: modelId,
    name: metadata.name,
    description: metadata.description,
    provider,
    capabilities: metadata.capabilities ?? [],
  };
}

export const chatModels: ChatModel[] = CHAT_MODEL_IDS.map(resolveChatModelMetadata);

export const DEFAULT_CHAT_MODEL: ChatModelId =
  chatModels[0]?.id ?? (FALLBACK_MODEL_ID as ChatModelId);

export const PRIMARY_CHAT_MODEL_ID: ChatModelId = CHAT_MODEL_IDS[0];
export const REASONING_CHAT_MODEL_ID: ChatModelId = CHAT_MODEL_IDS[1];

export const isChatModelId = (value: string): value is ChatModelId =>
  (CHAT_MODEL_IDS as readonly string[]).includes(value);

export const getChatModel = (id: ChatModelId): ChatModel => resolveChatModelMetadata(id);
