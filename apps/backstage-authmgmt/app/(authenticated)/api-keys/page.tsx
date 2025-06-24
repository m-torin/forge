'use client';

import {
  Badge,
  Button,
  Container,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Alert,
  Code,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconKey,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconCalendar,
  IconActivity,
  IconShield,
  IconAlertTriangle,
  IconRefresh,
} from '@tabler/icons-react';
import { useDisclosure, useClipboard } from '@mantine/hooks';
import { useEffect, useState, useMemo } from 'react';
import { notifications } from '@mantine/notifications';

import {
  listApiKeysAction as getApiKeysAction,
  createApiKeyAction,
  deleteApiKeyAction,
  listOrganizationsAction as getOrganizationsAction,
} from '@repo/auth/actions';

import { DataTable } from '@/components/auth/DataTable';
import { PageHeader } from '@/components/auth/PageHeader';
import { StatsCard } from '@/components/auth/StatsCard';

import type { ApiKey, Organization } from '@/types/auth';

// Constants
const AVAILABLE_PERMISSIONS = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'admin', label: 'Admin' },
  { value: 'delete', label: 'Delete' },
  { value: 'manage_users', label: 'Manage Users' },
  { value: 'manage_organizations', label: 'Manage Organizations' },
  { value: 'manage_api_keys', label: 'Manage API Keys' },
];

const KEY_TYPES = [
  { value: 'user', label: 'User Key' },
  { value: 'service', label: 'Service Key' },
];

// Utility
const isKeyExpired = (expiresAt?: string | Date) => {
  if (!expiresAt) return false;
  const expiryDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return expiryDate < new Date();
};

// Custom hook for API keys data
const useApiKeysData = () => {
  const [state, setState] = useState({
    apiKeys: [] as ApiKey[],
    organizations: [] as Organization[],
    loading: true,
  });

  const loadData = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const [keysResult, orgsResult] = await Promise.all([
        getApiKeysAction(),
        getOrganizationsAction(),
      ]);

      const apiKeys = keysResult.success && keysResult.data ? keysResult.data : [];
      const organizations = orgsResult?.success && orgsResult.data ? orgsResult.data : [];

      setState({ apiKeys, organizations, loading: false });

      // Show detailed errors for failed requests
      if (!keysResult.success) {
        const errorDetails = keysResult.error
          ? typeof keysResult.error === 'string'
            ? keysResult.error
            : JSON.stringify(keysResult.error, null, 2)
          : 'Unknown error occurred';

        console.error('Failed to load API keys:', keysResult);

        notifications.show({
          title: 'Failed to load API keys',
          message: `Error: ${errorDetails}`,
          color: 'red',
          autoClose: false,
        });
      }

      if (!orgsResult?.success) {
        const errorDetails = orgsResult?.error
          ? typeof orgsResult.error === 'string'
            ? orgsResult.error
            : JSON.stringify(orgsResult.error, null, 2)
          : 'Unknown error occurred';

        console.error('Failed to load organizations:', orgsResult);

        notifications.show({
          title: 'Failed to load organizations',
          message: `Error: ${errorDetails}`,
          color: 'red',
          autoClose: false,
        });
      }
    } catch (error) {
      console.error('Data loading exception:', error);

      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : `Unexpected error: ${JSON.stringify(error)}`;

      notifications.show({
        title: 'Data Loading Failed',
        message: errorMessage,
        color: 'red',
        autoClose: false,
      });
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { ...state, refetch: loadData };
};

export default function ApiKeysPage() {
  const { apiKeys, organizations, loading, refetch } = useApiKeysData();
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [keyModalOpened, { open: openKeyModal, close: closeKeyModal }] = useDisclosure(false);
  const [createdKey, setCreatedKey] = useState<string>('');
  const [showKey, setShowKey] = useState(false);
  const clipboard = useClipboard({ timeout: 2000 });
  const [newKey, setNewKey] = useState({
    name: '',
    organizationId: '',
    permissions: [] as string[],
    expiresAt: '',
    metadata: { type: 'user', description: '' },
  });

  const statsData = useMemo(() => {
    const active = apiKeys.filter((k) => k.enabled && !isKeyExpired(k.expiresAt));
    const expired = apiKeys.filter((k) => isKeyExpired(k.expiresAt));
    const totalRequests = apiKeys.reduce((acc, key) => acc + (key.requestCount || 0), 0);

    return [
      {
        title: 'Total API Keys',
        value: apiKeys.length.toString(),
        color: 'blue',
        icon: IconKey,
        change: { value: 5 },
      },
      {
        title: 'Active Keys',
        value: active.length.toString(),
        color: 'green',
        icon: IconShield,
        progress: {
          label: 'of total keys',
          value: apiKeys.length
            ? Math.round((apiKeys.filter((k) => k.enabled).length / apiKeys.length) * 100)
            : 0,
        },
      },
      { title: 'Expired Keys', value: expired.length.toString(), color: 'red', icon: IconCalendar },
      {
        title: 'Total Requests',
        value: totalRequests.toLocaleString(),
        color: 'violet',
        icon: IconActivity,
      },
    ];
  }, [apiKeys]);

  const handleCreateApiKey = async () => {
    try {
      const result = await createApiKeyAction({
        name: newKey.name,
        expiresAt: newKey.expiresAt ? new Date(newKey.expiresAt) : undefined,
        scopes: newKey.permissions.length > 0 ? newKey.permissions : ['read'],
      });

      if (result.success && result.data) {
        setCreatedKey(result.data.key || result.data.apiKey || '');
        closeCreateModal();
        openKeyModal();
        setNewKey({
          name: '',
          organizationId: '',
          permissions: [],
          expiresAt: '',
          metadata: { type: 'user', description: '' },
        });
        await refetch();
      } else {
        const errorDetails = result.error
          ? typeof result.error === 'string'
            ? result.error
            : JSON.stringify(result.error, null, 2)
          : 'Unknown error occurred';

        console.error('API Key creation failed:', {
          input: {
            name: newKey.name,
            permissions: newKey.permissions,
            expiresAt: newKey.expiresAt,
          },
          result,
          error: result.error,
        });

        notifications.show({
          title: 'Failed to create API key',
          message: `Error: ${errorDetails}`,
          color: 'red',
          autoClose: false, // Don't auto-close for backend errors
        });
      }
    } catch (error) {
      console.error('API Key creation exception:', error);

      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : `Unexpected error: ${JSON.stringify(error)}`;

      notifications.show({
        title: 'API Key Creation Failed',
        message: errorMessage,
        color: 'red',
        autoClose: false,
      });
    }
  };

  const handleToggleKey = async (keyId: string, enabled: boolean) => {
    try {
      // Note: Better Auth's updateApiKeyAction doesn't support toggling enabled state directly
      // This would need to be implemented in the auth package
      notifications.show({
        title: 'Info',
        message: 'API key enable/disable functionality needs to be implemented in the auth package',
        color: 'blue',
      });
      return;
    } catch (error) {
      const action = enabled ? 'enable' : 'disable';
      console.error(`Failed to ${action} API key:`, error);
      notifications.show({ title: 'Error', message: `Failed to ${action} API key`, color: 'red' });
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      const result = await deleteApiKeyAction(keyId);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'API key deleted successfully',
          color: 'green',
        });
        await refetch();
      } else {
        const errorDetails = result.error
          ? typeof result.error === 'string'
            ? result.error
            : JSON.stringify(result.error, null, 2)
          : 'Unknown error occurred';

        console.error('API Key deletion failed:', {
          keyId,
          result,
          error: result.error,
        });

        notifications.show({
          title: 'Failed to delete API key',
          message: `Error: ${errorDetails}`,
          color: 'red',
          autoClose: false,
        });
      }
    } catch (error) {
      console.error('API Key deletion exception:', error);

      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : `Unexpected error: ${JSON.stringify(error)}`;

      notifications.show({
        title: 'API Key Deletion Failed',
        message: errorMessage,
        color: 'red',
        autoClose: false,
      });
    }
  };

  const copyApiKey = () => {
    clipboard.copy(createdKey);
    notifications.show({ title: 'Copied', message: 'API key copied to clipboard', color: 'green' });
  };

  const columns = [
    {
      key: 'name',
      label: 'API Key',
      render: (value: string, row: ApiKey) => (
        <Group gap="sm">
          <div>
            <Text fw={500} size="sm">
              {value}
            </Text>
            <Group gap="xs">
              <Code>
                {row.prefix || 'forge'}_****{row.start || '****'}
              </Code>
              {row.metadata?.type && (
                <Badge size="xs" color={row.metadata.type === 'service' ? 'orange' : 'blue'}>
                  {row.metadata.type}
                </Badge>
              )}
            </Group>
          </div>
        </Group>
      ),
      sortable: true,
    },
    {
      key: 'enabled',
      label: 'Status',
      render: (value: boolean, row: ApiKey) => {
        const expired = isKeyExpired(row.expiresAt);
        return (
          <Badge color={expired ? 'red' : value ? 'green' : 'gray'} variant="dot">
            {expired ? 'Expired' : value ? 'Active' : 'Disabled'}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (value: string[]) => (
        <Group gap="xs">
          {(value || ['read']).slice(0, 3).map((permission) => (
            <Badge key={permission} size="xs" variant="light">
              {permission}
            </Badge>
          ))}
          {(value || []).length > 3 && (
            <Text size="xs" c="dimmed">
              +{(value || []).length - 3} more
            </Text>
          )}
        </Group>
      ),
    },
    {
      key: 'requestCount',
      label: 'Requests',
      render: (value: number) => <Text size="sm">{value.toLocaleString()}</Text>,
      sortable: true,
    },
    {
      key: 'lastUsedAt',
      label: 'Last Used',
      render: (value: string | Date | undefined) => {
        if (!value)
          return (
            <Text c="dimmed" size="sm">
              Never
            </Text>
          );
        const date = value instanceof Date ? value : new Date(value);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return <Text size="sm">Today</Text>;
        if (days === 1) return <Text size="sm">Yesterday</Text>;
        return <Text size="sm">{days}d ago</Text>;
      },
      sortable: true,
    },
    {
      key: 'expiresAt',
      label: 'Expires',
      render: (value: string | Date | undefined) => {
        if (!value)
          return (
            <Text c="dimmed" size="sm">
              Never
            </Text>
          );
        const date = value instanceof Date ? value : new Date(value);
        const expired = date < new Date();
        return (
          <Text size="sm" c={expired ? 'red' : undefined}>
            {date.toLocaleDateString()}
          </Text>
        );
      },
      sortable: true,
    },
  ];

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <PageHeader
          actions={{
            primary: {
              icon: <IconPlus size={16} />,
              label: 'Create API Key',
              onClick: openCreateModal,
            },
            secondary: [
              {
                label: 'Export Keys',
                onClick: () => console.log('Export API keys'),
              },
            ],
          }}
          description="Manage API keys for service authentication and access control"
          onRefresh={refetch}
          title="API Key Management"
        />

        <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="lg">
          {statsData.map((stat) => (
            <StatsCard key={stat.title} {...stat} loading={loading} />
          ))}
        </SimpleGrid>

        <DataTable
          actions={{
            custom: [
              {
                icon: <IconEyeOff size={14} />,
                label: 'Toggle Status',
                onClick: (row) => handleToggleKey(row.id, !row.enabled),
                color: 'orange',
              },
              {
                icon: <IconRefresh size={14} />,
                label: 'Regenerate',
                onClick: (row) => console.log('Regenerate key', row),
              },
              {
                icon: <IconActivity size={14} />,
                label: 'View Usage',
                onClick: (row) => console.log('View usage', row),
              },
            ],
            onDelete: (row) => handleDeleteApiKey(row.id),
            onEdit: (row) => console.log('Edit API key', row),
            onView: (row) => console.log('View API key', row),
          }}
          bulkActions={[
            {
              color: 'red',
              label: 'Disable Selected',
              onClick: (rows) => console.log('Disable keys', rows),
            },
            {
              color: 'red',
              label: 'Delete Selected',
              onClick: (rows) => console.log('Delete keys', rows),
            },
          ]}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 25,
            total: apiKeys.length,
          }}
          searchPlaceholder="Search API keys..."
          data={apiKeys}
          emptyState={{
            description: 'Create your first API key to get started',
            icon: IconKey,
            title: 'No API keys found',
          }}
          selectable
        />
      </Stack>

      {/* Create API Key Modal */}
      <Modal
        opened={createModalOpened}
        onClose={closeCreateModal}
        title="Create New API Key"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Key Name"
            placeholder="Enter a descriptive name for this API key"
            value={newKey.name}
            onChange={(e) => setNewKey((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          <Select
            label="Organization (Optional)"
            placeholder="Select organization to scope this key"
            value={newKey.organizationId}
            onChange={(value) => setNewKey((prev) => ({ ...prev, organizationId: value || '' }))}
            data={organizations.map((org) => ({ value: org.id, label: org.name }))}
            clearable
          />

          <MultiSelect
            label="Permissions"
            placeholder="Select permissions for this API key"
            value={newKey.permissions}
            onChange={(value) => setNewKey((prev) => ({ ...prev, permissions: value }))}
            data={AVAILABLE_PERMISSIONS}
            description="Leave empty to use default read permissions"
          />

          <TextInput
            label="Expiration Date (Optional)"
            placeholder="YYYY-MM-DD"
            type="date"
            value={newKey.expiresAt}
            onChange={(e) => setNewKey((prev) => ({ ...prev, expiresAt: e.target.value }))}
            description="Leave empty for a key that never expires"
          />

          <Select
            label="Key Type"
            value={newKey.metadata.type}
            onChange={(value) =>
              setNewKey((prev) => ({
                ...prev,
                metadata: { ...prev.metadata, type: value || 'user' },
              }))
            }
            data={KEY_TYPES}
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Add a description for this API key..."
            value={newKey.metadata.description}
            onChange={(e) =>
              setNewKey((prev) => ({
                ...prev,
                metadata: { ...prev.metadata, description: e.target.value },
              }))
            }
            rows={3}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateApiKey} disabled={!newKey.name.trim()}>
              Create API Key
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Show Created API Key Modal */}
      <Modal
        opened={keyModalOpened}
        onClose={closeKeyModal}
        title="API Key Created Successfully"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack gap="md">
          <Alert
            icon={<IconAlertTriangle size={16} />}
            title="Important: Save Your API Key"
            color="orange"
          >
            This is the only time you&apos;ll see this API key. Make sure to copy it now and store
            it securely.
          </Alert>

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Your API Key:
            </Text>
            <Group gap="xs">
              <Code
                style={{
                  flex: 1,
                  fontSize: '12px',
                  wordBreak: 'break-all',
                  filter: showKey ? 'none' : 'blur(4px)',
                  transition: 'filter 0.2s ease',
                }}
              >
                {createdKey}
              </Code>
              <Tooltip label={showKey ? 'Hide key' : 'Show key'}>
                <ActionIcon variant="light" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </ActionIcon>
              </Tooltip>
              <Tooltip label={clipboard.copied ? 'Copied!' : 'Copy to clipboard'}>
                <ActionIcon
                  variant="light"
                  color={clipboard.copied ? 'green' : 'blue'}
                  onClick={copyApiKey}
                >
                  <IconCopy size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Stack>

          <Group justify="flex-end" mt="md">
            <Button onClick={closeKeyModal}>I&apos;ve Saved My Key</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
