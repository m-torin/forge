import { FormValues, MetadataValues } from './formSchema';
import { FbNodeData } from '#/flows/types';
import { OPENAI_MODELS } from './types';

const isOpenAIMetadata = (
  metadata: unknown,
): metadata is NonNullable<MetadataValues> => {
  if (!metadata || typeof metadata !== 'object') return false;
  return 'model' in metadata || 'prompt' in metadata;
};

export const getInitialValues = (data: FbNodeData): FormValues => {
  const safeMetadata = isOpenAIMetadata(data.metadata) ? data.metadata : null;

  return {
    name: data.name,
    isEnabled: data.isEnabled ?? false,
    metadata: safeMetadata ?? {
      model: OPENAI_MODELS.GPT35_TURBO,
      prompt: '',
      systemPrompt: '',
      temperature: 0.7,
      maxTokens: 1024,
      topP: 1,
      presencePenalty: 0,
      frequencyPenalty: 0,
    },
    uxMeta: {
      heading: data.uxMeta?.heading,
      isExpanded: data.uxMeta?.isExpanded,
      layer: data.uxMeta?.layer,
      isLocked: data.uxMeta?.isLocked,
      rotation: data.uxMeta?.rotation,
    },
  };
};
