import { FormValues } from './formSchema';
import { FbNodeData } from '#/flows/types';
import { isRecordObject } from '#/flows/nodes/internal';

export const getInitialValues = (data: FbNodeData): FormValues => ({
  name: data.name,
  isEnabled: data.isEnabled ?? false,
  metadata: isRecordObject(data.metadata) ? data.metadata : null,
  uxMeta: {
    heading: data.uxMeta?.heading ?? undefined,
    isExpanded: data.uxMeta?.isExpanded ?? undefined,
    layer: data.uxMeta?.layer ?? undefined,
    isLocked: data.uxMeta?.isLocked ?? undefined,
    rotation: data.uxMeta?.rotation ?? undefined,
  },
});
