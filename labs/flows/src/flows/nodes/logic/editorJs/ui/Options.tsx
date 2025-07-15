// JavaScriptEditorNode/ui/Options.tsx
import React, { FC, memo } from 'react';
import { Stack, TextInput, NumberInput } from '@mantine/core';
import { useCombinedContext } from '#/flows/nodes/internal';
import { FormValues } from '../formSchema';

export const NodeOptions: FC = memo(() => {
  const { form } = useCombinedContext<FormValues>();

  return (
    <Stack>
      <TextInput
        label="Heading"
        placeholder="Enter node heading"
        {...form.getInputProps('uxMeta.heading')}
      />
      <NumberInput
        label="Layer"
        placeholder="Visual layer"
        min={0}
        {...form.getInputProps('uxMeta.layer')}
      />
    </Stack>
  );
});

NodeOptions.displayName = 'JavaScriptEditorNodeOptions';
