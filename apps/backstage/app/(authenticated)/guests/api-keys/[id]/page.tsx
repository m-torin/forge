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
  Container,
  Button,
} from '@mantine/core';
import {
  IconKey,
  IconCalendar,
  IconEdit,
  IconActivity,
  IconShield,
  IconAlertTriangle,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconArrowLeft,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useClipboard } from '@mantine/hooks';
import { useRouter } from 'next/navigation';

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

interface ApiKeyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ApiKeyDetailPage({ params }: ApiKeyDetailPageProps) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullKey, setShowFullKey] = useState(false);
  const clipboard = useClipboard({ timeout: 2000 });
  const [paramsData, setParamsData] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(p => setParamsData(p));
  }, [params]);

  useEffect(() => {
    if (paramsData?.id) {
      loadApiKey();
    }
  }, [paramsData?.id]);

  const loadApiKey = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/api-keys/${paramsData?.id}`);
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
      <Container size="lg" py="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
            Back to API Keys
          </Button>
        </Group>

        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="md">
                <ActionIcon size="xl" variant="light" color="blue">
                  <IconKey size={32} />
                </ActionIcon>
                <div>
                  <Text fw={600} size="xl">
                    {apiKey.name}
                  </Text>
                  <Group gap="xs" mt={4}>
                    <Badge
                      color={apiKey.enabled && !isExpired ? 'green' : 'red'}
                      variant="dot"
                      size="lg"
                    >
                      {apiKey.enabled && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Disabled'}
                    </Badge>
                    {apiKey.start && (
                      <Code>
                        {apiKey.prefix || 'sk'}-...{apiKey.start}
                      </Code>
                    )}
                  </Group>
                </div>
              </Group>
              <Group gap="xs">
                <Tooltip label="Edit API Key">
                  <ActionIcon variant="light" color="blue" size="lg">
                    <IconEdit size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>

            {isExpired && (
              <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
                This API key has expired and is no longer valid.
              </Alert>
            )}

            <Divider />

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
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
                  <Text fw={500} mb="md" size="lg">Ownership</Text>
                  <Stack gap="md">
                    {apiKey.user && (
                      <Card padding="md" radius="md" withBorder>
                        <Group justify="space-between">
                          <div>
                            <Text fw={500}>User</Text>
                            <Text c="dimmed" size="sm">{apiKey.user.name} ({apiKey.user.email})</Text>
                          </div>
                        </Group>
                      </Card>
                    )}
                    {apiKey.organization && (
                      <Card padding="md" radius="md" withBorder>
                        <Group justify="space-between">
                          <div>
                            <Text fw={500}>Organization</Text>
                            <Text c="dimmed" size="sm">{apiKey.organization.name} (@{apiKey.organization.slug})</Text>
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
                  <Text fw={500} mb="md" size="lg">Permissions</Text>
                  <Group gap="xs">
                    {apiKey.permissions.map((permission, index) => (
                      <Badge key={index} variant="light" color="blue" size="lg">
                        {permission}
                      </Badge>
                    ))}
                  </Group>
                </div>
              </>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}