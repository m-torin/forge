'use client';

import React, { useState, useTransition } from 'react';
import {
  TextInput,
  Text,
  Box,
  Button,
  Group,
  Code,
  Select } from '@mantine/core';
import { useFlowFormContext } from '#/app/flow/[cuid]/FlowProvider';
import { FlowProviderFormValues } from '../../types';
import { logInfo } from '@repo/observability';

interface DatabaseElement {
  id: string;
  name: string;
  type: string;
  hostedOn: string;
  options: string;
  dbString: string;
  arn: string;
}

const databaseElements: DatabaseElement[] = [
  {
    id: '1',
    name: 'Space Meta',
    type: 'Postgres',
    hostedOn: 'AWS',
    options: 'enabled',
    dbString: '',
    arn: 'arn:aws:some-arn-structure',
  },
  {
    id: '2',
    name: 'Data Lake',
    type: 'MySQL',
    hostedOn: 'Azure',
    options: 'disabled',
    dbString: '',
    arn: '',
  },
];

export const FlowSettings: React.FC = () => {
  const [_isPending, startTransition] = useTransition();
  const [_elements, setElements] = useState<DatabaseElement[]>(databaseElements);
  const [submittedValues, setSubmittedValues] =
    useState<FlowProviderFormValues | null>(null);

  const _handleElementsChange = (newElements: DatabaseElement[]) => {
    startTransition(() => {
      setElements(newElements);
      logInfo('Auto-saving changes', { newElements });
    });
  };

  const form = useFlowFormContext();

  const handleSubmit = (values: FlowProviderFormValues) => {
    setSubmittedValues(values);
    logInfo('Form Submitted', { values });
  };

  return (
    <Box>
      <Box mt="md">
        <TextInput
          label="Name"
          placeholder="Enter value for Name"
          {...form.getInputProps('name')}
        />
      </Box>

      <Box mt="md">
        <Select
          label="Flow Method"
          placeholder="Choose flow method"
          data={[
            { value: 'graphOnly', label: 'Graph Only' },
            { value: 'observable', label: 'Observable' },
            { value: 'sequential', label: 'Sequential' },
          ]}
          {...form.getInputProps('method')}
        />
      </Box>

      <Box mt="md">
        TagsInput
        {/* <TagsInput
          label="Tags"
          placeholder="Add tags"
          value={form.values.tags || []}
          onChange={(newTags) => form.setFieldValue('tags', newTags)}
        /> */}
      </Box>

      <Group align="right" mt="md">
        <Button onClick={form.reset}>Reset</Button>
      </Group>

      <Box mt="md">
        <Text>Form values:</Text>
        <Code block>{JSON.stringify(form.getValues(), null, 2)}</Code>
      </Box>

      <Box mt="md">
        <Text>Submitted values:</Text>
        <Code block>
          {submittedValues ? JSON.stringify(submittedValues, null, 2) : '–'}
        </Code>
      </Box>

      <Group align="center" mt="md">
        <Button onClick={() => handleSubmit(form.getValues())}>Submit</Button>
      </Group>
    </Box>
  );
};
