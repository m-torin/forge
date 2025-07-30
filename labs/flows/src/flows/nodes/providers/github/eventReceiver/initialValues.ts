import { FormValues } from './formSchema';
import { FbNodeData } from '#/flows/types';
import { isRecordObject } from '#/flows/nodes/internal';

export const getInitialValues = (data: FbNodeData): FormValues => ({
  name: data.name,
  isEnabled: data.isEnabled ?? false,
  metadata: isRecordObject(data.metadata)
    ? {
        repositoryUrl: String(data.metadata.repositoryUrl || ''),
        secret: String(data.metadata.secret || ''),
        events: Array.isArray(data.metadata.events)
          ? data.metadata.events.map(String)
          : [],
        webhookUrl: data.metadata.webhookUrl
          ? String(data.metadata.webhookUrl)
          : undefined,
      }
    : null,
  uxMeta: {
    heading: data.uxMeta?.heading ?? undefined,
    isExpanded: data.uxMeta?.isExpanded ?? undefined,
    layer: data.uxMeta?.layer ?? undefined,
  },
});
