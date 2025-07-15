import { formSchema, FormValues } from './formSchema';
import { FbNodeData } from '#/flows/types';
import { CLAUDE_MODELS } from './types';

export const getInitialValues = (data: FbNodeData): FormValues => {
  const metadataResult = formSchema.shape.metadata.safeParse(data.metadata);

  return {
    name: data.name,
    isEnabled: data.isEnabled ?? false,
    metadata: metadataResult.success
      ? metadataResult.data
      : {
          model: CLAUDE_MODELS.SONNET,
          prompt: '',
          systemPrompt: '',
          temperature: 0.7,
          maxTokens: 1024,
          topP: 0.7,
          topK: 50,
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
