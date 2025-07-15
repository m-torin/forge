import { FC } from 'react';
import {
  MultiSelect,
  Group,
  Switch,
  NumberInput,
  Divider,
  Stack,
  Select,
  TextInput,
  Checkbox,
} from '@mantine/core';
import { useCombinedContext } from '#/flows/nodes/internal';
import { FormValues } from '../../formSchema';
import { EventBridgeConfig } from './EventBridgeConfig';

export const SourceConfig: FC = () => {
  const { form } = useCombinedContext<FormValues>();

  const hasRateLimit = form.values.metadata?.source?.enableRateLimit;
  const hasValidation = form.values.metadata?.source?.enableValidation;
  const hasCache = form.values.metadata?.source?.enableCache;

  return (
    <>
      <Divider label="Source Configuration" labelPosition="center" mt="xs" />

      {/* Authentication Requirements */}
      <MultiSelect
        label="Required Headers"
        description="Headers that must be present in incoming requests"
        {...form.getInputProps('metadata.source.requiredHeaders')}
        data={[
          { value: 'content-type', label: 'Content-Type' },
          { value: 'x-api-key', label: 'X-API-Key' },
          { value: 'authorization', label: 'Authorization' },
          { value: 'x-request-id', label: 'X-Request-ID' },
          { value: 'x-correlation-id', label: 'X-Correlation-ID' },
        ]}
        placeholder="Select required headers"
        searchable
        clearable
      />

      {/* Rate Limiting Configuration */}
      <Stack gap="xs">
        <Switch
          label="Enable Rate Limiting"
          description="Limit incoming requests"
          {...form.getInputProps('metadata.source.enableRateLimit', {
            type: 'checkbox',
          })}
        />

        {hasRateLimit && (
          <Group grow>
            <NumberInput
              label="Rate Limit"
              description="Requests per minute"
              min={1}
              max={1000}
              {...form.getInputProps('metadata.source.rateLimit')}
            />
            <Select
              label="Rate Limit Strategy"
              description="How to handle rate limiting"
              {...form.getInputProps('metadata.source.rateLimitStrategy')}
              data={[
                { value: 'sliding', label: 'Sliding Window' },
                { value: 'fixed', label: 'Fixed Window' },
                { value: 'token', label: 'Token Bucket' },
              ]}
            />
          </Group>
        )}
      </Stack>

      {/* Request Validation */}
      <Stack gap="xs">
        <Switch
          label="Enable Request Validation"
          description="Validate incoming request payloads"
          {...form.getInputProps('metadata.source.enableValidation', {
            type: 'checkbox',
          })}
        />

        {hasValidation && (
          <Group grow>
            <Select
              label="Validation Schema"
              description="Schema format for validation"
              {...form.getInputProps('metadata.source.validationSchema')}
              data={[
                { value: 'json', label: 'JSON Schema' },
                { value: 'yup', label: 'Yup' },
                { value: 'zod', label: 'Zod' },
              ]}
            />
            <TextInput
              label="Schema Path"
              description="Path to validation schema"
              placeholder="/schemas/request.json"
              {...form.getInputProps('metadata.source.schemaPath')}
            />
          </Group>
        )}
      </Stack>

      {/* Caching Configuration */}
      <Stack gap="xs">
        <Switch
          label="Enable Response Caching"
          description="Cache responses for identical requests"
          {...form.getInputProps('metadata.source.enableCache', {
            type: 'checkbox',
          })}
        />

        {hasCache && (
          <Group grow>
            <NumberInput
              label="Cache Duration"
              description="Time in seconds"
              min={60}
              max={86400}
              {...form.getInputProps('metadata.source.cacheDuration')}
            />
            <Select
              label="Cache Strategy"
              description="How to handle cache keys"
              {...form.getInputProps('metadata.source.cacheStrategy')}
              data={[
                { value: 'path', label: 'Path Only' },
                { value: 'query', label: 'Path + Query' },
                { value: 'body', label: 'Full Request' },
              ]}
            />
          </Group>
        )}
      </Stack>

      {/* Request Size Limits */}
      <Group grow>
        <Select
          label="Max Request Size"
          description="Maximum allowed request size"
          {...form.getInputProps('metadata.source.maxRequestSize')}
          data={[
            { value: '1mb', label: '1 MB' },
            { value: '5mb', label: '5 MB' },
            { value: '10mb', label: '10 MB' },
            { value: '50mb', label: '50 MB' },
            { value: 'unlimited', label: 'Unlimited' },
          ]}
        />
        <NumberInput
          label="Request Timeout"
          description="Timeout in seconds"
          min={1}
          max={300}
          {...form.getInputProps('metadata.source.timeout')}
        />
      </Group>

      {/* Security Options */}
      <Stack gap="xs">
        <Checkbox
          label="Enable CORS"
          {...form.getInputProps('metadata.source.enableCors', {
            type: 'checkbox',
          })}
        />
        <Checkbox
          label="Force HTTPS"
          {...form.getInputProps('metadata.source.forceHttps', {
            type: 'checkbox',
          })}
        />
        <Checkbox
          label="Enable Request Logging"
          {...form.getInputProps('metadata.source.enableLogging', {
            type: 'checkbox',
          })}
        />
      </Stack>

      {/* Event Bridge Integration */}
      <EventBridgeConfig form={form} />
    </>
  );
};

export default SourceConfig;
