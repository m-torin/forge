'use client';

import React, { FC, memo } from 'react';
import { Stack, Badge, Group, Text, TextInput, Select } from '@mantine/core';
import { useCombinedContext } from '#/flows/nodes/internal';
import { FormValues } from '../formSchema';

const SharedConfig: FC = () => {
  const { form } = useCombinedContext<FormValues>();

  return (
    <Stack>
      <Text fw={500} size="sm">
        Shared Settings
      </Text>
      <TextInput
        label="Region"
        placeholder="us-east-1"
        {...form.getInputProps('metadata.shared.region')}
      />
      <Select
        label="Format"
        placeholder="Select format"
        data={[
          { label: 'JSON', value: 'json' },
          { label: 'XML', value: 'xml' },
          { label: 'Text', value: 'text' },
        ]}
        {...form.getInputProps('metadata.shared.format')}
      />
    </Stack>
  );
};

const SourceConfig: FC = () => {
  const { form } = useCombinedContext<FormValues>();

  return (
    <Stack>
      <Text fw={500} size="sm">
        Source Settings
      </Text>
      <TextInput
        label="Event Bus Name"
        placeholder="Enter event bus name"
        {...form.getInputProps('metadata.source.eventBridge.eventBusName')}
      />
      <TextInput
        label="Event Pattern"
        placeholder="Enter event pattern"
        {...form.getInputProps(
          'metadata.source.eventBridge.eventPattern.source',
        )}
      />
    </Stack>
  );
};

const DestinationConfig: FC = () => {
  const { form } = useCombinedContext<FormValues>();

  return (
    <Stack>
      <Text fw={500} size="sm">
        Destination Settings
      </Text>
      <TextInput
        label="Target Bus"
        placeholder="Enter target bus"
        {...form.getInputProps(
          'metadata.destination.targetSystem.config.busName',
        )}
      />
      <Select
        label="Target Type"
        placeholder="Select target type"
        data={[
          { label: 'EventBridge', value: 'eventbridge' },
          { label: 'SQS', value: 'sqs' },
          { label: 'Lambda', value: 'lambda' },
        ]}
        {...form.getInputProps('metadata.destination.targetSystem.type')}
      />
    </Stack>
  );
};

const EnrichmentConfig: FC = () => {
  const { form } = useCombinedContext<FormValues>();

  return (
    <Stack>
      <Text fw={500} size="sm">
        Enrichment Settings
      </Text>
      <Select
        label="Enrichment Type"
        placeholder="Select enrichment type"
        data={[
          { label: 'Transform', value: 'transform' },
          { label: 'Validate', value: 'validate' },
          { label: 'Filter', value: 'filter' },
        ]}
        {...form.getInputProps('metadata.enrichment.enrichmentType')}
      />
      <TextInput
        label="Rule Configuration"
        placeholder="Enter rule configuration"
        {...form.getInputProps('metadata.enrichment.rules[0].field')}
      />
    </Stack>
  );
};

export const NodeForm: FC = memo(() => {
  const { form } = useCombinedContext<FormValues>();
  const mode = form?.getValues()?.metadata?.nodeMode || 'unknown';

  return (
    <Stack bg="var(--mantine-color-body)" gap="md" p="md">
      <Group>
        <Badge
          variant="filled"
          color={
            mode === 'source'
              ? 'green'
              : mode === 'destination'
                ? 'red'
                : 'blue'
          }
        >
          {mode.toUpperCase()}
        </Badge>
      </Group>

      <SharedConfig />

      {mode === 'source' && <SourceConfig />}
      {mode === 'destination' && <DestinationConfig />}
      {mode === 'enrichment' && <EnrichmentConfig />}
    </Stack>
  );
});

NodeForm.displayName = 'AwsEventBridgeForm';

export default NodeForm;
