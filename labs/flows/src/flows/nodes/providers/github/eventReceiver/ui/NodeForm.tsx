import React, { FC, memo } from 'react';
import {
  Anchor,
  Badge,
  Group,
  MultiSelect,
  PasswordInput,
  Stack,
  TextInput,
  Text,
  List,
  Alert,
  Code,
} from '@mantine/core';
import { useCombinedContext } from '#/flows/nodes/internal';
import { FormValues } from '../formSchema';
import { ButtonCopy } from '#/src/ui/shared';
import { githubEvents } from './githubEvents';
import { IconAlertCircle } from '@tabler/icons-react';

export const buildWebhookUrl = ({
  nodeId,
  includeOrigin = false,
}: {
  nodeId?: string;
  includeOrigin?: boolean;
}) => {
  if (!nodeId) return '';
  const path = `/api/webhook/${nodeId}`;
  if (!includeOrigin) return path;

  return typeof window !== 'undefined'
    ? `${window.location.origin}${path}`
    : path;
};

export const getGitHubWebhookSettingsUrl = (repoUrl?: string) => {
  if (!repoUrl?.trim()) return '';
  try {
    // Handle both full URLs and shorthand format
    const urlPattern = /github\.com\/([^/]+)\/([^/]+)/;
    const match = repoUrl.match(urlPattern);
    if (!match) return '';

    const [, username, repo] = match;
    // Remove query strings, .git suffix, and trailing slashes
    const cleanRepo = repo
      .split('?')[0]
      .replace(/\.git\/?$/, '')
      .replace(/\/$/, '');
    return `https://github.com/${username}/${cleanRepo}/settings/hooks`;
  } catch {
    return '';
  }
};

export const NodeForm: FC = memo(() => {
  const context = useCombinedContext<FormValues>();

  if (!context) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        color="yellow"
        title="Configuration Error"
        variant="filled"
      >
        Unable to load webhook configuration. Please try refreshing the page.
      </Alert>
    );
  }

  const { form, node } = context;

  if (!node?.nodeProps?.id) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        color="red"
        title="Missing Node ID"
        variant="filled"
      >
        Node ID is required to generate webhook URL. Check node configuration.
      </Alert>
    );
  }

  const nodeId = node.nodeProps.id;
  const webhookUrl = buildWebhookUrl({ nodeId, includeOrigin: true });
  const repoUrl = form.getValues()?.metadata?.repositoryUrl;
  const settingsUrl = getGitHubWebhookSettingsUrl(repoUrl);

  return (
    <Stack gap="md">
      <TextInput
        label="Repository URL"
        description="The full URL of your GitHub repository"
        placeholder="https://github.com/user/repo"
        required
        {...form.getInputProps('metadata.repositoryUrl')}
        key={form.key('metadata.repositoryUrl')}
      />

      <PasswordInput
        label="Webhook Secret"
        description="A secure secret key to validate webhook payloads"
        placeholder="Enter a secure secret (min. 8 characters)"
        required
        {...form.getInputProps('metadata.secret')}
        key={form.key('metadata.secret')}
      />

      <MultiSelect
        label="Events to Monitor"
        description="Select which GitHub events should trigger this webhook"
        placeholder="Choose one or more events"
        searchable
        clearable
        maxDropdownHeight={400}
        required
        data={githubEvents}
        {...form.getInputProps('metadata.events')}
        key={form.key('metadata.events')}
      />

      <Stack gap="xs">
        <Text size="sm" fw={500}>
          Webhook URL
        </Text>
        <Group gap="xs">
          <Badge radius="sm" size="lg" variant="light" c="gray.6">
            {webhookUrl || 'Loading...'}
          </Badge>
          <ButtonCopy copyThis={webhookUrl} size="sm" disabled={!webhookUrl}>
            Copy
          </ButtonCopy>
        </Group>
        <Code block>{webhookUrl || 'Generating webhook URL...'}</Code>
      </Stack>

      <Stack gap="xs">
        <Text size="sm" fw={500}>
          Configuration Steps:
        </Text>
        <List size="sm" withPadding>
          <List.Item>Copy the webhook URL above</List.Item>
          <List.Item>
            Navigate to your repository&apos;s webhook settings
            {settingsUrl && (
              <Anchor
                href={settingsUrl}
                target="_blank"
                rel="noopener noreferrer"
                ml="xs"
                size="sm"
              >
                Open Settings →
              </Anchor>
            )}
          </List.Item>
          <List.Item>
            Configure the webhook with these settings:
            <List withPadding size="sm">
              <List.Item>Paste the webhook URL into &quot;Payload URL&quot;</List.Item>
              <List.Item>Set Content type to &quot;application/json&quot;</List.Item>
              <List.Item>Copy the secret from above into &quot;Secret&quot;</List.Item>
              <List.Item>Select the events you want to monitor</List.Item>
            </List>
          </List.Item>
        </List>
      </Stack>

      {settingsUrl && (
        <Alert color="blue" variant="light">
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Ready to configure?
            </Text>
            <Anchor
              href={settingsUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
            >
              Open GitHub webhook settings →
            </Anchor>
          </Stack>
        </Alert>
      )}
    </Stack>
  );
});

NodeForm.displayName = 'GithubWebhookForm';
