import { FC } from 'react';
import {
  Group,
  Select,
  SegmentedControl,
  Text,
  Stack,
  MultiSelect,
  TextInput,
  Checkbox,
  Code,
  rem,
  Tabs,
} from '@mantine/core';
import { useCombinedContext } from '#/flows/nodes/internal';
import { FormValues } from '../../formSchema';

export const SharedConfig: FC = () => {
  const { form } = useCombinedContext<FormValues>();

  const hasCustomContentType =
    form.values.metadata?.shared?.method !== 'GET' &&
    form.values.metadata?.shared?.enableCustomContentType;

  return (
    <Tabs defaultValue="request" color="green" orientation="vertical" my="xs">
        <Tabs.List>
          <Tabs.Tab py="sm" value="request">
            Request
          </Tabs.Tab>
          <Tabs.Tab py="sm" value="response">
            Response
          </Tabs.Tab>
          <Tabs.Tab py="sm" value="error">
            Errors
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="request" pl={rem(15)}>
          <Stack justify="flex-start" gap="lg">
            {/* HTTP Method Selection */}
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                HTTP Method
              </Text>
              <SegmentedControl
                size="sm"
                radius="md"
                {...form.getInputProps('metadata.shared.method')}
                data={[
                  'POST',
                  'GET',
                  'PUT',
                  'DELETE',
                  'PATCH',
                  'HEAD',
                  'OPTIONS',
                ]}
              />
            </Stack>

            {/* Request ID Configuration */}
            <Group grow>
              <Checkbox
                label="Generate Request ID"
                description="Add unique identifier to each request"
                {...form.getInputProps('metadata.shared.generateRequestId', {
                  type: 'checkbox',
                })}
              />
              <Select
                label="Request ID Header"
                disabled={!form.values.metadata?.shared?.generateRequestId}
                {...form.getInputProps('metadata.shared.requestIdHeader')}
                data={[
                  { value: 'x-request-id', label: 'X-Request-ID' },
                  { value: 'x-correlation-id', label: 'X-Correlation-ID' },
                  { value: 'request-id', label: 'Request-ID' },
                ]}
              />
            </Group>

            {/* Content Type Configuration */}
            <Group grow>
              <Checkbox
                label="Enable Custom Content-Type"
                disabled={form.values.metadata?.shared?.method === 'GET'}
                {...form.getInputProps(
                  'metadata.shared.enableCustomContentType',
                  {
                    type: 'checkbox',
                  },
                )}
              />
            </Group>

            {hasCustomContentType && (
              <Select
                label="Content-Type"
                description="Request content type header"
                {...form.getInputProps('metadata.shared.contentType')}
                data={[
                  { value: 'application/json', label: 'application/json' },
                  {
                    value: 'application/x-www-form-urlencoded',
                    label: 'application/x-www-form-urlencoded',
                  },
                  {
                    value: 'multipart/form-data',
                    label: 'multipart/form-data',
                  },
                  { value: 'text/plain', label: 'text/plain' },
                  { value: 'custom', label: 'Custom Content-Type' },
                ]}
              />
            )}

            {hasCustomContentType &&
              form.values.metadata?.shared?.contentType === 'custom' && (
                <TextInput
                  label="Custom Content-Type"
                  placeholder="application/custom+json"
                  {...form.getInputProps('metadata.shared.customContentType')}
                />
              )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="response" pl={rem(15)}>
          <Stack justify="flex-start" gap="lg">
            {/* Response Format Configuration */}
            <Select
              label="Response Format"
              description="Default response content type"
              {...form.getInputProps('metadata.shared.responseFormat')}
              data={[
                { value: 'json', label: 'JSON (application/json)' },
                { value: 'xml', label: 'XML (application/xml)' },
                { value: 'text', label: 'Plain Text (text/plain)' },
                { value: 'html', label: 'HTML (text/html)' },
                { value: 'binary', label: 'Binary (application/octet-stream)' },
              ]}
            />
            {/* Common Headers */}
            <MultiSelect
              label="Common Response Headers"
              description="Headers included in all responses"
              {...form.getInputProps('metadata.shared.commonHeaders')}
              data={[
                { value: 'x-request-id', label: 'X-Request-ID' },
                { value: 'x-response-time', label: 'X-Response-Time' },
                { value: 'x-api-version', label: 'X-API-Version' },
                { value: 'x-correlation-id', label: 'X-Correlation-ID' },
                { value: 'cache-control', label: 'Cache-Control' },
              ]}
            />
            {/* Response Compression */}
            <Select
              label="Response Compression"
              description="Enable compression for responses"
              {...form.getInputProps('metadata.shared.compression')}
              data={[
                { value: 'none', label: 'No Compression' },
                { value: 'gzip', label: 'gzip' },
                { value: 'deflate', label: 'deflate' },
                { value: 'br', label: 'Brotli' },
              ]}
            />{' '}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="error" pl={rem(15)}>
          <Stack justify="flex-start" gap="lg">
            {/* Error Handling */}
            <Stack gap="xs" pl={rem(15)}>
              <Text size="sm" fw={500}>
                Error Response Format
              </Text>
              <Code block>
                {`{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  }
}`}
              </Code>
              <MultiSelect
                label="Include in Error Response"
                {...form.getInputProps('metadata.shared.errorResponseFields')}
                data={[
                  { value: 'timestamp', label: 'Timestamp' },
                  { value: 'path', label: 'Request Path' },
                  { value: 'method', label: 'HTTP Method' },
                  { value: 'requestId', label: 'Request ID' },
                  { value: 'stack', label: 'Stack Trace (Development)' },
                ]}
              />
            </Stack>{' '}
          </Stack>
        </Tabs.Panel>
      </Tabs>
  );
};
