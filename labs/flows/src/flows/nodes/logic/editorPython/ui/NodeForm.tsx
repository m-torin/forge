// PythonEditorNode/ui/NodeForm.tsx
import React, { FC, memo } from 'react';
import { Stack, Select, Switch } from '@mantine/core';
import { useCombinedContext } from '#/flows/nodes/internal';
import { CodeEditor } from '#/ui/formFields';
import { FormValues } from '../formSchema';

export const NodeForm: FC = memo(() => {
  const { form } = useCombinedContext<FormValues>();

  return (
    <Stack>
      <Select
        label="Language"
        data={[
          { label: 'Python', value: 'python' },
          { label: 'TypeScript', value: 'typescript' },
        ]}
        {...form.getInputProps('metadata.language')}
      />

      <Switch
        label="Auto Format Code"
        {...form.getInputProps('metadata.autoFormat', { type: 'checkbox' })}
      />

      <Select
        label="Editor Theme"
        data={[
          { label: 'Dark', value: 'vs-dark' },
          { label: 'Light', value: 'light' },
        ]}
        {...form.getInputProps('metadata.theme')}
      />

      <CodeEditor
        value={form.values.metadata?.code || ''}
        onChange={(value) => form.setFieldValue('metadata.code', value || '')}
        language={form.values.metadata?.language || 'python'}
        // theme={form.values.metadata?.theme}
      />
    </Stack>
  );
});

NodeForm.displayName = 'PythonEditorNodeForm';
