import React, { FC, memo } from 'react';
import {
  Box,
  NumberInput,
  rem,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
} from '@mantine/core';
import { useCombinedContext } from '#/flows/nodes/internal';
import { FormValues } from '../formSchema';
import { MODEL_OPTIONS } from '../types';
import { AdvancedSettings } from '#/ui/formFields';

/**
 * FormContent component renders the main form fields.
 * It accesses the form context to bind inputs to the form state.
 *
 * @returns {JSX.Element} The rendered FormContent component.
 */
export const NodeForm: FC = memo(() => {
  const { form } = useCombinedContext<FormValues>();

  return (
    <Box p="md">
      <Stack gap="md">
        <Select
          {...form.getInputProps('metadata.model', {
            withError: true,
            withFocus: true,
          })}
          key={form.key('metadata.model')}
          label="Model"
          placeholder="Select Claude model"
          data={MODEL_OPTIONS}
          withAsterisk
          clearable={false}
          required
          maw={rem(200)}
        />

        <Textarea
          {...form.getInputProps('metadata.systemPrompt')}
          key={form.key('metadata.systemPrompt')}
          label="System Prompt"
          placeholder="Optional system prompt to set context"
          description="Set the AI's behavior and context"
          autosize
          minRows={2}
          maxRows={4}
        />

        <Textarea
          {...form.getInputProps('metadata.prompt')}
          key={form.key('metadata.prompt')}
          label="Prompt Template"
          description="Use {{variableName}} for dynamic values from input"
          placeholder="Example: Analyze the following text: {{content}}"
          autosize
          minRows={4}
          maxRows={8}
          withAsterisk
          required
        />

        <AdvancedSettings>
          <SimpleGrid cols={2}>
            <NumberInput
              {...form.getInputProps('metadata.temperature')}
              key={form.key('metadata.temperature')}
              label="Temperature"
              description="Lower values make output more focused and deterministic"
              min={0}
              max={1}
              step={0.1}
              decimalScale={2}
            />

            <NumberInput
              {...form.getInputProps('metadata.maxTokens')}
              key={form.key('metadata.maxTokens')}
              label="Max Tokens"
              description="Maximum length of the generated response"
              min={1}
              max={4096}
              step={1}
            />

            <NumberInput
              {...form.getInputProps('metadata.topP')}
              key={form.key('metadata.topP')}
              label="Top P"
              description="Nucleus sampling threshold"
              min={0}
              max={1}
              step={0.1}
              decimalScale={2}
            />

            <NumberInput
              {...form.getInputProps('metadata.topK')}
              key={form.key('metadata.topK')}
              label="Top K"
              description="Number of tokens to consider for sampling"
              min={1}
              max={100}
              step={1}
            />
          </SimpleGrid>
        </AdvancedSettings>
      </Stack>
    </Box>
  );
});

NodeForm.displayName = 'NodeForm';
