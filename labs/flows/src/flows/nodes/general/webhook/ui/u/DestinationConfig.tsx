import { FC } from 'react';
import {
  Stack,
  TextInput,
  Select,
  Text,
  Button,
  Group,
  MultiSelect,
  NumberInput,
  Divider,
  rem,
  JsonInput,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useCombinedContext } from '#/flows/nodes/internal';
import { FormValues } from '../../formSchema';

export const DestinationConfig: FC = () => {
  const { form } = useCombinedContext<FormValues>();

  const httpMethod = form.values.metadata?.shared?.method || 'POST';
  const isGetMethod = httpMethod === 'GET';

  const addHeader = () =>
    form.insertListItem('metadata.destination.customHeaders', {
      key: '',
      value: '',
    });

  const removeHeader = (index: number) =>
    form.removeListItem('metadata.destination.customHeaders', index);

  return (
    <>
      <Divider
        label="Destination Configuration"
        labelPosition="center"
        mt="xs"
      />

      {/* Target URL Configuration */}
      <TextInput
        label="Target URL"
        description="The endpoint URL to send requests to"
        placeholder="https://api.example.com/webhook"
        required
        {...form.getInputProps('metadata.destination.targetUrl')}
      />

      {/* Query Parameters for GET requests */}
      {isGetMethod && (
        <JsonInput
          label="Query Parameters"
          description="JSON object of query parameters"
          placeholder={`{
  "key1": "value1",
  "key2": "value2"
}`}
          formatOnBlur
          autosize
          minRows={3}
          validationError="Invalid JSON"
          {...form.getInputProps('metadata.destination.queryParams')}
        />
      )}

      {/* Request Body for non-GET requests */}
      {!isGetMethod && (
        <JsonInput
          label="Request Body Template"
          description="JSON template for the request payload"
          placeholder={`{
  "data": "{{input}}",
  "timestamp": "{{timestamp}}"
}`}
          formatOnBlur
          autosize
          minRows={4}
          validationError="Invalid JSON"
          {...form.getInputProps('metadata.destination.bodyTemplate')}
        />
      )}

      <Select
        label="Authentication Type"
        {...form.getInputProps('metadata.destination.authType')}
        data={[
          { value: 'none', label: 'No Authentication' },
          { value: 'bearer', label: 'Bearer Token' },
          { value: 'api_key', label: 'API Key' },
          { value: 'basic', label: 'Basic Auth' },
        ]}
      />

      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            Custom Headers
          </Text>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPlus size={rem(14)} />}
            onClick={addHeader}
          >
            Add Header
          </Button>
        </Group>

        {form.values.metadata?.destination?.customHeaders?.map((header, index) => (
          <Group key={`header-${header?.key || `idx-${index}`}`} grow>
            <TextInput
              placeholder="Header Key"
              size="xs"
              {...form.getInputProps(
                `metadata.destination.customHeaders.${index}.key`,
              )}
              styles={{
                input: { fontFamily: 'var(--mantine-font-family-monospace)' },
              }}
            />
            <TextInput
              placeholder="Header Value"
              size="xs"
              {...form.getInputProps(
                `metadata.destination.customHeaders.${index}.value`,
              )}
              styles={{
                input: { fontFamily: 'var(--mantine-font-family-monospace)' },
              }}
              rightSection={
                (form.values.metadata?.destination?.customHeaders?.length ??
                  0) > 1 && (
                  <IconTrash
                    size={rem(14)}
                    style={{ cursor: 'pointer' }}
                    onClick={() => removeHeader(index)}
                  />
                )
              }
            />
          </Group>
        ))}
      </Stack>

      <NumberInput
        label="Timeout"
        description="Request timeout in seconds"
        min={1}
        max={300}
        {...form.getInputProps('metadata.destination.timeout')}
      />

      <MultiSelect
        label="CORS Origins"
        {...form.getInputProps('metadata.destination.corsOrigins')}
        data={[
          { value: '*', label: 'All Origins (*)' },
          { value: 'localhost', label: 'Localhost' },
          { value: 'custom', label: 'Custom Domain' },
        ]}
        placeholder="Select allowed origins"
      />

      <Group grow>
        <NumberInput
          label="Max Retries"
          description="Maximum retry attempts"
          min={0}
          max={5}
          {...form.getInputProps('metadata.destination.maxRetries')}
        />
        <NumberInput
          label="Retry Delay"
          description="Delay between retries (seconds)"
          min={1}
          max={30}
          {...form.getInputProps('metadata.destination.retryDelay')}
        />
      </Group>

      <Select
        label="Max Request Size"
        description="Maximum allowed request body size"
        {...form.getInputProps('metadata.destination.maxRequestSize')}
        data={[
          { value: '1mb', label: '1 MB' },
          { value: '5mb', label: '5 MB' },
          { value: '10mb', label: '10 MB' },
          { value: '50mb', label: '50 MB' },
          { value: 'unlimited', label: 'Unlimited' },
        ]}
      />
    </>
  );
};
