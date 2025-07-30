'use client';

import React, { FC, memo } from 'react';
import { Stack, Select, Switch, Flex, rem } from '@mantine/core';
import { useCombinedContext } from '#/flows/nodes/internal';
import { CodeEditor } from '#/ui/formFields';
import { FormValues } from '../formSchema';

export const NodeForm: FC = memo(() => {
  const { form } = useCombinedContext<FormValues>();

  return (
    <Stack>
      <Flex
        gap="md"
        justify="space-between"
        align="center"
        direction="row"
        wrap="wrap"
      >
        <Select
          label="Language"
          data={[
            { label: 'JavaScript', value: 'javascript' },
            { label: 'TypeScript', value: 'typescript' },
          ]}
          {...form.getInputProps('metadata.language')}
        />

        <Switch
          label="Auto Format Code"
          {...form.getInputProps('metadata.autoFormat', { type: 'checkbox' })}
          pt={rem(25)}
        />

        <Select
          label="Editor Theme"
          data={[
            { label: 'Dracula', value: 'dracula' },
            { label: 'Dark', value: 'vs-dark' },
            { label: 'Light', value: 'light' },
          ]}
          {...form.getInputProps('metadata.theme')}
        />
      </Flex>

      <CodeEditor
        key={form.key('metadata.code')}
        {...form.getInputProps('metadata.code')}
        height={500}
        language={form.getValues().metadata?.language ?? 'javascript'}
        theme={form.getValues().metadata?.theme ?? 'dracula'}
      />
    </Stack>
  );
});

NodeForm.displayName = 'JavaScriptEditorNodeForm';
