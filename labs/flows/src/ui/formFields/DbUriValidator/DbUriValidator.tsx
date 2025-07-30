// DbUriValidator.tsx
'use client';

import React, { FC, useMemo, useEffect } from 'react';
import {
  Box,
  Progress,
  TextInput,
  Group,
  Text,
  Center,
  Tooltip,
  Alert,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';
import { ConnectionString } from 'connection-string';
import {
  UriRequirementProps,
  ValidationResult,
  allowedProtocols,
  getProtocolConfig,
  validateUriComponents,
  getStrength,
  generateErrorSummary,
  uriSchema,
} from './utils';

// Make the props generic
interface DbUriValidatorProps<T extends { uri: string }> {
  form: UseFormReturnType<T>;
}

const UriRequirement: FC<UriRequirementProps> = ({
  meets,
  label,
  tooltip,
  show,
}) =>
  show ? (
    <Tooltip label={tooltip} position="right" withArrow>
      <Text component="div" color={meets ? 'teal' : 'red'} mt={5} size="sm">
        <Center inline>
          {meets ? (
            <IconCheck size="0.9rem" stroke={1.5} />
          ) : (
            <IconX size="0.9rem" stroke={1.5} />
          )}
          <Box ml={7}>
            <Text fw={700}>{label}</Text>
          </Box>
        </Center>
      </Text>
    </Tooltip>
  ) : null;

const Bars: FC<{ strength: number; uriLength: number }> = ({
  strength,
  uriLength,
}) => (
  <Group gap={5} grow mt="xs" mb="md">
    {['segment-1', 'segment-2', 'segment-3', 'segment-4', 'segment-5', 'segment-6'].map((segmentId, index) => (
        <Progress
          styles={{ section: { transitionDuration: '0ms' } }}
          value={
            uriLength > 0 && index === 0
              ? 100
              : strength >= ((index + 1) / 6) * 100
                ? 100
                : 0
          }
          color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
          key={segmentId}
          size={4}
        />
      ))}
  </Group>
);

const ParsedDetails: FC<{ validationResults: ValidationResult }> = ({
  validationResults,
}) => (
  <div style={{ marginTop: '1rem' }}>
    <Text>Parsed Details:</Text>
    <Group justify="space-between">
      <Text>
        <strong>Protocol:</strong>{' '}
        {validationResults.protocol ? 'Valid' : 'Invalid or Missing'}
      </Text>
      <Text>
        <strong>Hostname:</strong>{' '}
        {validationResults.hostname ? 'Valid' : 'Invalid or Missing'}
      </Text>
      <Text>
        <strong>Port:</strong>{' '}
        {validationResults.port ? 'Valid' : 'Invalid or Missing'}
      </Text>
      <Text>
        <strong>Path:</strong>{' '}
        {validationResults.path ? 'Valid' : 'Invalid or Missing'}
      </Text>
      <Text>
        <strong>User:</strong>{' '}
        {validationResults.user ? 'Valid' : 'Invalid or Missing'}
      </Text>
      <Text>
        <strong>Password:</strong>{' '}
        {validationResults.password ? 'Valid' : 'Invalid or Missing'}
      </Text>
    </Group>
  </div>
);

export const DbUriValidator = <T extends { uri: string }>({
  form,
}: DbUriValidatorProps<T>) => {
  const { values, errors } = form;
  const cs = useMemo(() => new ConnectionString(values.uri), [values.uri]);
  const validationResults = useMemo(() => validateUriComponents(cs), [cs]);
  const strength = useMemo(
    () => getStrength(validationResults),
    [validationResults],
  );

  const checks = useMemo(
    () => [
      {
        label: 'Protocol',
        meets: validationResults.protocol,
        tooltip: `Allowed protocols are ${allowedProtocols.join(', ')}.`,
        show: form.isTouched('uri') || validationResults.protocol,
      },
      {
        label: 'Hostname',
        meets: validationResults.hostname,
        tooltip: 'The URI must include a valid hostname.',
        show: form.isTouched('uri') || validationResults.hostname,
      },
      {
        label: 'Port (if applicable)',
        meets: validationResults.port,
        tooltip: 'The URI must include a valid port number, except for sqlite.',
        show: form.isTouched('uri') || validationResults.port,
      },
      {
        label: 'Path',
        meets: validationResults.path,
        tooltip: 'The URI must include a valid path.',
        show: form.isTouched('uri') || validationResults.path,
      },
      {
        label: 'User',
        meets: validationResults.user,
        tooltip: 'The URI must include a valid user.',
        show: form.isTouched('uri') || validationResults.user,
      },
      {
        label: 'Password',
        meets: validationResults.password,
        tooltip: 'The URI must include a valid password.',
        show: form.isTouched('uri') || validationResults.password,
      },
    ],
    [validationResults, form],
  );

  useEffect(() => {
    const validationResult = uriSchema.safeParse(values.uri);
    if (!validationResult.success) {
      form.setFieldError('uri', 'Invalid URI format');
    } else {
      form.clearFieldError('uri');
    }
  }, [values.uri, form]);

  return (
    <div>
      <Tooltip
        arrowOffset={10}
        arrowSize={6}
        label={errors.uri || 'Enter a valid database URI'}
        position="bottom-start"
        withArrow
        opened={!!errors.uri && form.isTouched('uri')}
        color={Object.values(validationResults).every(Boolean) ? 'teal' : 'red'}
      >
        <TextInput
          {...form.getInputProps('uri')}
          placeholder={
            getProtocolConfig(new ConnectionString(values.uri).protocol)
              .placeholder
          }
          label="Database URI"
          required
          rightSection={
            <Tooltip
              label={
                getProtocolConfig(new ConnectionString(values.uri).protocol)
                  .tooltip
              }
              position="top-end"
              withArrow
            >
              <Text component="div" color="dimmed" style={{ cursor: 'help' }}>
                <Center>
                  <IconInfoCircle
                    style={{ width: '18px', height: '18px' }}
                    stroke={1.5}
                  />
                </Center>
              </Text>
            </Tooltip>
          }
          error={errors.uri}
        />
      </Tooltip>

      {form.isTouched('uri') && errors.uri && (
        <Alert
          title="Validation Errors"
          color="red"
          withCloseButton
          closeButtonLabel="Close alert"
        >
          {errors.uri}
          {errors.uri === 'Invalid URI format'
            ? ''
            : generateErrorSummary(validationResults, cs)}
        </Alert>
      )}

      <Bars strength={strength} uriLength={values.uri.length} />

      <Group justify="space-between">
        {checks.map((requirement, _index) => (
          <UriRequirement
            key={`requirement-${requirement.label}`}
            label={requirement.label}
            meets={requirement.meets}
            tooltip={requirement.tooltip}
            show={requirement.show}
          />
        ))}
      </Group>

      {values.uri && <ParsedDetails validationResults={validationResults} />}
    </div>
  );
};
