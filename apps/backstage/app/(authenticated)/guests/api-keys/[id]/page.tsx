'use client';

import {
  Badge,
  Group,
  Stack,
  Text,
  Card,
  SimpleGrid,
  Divider,
  ActionIcon,
  Tooltip,
  Code,
  Container,
  Button,
} from '@mantine/core';
import {
  IconKey,
  IconCalendar,
  IconEdit,
  IconActivity,
  IconShield,
  IconCopy,
  IconArrowLeft,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useClipboard } from '@mantine/hooks';
import { useRouter } from 'next/navigation';

import { getApiKey } from '@repo/auth/server/next';
import { ApiKeyForm } from '../../components/forms/ApiKeyForm';
import { PageHeader } from '../../../components/page-header';
import type { ApiKey } from '../../types';

interface ApiKeyPageProps {
  params: Promise<{ id: string }>;
}

export default function ApiKeyPage({ params }: ApiKeyPageProps) {
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [paramsData, setParamsData] = useState<{ id: string } | null>(null);
  const clipboard = useClipboard({ timeout: 2000 });
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setParamsData(p));
  }, [params]);

  useEffect(() => {
    if (paramsData?.id) {
      if (paramsData.id === 'new') {
        setLoading(false);
      } else {
        loadApiKey();
      }
    }
  }, [paramsData?.id]);

  const loadApiKey = async () => {
    if (!paramsData?.id || paramsData.id === 'new') return;

    setLoading(true);
    try {
      const result = await getApiKey(paramsData.id);
      if (result.success && result.data) {
        setApiKey(result.data as ApiKey);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load API key details',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load API key details',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle "new" case - show create form
  if (paramsData?.id === 'new') {
    return (
      <Container py="xl" size="xl">
        <Stack gap="xl">
          <PageHeader
            title="Create New API Key"
            description="Generate a new API key for programmatic access"
            breadcrumbs={[
              { label: 'Guests', href: '/guests' },
              { label: 'API Keys', href: '/guests/api-keys' },
              { label: 'New' },
            ]}
          />
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <ApiKeyForm />
          </Card>
        </Stack>
      </Container>
    );
  }

  // Handle edit mode
  if (isEdit && apiKey) {
    return (
      <Container py="xl" size="xl">
        <Stack gap="xl">
          <PageHeader
            title="Edit API Key"
            description="Update API key settings and permissions"
            breadcrumbs={[
              { label: 'Guests', href: '/guests' },
              { label: 'API Keys', href: '/guests/api-keys' },
              { label: apiKey.name },
            ]}
          />
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <ApiKeyForm
              apiKey={apiKey}
              onSuccess={() => {
                setIsEdit(false);
                loadApiKey();
              }}
              onCancel={() => setIsEdit(false)}
            />
          </Card>
        </Stack>
      </Container>
    );
  }

  if (loading || !apiKey) {
    return (
      <Container py="xl" size="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  const copyApiKeyPrefix = () => {
    clipboard.copy(apiKey.prefix || apiKey.start || 'N/A');
    notifications.show({
      title: 'Copied',
      message: 'API key prefix copied to clipboard',
      color: 'green',
    });
  };

  // Handle view mode
  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <PageHeader
          title="API Key Details"
          description="View and manage API key settings"
          actions={{
            primary: {
              icon: <IconEdit size={16} />,
              label: 'Edit',
              onClick: () => setIsEdit(true),
            },
          }}
          breadcrumbs={[
            { label: 'Guests', href: '/guests' },
            { label: 'API Keys', href: '/guests/api-keys' },
            { label: apiKey.name },
          ]}
        />

        <SimpleGrid cols={{ base: 1, lg: 3, sm: 2 }} spacing="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Group gap="xs">
                <IconKey size={16} />
                <Text fw={500} size="sm">
                  Key Information
                </Text>
              </Group>
              <div>
                <Text size="sm" c="dimmed">
                  Name
                </Text>
                <Text fw={500}>{apiKey.name}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Key Prefix
                </Text>
                <Group gap="xs">
                  <Code>{apiKey.prefix || apiKey.start || 'N/A'}</Code>
                  <Tooltip label={clipboard.copied ? 'Copied!' : 'Copy prefix'}>
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color={clipboard.copied ? 'green' : 'blue'}
                      onClick={copyApiKeyPrefix}
                    >
                      <IconCopy size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Status
                </Text>
                <Badge color={apiKey.enabled ? 'green' : 'red'} variant="dot">
                  {apiKey.enabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>
            </Stack>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Group gap="xs">
                <IconActivity size={16} />
                <Text fw={500} size="sm">
                  Usage Statistics
                </Text>
              </Group>
              <div>
                <Text size="sm" c="dimmed">
                  Request Count
                </Text>
                <Text fw={500}>{(apiKey.requestCount || 0).toLocaleString()}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Last Used
                </Text>
                <Text fw={500}>
                  {apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt).toLocaleDateString() : 'Never'}
                </Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Created
                </Text>
                <Text fw={500}>{new Date(apiKey.createdAt).toLocaleDateString()}</Text>
              </div>
            </Stack>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Group gap="xs">
                <IconShield size={16} />
                <Text fw={500} size="sm">
                  Permissions & Scope
                </Text>
              </Group>
              {apiKey.permissions && apiKey.permissions.length > 0 ? (
                <Group gap="xs">
                  {apiKey.permissions.map((perm) => (
                    <Badge key={perm} variant="light" size="sm">
                      {perm}
                    </Badge>
                  ))}
                </Group>
              ) : (
                <Text size="sm" c="dimmed">
                  Default permissions
                </Text>
              )}
              {apiKey.organizationId && apiKey.organization && (
                <div>
                  <Text size="sm" c="dimmed">
                    Organization
                  </Text>
                  <Text fw={500}>{apiKey.organization.name}</Text>
                </div>
              )}
              {apiKey.expiresAt && (
                <div>
                  <Text size="sm" c="dimmed">
                    Expires
                  </Text>
                  <Badge
                    color={new Date(apiKey.expiresAt) < new Date() ? 'red' : 'orange'}
                    variant="light"
                  >
                    {new Date(apiKey.expiresAt).toLocaleDateString()}
                  </Badge>
                </div>
              )}
            </Stack>
          </Card>
        </SimpleGrid>

        {apiKey.metadata && Object.keys(apiKey.metadata).length > 0 && (
          <>
            <Divider />
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={500}>Metadata</Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  {Object.entries(apiKey.metadata).map(([key, value]) => (
                    <div key={key}>
                      <Text size="sm" c="dimmed">
                        {key}
                      </Text>
                      <Text fw={500}>{String(value)}</Text>
                    </div>
                  ))}
                </SimpleGrid>
              </Stack>
            </Card>
          </>
        )}

        <Group>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.push('/guests/api-keys')}
          >
            Back to API Keys
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
