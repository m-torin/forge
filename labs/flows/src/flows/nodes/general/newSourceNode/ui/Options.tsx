import React, { FC, memo } from 'react';
import { Stack, TextInput } from '@mantine/core';
import { useCombinedContext } from '#/flows/nodes/internal';
import { FormValues } from '../formSchema';

/**
 * UiOptions component renders UI-specific options.
 * It accesses the form context to bind inputs to the nested `uxMeta` field.
 *
 * @returns {JSX.Element} The rendered UiOptions component.
 */
export const NodeOptions: FC = memo(() => {
  const { form } = useCombinedContext<FormValues>();

  return (
    <Stack>
      <TextInput
        label="Heading"
        placeholder="Enter heading for the node"
        {...form.getInputProps('uxMeta.heading')}
      />
    </Stack>
  );
});

NodeOptions.displayName = 'UiOptionsTab';
