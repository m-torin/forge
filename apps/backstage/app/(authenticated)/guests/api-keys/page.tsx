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
  IconTrash,
  IconSettings,
  IconCalendar,
  IconActivity,
  IconShield,
  IconAlertTriangle,
  IconRefresh,
} from '@tabler/icons-react';
import { useDisclosure, useClipboard } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';

import { DataTable } from '../../components/data-table';
import { PageHeader } from '../../components/page-header';
import { StatsCard } from '../../components/stats-card';

interface ApiKey {
  id: string;
  name: string;
  start?: string;
  prefix?: string;
  enabled: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  permissions?: string[];
  metadata?: {
    type?: string;
    serviceId?: string;
    description?: string;
  };
  requestCount: number;
  remaining?: number;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [keyModalOpened, { open: openKeyModal, close: closeKeyModal }] = useDisclosure(false);
  const [createdKey, setCreatedKey] = useState<string>('');
  const [showKey, setShowKey] = useState(false);
  const clipboard = useClipboard({ timeout: 2000 });
  
  const [newKey, setNewKey] = useState({
    name: '',
    organizationId: '',
    permissions: [] as string[],
    expiresAt: '',
    metadata: {
      type: 'user',
      description: '',
    },
  });

  const availablePermissions = [
    { value: 'read', label: 'Read' },
    { value: 'write', label: 'Write' },
    { value: 'admin', label: 'Admin' },
    { value: 'delete', label: 'Delete' },
    { value: 'manage_users', label: 'Manage Users' },
    { value: 'manage_organizations', label: 'Manage Organizations' },
    { value: 'manage_api_keys', label: 'Manage API Keys' },
  ];

  const statsData = [
    {
      title: 'Total API Keys',
      value: apiKeys.length.toString(),
      color: 'blue',
      icon: IconKey,
      change: { value: 5 },
    },
    {
      title: 'Active Keys',
      value: apiKeys.filter(k => k.enabled && (!k.expiresAt || new Date(k.expiresAt) > new Date())).length.toString(),
      color: 'green',
      icon: IconShield,
      progress: { 
        label: 'of total keys', 
        value: apiKeys.length > 0 ? Math.round((apiKeys.filter(k => k.enabled).length / apiKeys.length) * 100) : 0 
      },
    },
    {
      title: 'Expired Keys',
      value: apiKeys.filter(k => k.expiresAt && new Date(k.expiresAt) < new Date()).length.toString(),
      color: 'red',
      icon: IconCalendar,
    },
    {
      title: 'Total Requests',
      value: apiKeys.reduce((acc, key) => acc + key.requestCount, 0).toLocaleString(),
      color: 'violet',
      icon: IconActivity,
    },
  ];

  useEffect(() => {
    loadApiKeys();
    loadOrganizations();
    
    // Listen for refresh events from modals
    const handleRefresh = () => loadApiKeys();
    window.addEventListener('refreshApiKeys', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshApiKeys', handleRefresh);
    };
  }, []);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys || []);
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to load API keys',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load API keys',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const response = await fetch('/api/admin/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  };

  const handleCreateApiKey = async () => {
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newKey,
          permissions: newKey.permissions.length > 0 ? newKey.permissions : ['read'],
          expiresAt: newKey.expiresAt || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCreatedKey(result.apiKey);
        closeCreateModal();
        openKeyModal();
        setNewKey({
          name: '',
          organizationId: '',
          permissions: [],
          expiresAt: '',
          metadata: { type: 'user', description: '' },
        });
        await loadApiKeys();
      } else {
        const error = await response.json();
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to create API key',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create API key',
        color: 'red',
      });
    }
  };

  const handleToggleKey = async (keyId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: `API key ${enabled ? 'enabled' : 'disabled'} successfully`,
          color: 'green',
        });
        await loadApiKeys();
      } else {
        notifications.show({
          title: 'Error',
          message: `Failed to ${enabled ? 'enable' : 'disable'} API key`,
          color: 'red',
        });
      }
    } catch (error) {
      console.error(`Failed to ${enabled ? 'enable' : 'disable'} API key:`, error);
      notifications.show({
        title: 'Error',
        message: `Failed to ${enabled ? 'enable' : 'disable'} API key`,
        color: 'red',
      });
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'API key deleted successfully',
          color: 'green',
        });
        await loadApiKeys();
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete API key',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete API key',
        color: 'red',
      });
    }
  };

  const copyApiKey = () => {
    clipboard.copy(createdKey);
    notifications.show({
      title: 'Copied',
      message: 'API key copied to clipboard',
      color: 'green',
    });
  };

  const isKeyExpired = (expiresAt?: string) => {
    return expiresAt && new Date(expiresAt) < new Date();
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
              <Code size="xs">{row.prefix || 'forge'}_****{row.start || '****'}</Code>
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
          <Badge
            color={expired ? 'red' : value ? 'green' : 'gray'}
            variant="dot"
          >
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
      render: (value: number) => (
        <Text size="sm">
          {value.toLocaleString()}
        </Text>
      ),
      sortable: true,
    },
    {
      key: 'lastUsedAt',
      label: 'Last Used',
      render: (value: string) => {
        if (!value) return <Text c="dimmed" size="sm">Never</Text>;
        const date = new Date(value);
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
      render: (value: string) => {
        if (!value) return <Text c="dimmed" size="sm">Never</Text>;
        const date = new Date(value);
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
              href: '/guests/api-keys/new',
            },
            secondary: [
              {
                label: 'Export Keys',
                onClick: () => console.log('Export API keys'),
              },
            ],
          }}
          description="Manage API keys for service authentication and access control"
          onRefresh={loadApiKeys}
          title="API Key Management"
        />

        <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="lg">
          {statsData.map((stat) => (
            <StatsCard
              key={stat.title}
              {...stat}
              loading={loading}
            />
          ))}
        </SimpleGrid>

        <DataTable
          actions={{
            custom: [
              {
                icon: (row) => row.enabled ? <IconEyeOff size={14} /> : <IconEye size={14} />,
                label: (row) => row.enabled ? 'Disable' : 'Enable',
                onClick: (row) => handleToggleKey(row.id, !row.enabled),
                color: (row) => row.enabled ? 'orange' : 'green',
              },
              {
                icon: <IconRefresh size={14} />,
                label: 'Regenerate',
                onClick: (row) => console.log('Regenerate key', row),
                condition: (row) => row.enabled && !isKeyExpired(row.expiresAt),
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
      <Modal opened={createModalOpened} onClose={closeCreateModal} title="Create New API Key" size="md">
        <Stack gap="md">
          <TextInput
            label="Key Name"
            placeholder="Enter a descriptive name for this API key"
            value={newKey.name}
            onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <Select
            label="Organization (Optional)"
            placeholder="Select organization to scope this key"
            value={newKey.organizationId}
            onChange={(value) => setNewKey(prev => ({ ...prev, organizationId: value || '' }))}
            data={organizations.map(org => ({ value: org.id, label: org.name }))}
            clearable
          />
          
          <MultiSelect
            label="Permissions"
            placeholder="Select permissions for this API key"
            value={newKey.permissions}
            onChange={(value) => setNewKey(prev => ({ ...prev, permissions: value }))}
            data={availablePermissions}
            description="Leave empty to use default read permissions"
          />
          
          <TextInput
            label="Expiration Date (Optional)"
            placeholder="YYYY-MM-DD"
            type="date"
            value={newKey.expiresAt}
            onChange={(e) => setNewKey(prev => ({ ...prev, expiresAt: e.target.value }))}
            description="Leave empty for a key that never expires"
          />
          
          <Select
            label="Key Type"
            value={newKey.metadata.type}
            onChange={(value) => setNewKey(prev => ({ 
              ...prev, 
              metadata: { ...prev.metadata, type: value || 'user' }
            }))}
            data={[
              { value: 'user', label: 'User Key' },
              { value: 'service', label: 'Service Key' },
            ]}
          />
          
          <Textarea
            label="Description (Optional)"
            placeholder="Add a description for this API key..."
            value={newKey.metadata.description}
            onChange={(e) => setNewKey(prev => ({ 
              ...prev, 
              metadata: { ...prev.metadata, description: e.target.value }
            }))}
            rows={3}
          />
          
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateApiKey}
              disabled={!newKey.name.trim()}
            >
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
            This is the only time you'll see this API key. Make sure to copy it now and store it securely.
          </Alert>
          
          <Stack gap="xs">
            <Text size="sm" fw={500}>Your API Key:</Text>
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
                <ActionIcon 
                  variant="light" 
                  onClick={() => setShowKey(!showKey)}
                >
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
            <Button onClick={closeKeyModal}>
              I've Saved My Key
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}