'use client';

import {
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Grid,
  Group,
  Paper,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconKey } from '@tabler/icons-react';
import React, { useState } from 'react';

import { listApiKeys } from '@repo/auth';
import {
  ApiKeyList,
  CreateApiKeyDialog,
  UpdateApiKeyDialog,
} from '@repo/design-system/components/auth';

interface ApiKey {
  createdAt: string;
  enabled: boolean;
  expiresAt?: string | null;
  id: string;
  metadata?: Record<string, unknown> | null;
  name: string;
  permissions?: Record<string, string[]> | null;
  prefix?: string;
  rateLimitEnabled?: boolean;
  rateLimitMax?: number | null;
  rateLimitTimeWindow?: number | null;
  refillAmount?: number | null;
  refillInterval?: number | null;
  remaining?: number | null;
  start?: string;
  updatedAt: string;
  userId: string;
}

export default function ApiKeysPage() {
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [allApiKeys, setAllApiKeys] = useState<ApiKey[]>([]);

  React.useEffect(() => {
    loadApiKeys();
  }, [refreshKey]);

  const loadApiKeys = async () => {
    try {
      const response = await listApiKeys();
      if (response.success && response.data) {
        setAllApiKeys(response.data as ApiKey[]);
      } else {
        throw new Error(response.error || 'Failed to load API keys');
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
      notifications.show({ color: 'red', message: 'Failed to load API keys', title: 'Error' });
    }
  };

  const handleKeySelect = (key: ApiKey) => {
    setSelectedKey(key);
  };

  const handleKeyCreate = () => {
    setRefreshKey((prev) => prev + 1);
    setSelectedKey(null);
  };

  const handleKeyUpdate = () => {
    setRefreshKey((prev) => prev + 1);
    if (selectedKey) {
      // Refresh the selected key data
      const updated = allApiKeys.find((k) => k.id === selectedKey.id);
      if (updated) {
        setSelectedKey(updated);
      }
    }
  };

  const getKeyStats = () => {
    const active = allApiKeys.filter((k) => k.enabled).length;
    const expired = allApiKeys.filter(
      (k) => k.expiresAt && new Date(k.expiresAt) < new Date(),
    ).length;
    const withRateLimit = allApiKeys.filter((k) => k.rateLimitEnabled).length;

    return { active, expired, total: allApiKeys.length, withRateLimit };
  };

  const stats = getKeyStats();

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>API Key Management</Title>
        <Text c="dimmed">Create and manage API keys for authentication</Text>
      </div>

      <Grid>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card>
            <Text fw={500} mb={4} size="sm">
              Total Keys
            </Text>
            <Text fw="bold" size="xl">
              {stats.total}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card>
            <Text fw={500} mb={4} size="sm">
              Active
            </Text>
            <Text c="green" fw="bold" size="xl">
              {stats.active}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card>
            <Text fw={500} mb={4} size="sm">
              Expired
            </Text>
            <Text c="red" fw="bold" size="xl">
              {stats.expired}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Card>
            <Text fw={500} mb={4} size="sm">
              Rate Limited
            </Text>
            <Text c="yellow" fw="bold" size="xl">
              {stats.withRateLimit}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Alert icon={<IconAlertCircle size={16} />} variant="light">
        API keys allow applications to authenticate with your system. Each key can have custom
        permissions, rate limits, and expiration settings.
      </Alert>

      <Tabs defaultValue="list">
        <Tabs.List>
          <Tabs.Tab value="list">API Keys</Tabs.Tab>
          {selectedKey && <Tabs.Tab value="details">Key Details</Tabs.Tab>}
        </Tabs.List>

        <Tabs.Panel pt="lg" value="list">
          <Card>
            <Group justify="space-between" mb="md">
              <div>
                <Title order={3}>All API Keys</Title>
                <Text c="dimmed" size="sm">
                  View and manage API keys for all users
                </Text>
              </div>
              <CreateApiKeyDialog allowServerOptions={true} onSuccess={handleKeyCreate} />
            </Group>
            <ApiKeyList
              key={refreshKey}
              allowFiltering={true}
              onKeySelect={handleKeySelect}
              onRefresh={handleKeyUpdate}
              showUserInfo={true}
            />
          </Card>
        </Tabs.Panel>

        {selectedKey && (
          <Tabs.Panel pt="lg" value="details">
            <Card>
              <Group justify="space-between" mb="lg">
                <Stack gap={4}>
                  <Group gap="xs">
                    <IconKey size={20} />
                    <Title order={3}>{selectedKey.name}</Title>
                  </Group>
                  <Code>{selectedKey.start}...</Code>
                </Stack>
                <Group gap="xs">
                  <Badge color={selectedKey.enabled ? 'blue' : 'gray'}>
                    {selectedKey.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                  {selectedKey.expiresAt && (
                    <Badge
                      color={new Date(selectedKey.expiresAt) < new Date() ? 'red' : 'gray'}
                      variant={new Date(selectedKey.expiresAt) < new Date() ? 'filled' : 'light'}
                    >
                      {new Date(selectedKey.expiresAt) < new Date() ? 'Expired' : 'Valid'}
                    </Badge>
                  )}
                </Group>
              </Group>

              <Stack gap="lg">
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="sm">
                      <Title order={4}>Key Information</Title>
                      <Stack gap={4}>
                        <Group justify="space-between">
                          <Text c="dimmed" size="sm">
                            Created
                          </Text>
                          <Text size="sm">{new Date(selectedKey.createdAt).toLocaleString()}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text c="dimmed" size="sm">
                            Last Updated
                          </Text>
                          <Text size="sm">{new Date(selectedKey.updatedAt).toLocaleString()}</Text>
                        </Group>
                        {selectedKey.expiresAt && (
                          <Group justify="space-between">
                            <Text c="dimmed" size="sm">
                              Expires
                            </Text>
                            <Text size="sm">
                              {new Date(selectedKey.expiresAt).toLocaleString()}
                            </Text>
                          </Group>
                        )}
                        {selectedKey.prefix && (
                          <Group justify="space-between">
                            <Text c="dimmed" size="sm">
                              Prefix
                            </Text>
                            <Code>{selectedKey.prefix}</Code>
                          </Group>
                        )}
                      </Stack>
                    </Stack>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="sm">
                      <Title order={4}>Usage & Limits</Title>
                      <Stack gap={4}>
                        {selectedKey.remaining !== null && selectedKey.remaining !== undefined && (
                          <Group justify="space-between">
                            <Text c="dimmed" size="sm">
                              Remaining Uses
                            </Text>
                            <Text size="sm">{selectedKey.remaining}</Text>
                          </Group>
                        )}
                        {selectedKey.refillInterval && selectedKey.refillAmount && (
                          <>
                            <Group justify="space-between">
                              <Text c="dimmed" size="sm">
                                Refill Amount
                              </Text>
                              <Text size="sm">{selectedKey.refillAmount}</Text>
                            </Group>
                            <Group justify="space-between">
                              <Text c="dimmed" size="sm">
                                Refill Interval
                              </Text>
                              <Text size="sm">{selectedKey.refillInterval}ms</Text>
                            </Group>
                          </>
                        )}
                      </Stack>
                    </Stack>
                  </Grid.Col>
                </Grid>

                {selectedKey.rateLimitEnabled && (
                  <Stack gap="sm">
                    <Title order={4}>Rate Limiting</Title>
                    <Stack gap={4}>
                      <Group justify="space-between">
                        <Text c="dimmed" size="sm">
                          Max Requests
                        </Text>
                        <Text size="sm">{selectedKey.rateLimitMax} per window</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text c="dimmed" size="sm">
                          Time Window
                        </Text>
                        <Text size="sm">{selectedKey.rateLimitTimeWindow}ms</Text>
                      </Group>
                    </Stack>
                  </Stack>
                )}

                {selectedKey.permissions && Object.keys(selectedKey.permissions).length > 0 && (
                  <Stack gap="sm">
                    <Title order={4}>Permissions</Title>
                    <Stack gap="xs">
                      {Object.entries(selectedKey.permissions).map(([resource, actions]) => (
                        <Group key={resource} justify="space-between">
                          <Text fw={500} size="sm" tt="capitalize">
                            {resource}
                          </Text>
                          <Group gap={4}>
                            {actions.map((action) => (
                              <Badge key={action} size="sm" variant="light">
                                {action}
                              </Badge>
                            ))}
                          </Group>
                        </Group>
                      ))}
                    </Stack>
                  </Stack>
                )}

                {selectedKey.metadata && Object.keys(selectedKey.metadata).length > 0 && (
                  <Stack gap="sm">
                    <Title order={4}>Metadata</Title>
                    <Paper withBorder p="sm">
                      <Code block>{JSON.stringify(selectedKey.metadata, null, 2)}</Code>
                    </Paper>
                  </Stack>
                )}

                <Group justify="flex-end">
                  <UpdateApiKeyDialog
                    allowServerOptions={true}
                    onSuccess={handleKeyUpdate}
                    apiKey={{
                      ...selectedKey,
                      permissions:
                        selectedKey.permissions === null ? undefined : selectedKey.permissions,
                      rateLimitMax:
                        selectedKey.rateLimitMax === null ? undefined : selectedKey.rateLimitMax,
                      rateLimitTimeWindow:
                        selectedKey.rateLimitTimeWindow === null
                          ? undefined
                          : selectedKey.rateLimitTimeWindow,
                      refillAmount:
                        selectedKey.refillAmount === null ? undefined : selectedKey.refillAmount,
                      refillInterval:
                        selectedKey.refillInterval === null
                          ? undefined
                          : selectedKey.refillInterval,
                      remaining: selectedKey.remaining === null ? undefined : selectedKey.remaining,
                    }}
                  />
                  <Button onClick={() => setSelectedKey(null)} size="sm" variant="default">
                    Close
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Tabs.Panel>
        )}
      </Tabs>
    </Stack>
  );
}
