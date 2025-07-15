import { FormValues } from './formSchema';
import { FbNodeData } from '#/flows/types';
import { isRecordObject } from '#/flows/nodes/internal';

const DEFAULT_CODE = `// Write your Python code here
// The 'input' parameter contains data from connected nodes

async function process(input) {
  // Your code here
  return input;
}

// Return the processed result
return await process(input);
`;

const isValidLanguage = (value: unknown): value is 'python' | 'typescript' =>
  value === 'python' || value === 'typescript';

const isValidTheme = (value: unknown): value is 'vs-dark' | 'light' =>
  value === 'vs-dark' || value === 'light';

export const getInitialValues = (data: FbNodeData): FormValues => {
  // Get metadata with type checking
  const rawMetadata = isRecordObject(data.metadata) ? data.metadata : {};

  // Build metadata with type checking
  const metadata = {
    code:
      typeof rawMetadata.code === 'string' ? rawMetadata.code : DEFAULT_CODE,
    language: isValidLanguage(rawMetadata.language)
      ? rawMetadata.language
      : 'python',
    autoFormat:
      typeof rawMetadata.autoFormat === 'boolean'
        ? rawMetadata.autoFormat
        : true,
    theme: isValidTheme(rawMetadata.theme) ? rawMetadata.theme : 'vs-dark',
  };

  return {
    name: data.name,
    isEnabled: data.isEnabled ?? true,
    metadata,
    uxMeta: {
      heading: data.uxMeta?.heading ?? 'Python Editor',
      isExpanded: data.uxMeta?.isExpanded ?? true,
      layer: data.uxMeta?.layer ?? undefined,
      isLocked: data.uxMeta?.isLocked ?? false,
      rotation: data.uxMeta?.rotation ?? 0,
    },
  };
};
