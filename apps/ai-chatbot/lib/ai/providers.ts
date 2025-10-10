import { models } from '@repo/ai/providers';
import { createVercelAiGateway } from '@repo/ai/providers/vercel-ai-gateway';
import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from 'ai';
import { isTestEnvironment } from '../constants';
import { PRIMARY_CHAT_MODEL_ID, REASONING_CHAT_MODEL_ID, type ChatModelId } from './models';

type GatewayModelResolver = (modelId: string) => ReturnType<typeof models.language>;

let cachedGateway: ReturnType<typeof createVercelAiGateway> | null = null;
let registrySupportsGateway: boolean | null = null;

const getGatewayInstance = () => {
  if (!cachedGateway) {
    cachedGateway = createVercelAiGateway();
  }
  return cachedGateway;
};

const resolveGatewayModel: GatewayModelResolver = modelId => {
  if (registrySupportsGateway !== false) {
    try {
      const model = models.language(`vercelAiGateway:${modelId}`);
      registrySupportsGateway = true;
      return model;
    } catch {
      registrySupportsGateway = false;
    }
  }

  const gateway = getGatewayInstance();
  return gateway.languageModel(modelId);
};

const gatewayModelId = (modelId: ChatModelId) => `xai/${modelId}`;

export const myProvider = isTestEnvironment
  ? (() => {
      // eslint-disable-next-line import/extensions
      const { artifactModel, chatModel, reasoningModel, titleModel } = require('./models.mock');
      return customProvider({
        languageModels: {
          [PRIMARY_CHAT_MODEL_ID]: chatModel,
          [REASONING_CHAT_MODEL_ID]: reasoningModel,
          'title-model': titleModel,
          'artifact-model': artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        [PRIMARY_CHAT_MODEL_ID]: resolveGatewayModel(gatewayModelId(PRIMARY_CHAT_MODEL_ID)),
        [REASONING_CHAT_MODEL_ID]: wrapLanguageModel({
          model: resolveGatewayModel(gatewayModelId(REASONING_CHAT_MODEL_ID)),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': resolveGatewayModel('xai/grok-2-1212'),
        'artifact-model': resolveGatewayModel('xai/grok-2-1212'),
      },
    });
