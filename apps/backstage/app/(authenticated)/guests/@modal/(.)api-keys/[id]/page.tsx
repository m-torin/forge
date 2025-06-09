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
  Alert,
} from '@mantine/core';
import {
  IconKey,
  IconCalendar,
  IconEdit,
  IconActivity,
  IconShield,
  IconExclamationTriangle,
  IconCopy,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useClipboard } from '@mantine/hooks';
import { ModalWrapper } from '../../modal-wrapper';

interface ApiKey {
  id: string;
  name: string;
  start?: string;
  prefix?: string;
  enabled: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  requestCount?: number;
  permissions?: string[];
  userId?: string;
  organizationId?: string;
  user?: {
    name: string;
    email: string;
  };
  organization?: {
    name: string;
    slug: string;
  };
}

interface ApiKeyDetailModalProps {
  params: { id: string };
}

export default function ApiKeyDetailModal({ params }: ApiKeyDetailModalProps) {
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullKey, setShowFullKey] = useState(false);
  const clipboard = useClipboard({ timeout: 2000 });

  useEffect(() => {
    loadApiKey();
  }, [params.id]);

  const loadApiKey = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/api-keys/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey);
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to load API key details',
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

  if (loading || !apiKey) {
    return (
      <ModalWrapper title="API Key Details">
        <Text>Loading...</Text>
      </ModalWrapper>
    );
  }

  const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date();

  return (
    <ModalWrapper title="API Key Details" size="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="md">
            <ActionIcon size="lg" variant="light" color="blue">
              <IconKey size={24} />
            </ActionIcon>
            <div>
              <Text fw={600} size="lg">
                {apiKey.name}
              </Text>
              <Group gap="xs" mt={4}>
                <Badge
                  color={apiKey.enabled && !isExpired ? 'green' : 'red'}
                  variant="dot"
                >
                  {apiKey.enabled && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Disabled'}
                </Badge>
                {apiKey.start && (
                  <Code size="xs">
                    {apiKey.prefix || 'sk'}-...{apiKey.start}
                  </Code>
                )}
              </Group>
            </div>
          </Group>
          <Group gap="xs">
            <Tooltip label="Edit API Key">
              <ActionIcon variant="light" color="blue">
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {isExpired && (
          <Alert icon={<IconExclamationTriangle size={16} />} color="red" variant="light">
            This API key has expired and is no longer valid.
          </Alert>
        )}

        <Divider />

        <SimpleGrid cols={2} spacing="md">
          <Card padding="md" radius="md" withBorder>
            <Stack gap="xs">
              <Group gap="xs">
                <IconActivity size={16} />
                <Text fw={500} size="sm">Usage</Text>
              </Group>
              <Text fw={600} size="xl">
                {apiKey.requestCount?.toLocaleString() || 0}
              </Text>
              <Text c="dimmed" size="xs">Total requests</Text>
            </Stack>
          </Card>

          <Card padding="md" radius="md" withBorder>
            <Stack gap="xs">
              <Group gap="xs">
                <IconCalendar size={16} />
                <Text fw={500} size="sm">Last Used</Text>
              </Group>
              <Text size="sm">
                {apiKey.lastUsedAt 
                  ? new Date(apiKey.lastUsedAt).toLocaleDateString()
                  : 'Never'
                }
              </Text>
            </Stack>
          </Card>

          <Card padding="md" radius="md" withBorder>
            <Stack gap="xs">
              <Group gap="xs">
                <IconCalendar size={16} />
                <Text fw={500} size="sm">Created</Text>
              </Group>
              <Text size="sm">
                {new Date(apiKey.createdAt).toLocaleDateString()}
              </Text>
            </Stack>
          </Card>

          <Card padding="md" radius="md" withBorder>
            <Stack gap="xs">
              <Group gap="xs">
                <IconCalendar size={16} />
                <Text fw={500} size="sm">Expires</Text>
              </Group>
              <Text size="sm" c={isExpired ? 'red' : undefined}>
                {apiKey.expiresAt 
                  ? new Date(apiKey.expiresAt).toLocaleDateString()
                  : 'Never'
                }
              </Text>
            </Stack>
          </Card>
        </SimpleGrid>

        {(apiKey.user || apiKey.organization) && (
          <>
            <Divider />
            <div>
              <Text fw={500} mb="xs">Ownership</Text>
              <Stack gap="xs">
                {apiKey.user && (
                  <Card padding="sm" radius="md" withBorder>
                    <Group justify="space-between">
                      <div>
                        <Text fw={500} size="sm">User</Text>
                        <Text c="dimmed" size="xs">{apiKey.user.name} ({apiKey.user.email})</Text>
                      </div>
                    </Group>
                  </Card>
                )}
                {apiKey.organization && (
                  <Card padding="sm" radius="md" withBorder>
                    <Group justify="space-between">
                      <div>
                        <Text fw={500} size="sm">Organization</Text>
                        <Text c="dimmed" size="xs">{apiKey.organization.name} (@{apiKey.organization.slug})</Text>
                      </div>
                    </Group>
                  </Card>
                )}
              </Stack>
            </div>
          </>
        )}

        {apiKey.permissions && apiKey.permissions.length > 0 && (
          <>
            <Divider />
            <div>
              <Text fw={500} mb="xs">Permissions</Text>
              <Group gap="xs">
                {apiKey.permissions.map((permission, index) => (
                  <Badge key={index} variant="light" color="blue">
                    {permission}
                  </Badge>
                ))}
              </Group>
            </div>
          </>
        )}
      </Stack>
    </ModalWrapper>
  );
}