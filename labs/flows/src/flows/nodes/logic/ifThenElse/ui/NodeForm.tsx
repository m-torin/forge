import React, { FC, memo } from 'react';
import { Select, Stack, TextInput } from '@mantine/core';
import { useCombinedContext } from '#/flows/nodes/internal';
import { FormValues } from '../formSchema';

/**
 * FormContent component renders the main form fields.
 * It accesses the form context to bind inputs to the form state.
 *
 * @returns {JSX.Element} The rendered FormContent component.
 */
export const NodeForm: FC = memo(() => {
  const { form } = useCombinedContext<FormValues>();

  return (
    <Stack>
      <TextInput
        label="ARN"
        placeholder="Enter ARN"
        {...form.getInputProps('metadata.arn')}
      />
      <TextInput
        label="Field 1"
        placeholder="Enter value for Field 1"
        {...form.getInputProps('metadata.field1')}
      />
      <Select
        data={[
          { label: 'React', value: 'react' },
          { label: 'Angular', value: 'angular' },
        ]}
        label="Your favorite library"
        placeholder="Select a library"
        {...form.getInputProps('metadata.favoriteLibrary')}
      />
    </Stack>
  );
});

NodeForm.displayName = 'FormContentTab';
