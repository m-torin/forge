'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Code,
  Group,
  Modal,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconEye, IconEyeOff, IconRefresh, IconTrash } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';

import { deleteApiKey, listApiKeys } from '@repo/auth-new/client';

interface ApiKey {
  createdAt: string;
  enabled: boolean;
  expiresAt?: string | null;
  id: string;
  key?: string;
  lastRequest?: string;
  metadata?: Record<string, any>;
  name: string;
  permissions?: Record<string, string[]>;
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

interface ApiKeyListProps {
  allowFiltering?: boolean;
  onKeySelect?: (key: ApiKey) => void;
  onRefresh?: () => void;
  showUserInfo?: boolean;
}

export function ApiKeyList({
  allowFiltering = false,
  onKeySelect,
  onRefresh,
  showUserInfo = false,
}: ApiKeyListProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [deleteModalOpened, { close: closeDeleteModal, open: openDeleteModal }] =
    useDisclosure(false);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const data = await listApiKeys();
      if (data && Array.isArray(data)) {
        setApiKeys(data);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to load API keys',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleDelete = async () => {
    if (!keyToDelete) return;

    try {
      await deleteApiKey({ keyId: keyToDelete.id });
      notifications.show({
        color: 'green',
        message: 'API key deleted successfully',
        title: 'Success',
      });
      await fetchApiKeys();
      onRefresh?.();
      closeDeleteModal();
    } catch (error) {
      console.error('Failed to delete API key:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to delete API key',
        title: 'Error',
      });
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notifications.show({
      color: 'green',
      message: 'Copied to clipboard',
      title: 'Success',
    });
  };

  const handleRefresh = async () => {
    await fetchApiKeys();
    onRefresh?.();
  };

  const filteredKeys = apiKeys.filter((key) => {
    const matchesSearch =
      key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (key.userId && key.userId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterEnabled === 'all' ||
      (filterEnabled === 'enabled' && key.enabled) ||
      (filterEnabled === 'disabled' && !key.enabled);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton width={200} height={48} />
        <Stack gap="xs">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={64} />
          ))}
        </Stack>
      </Stack>
    );
  }

  const rows = filteredKeys.map((apiKey) => (
    <Table.Tr
      key={apiKey.id}
      onClick={() => onKeySelect?.(apiKey)}
      style={{ cursor: onKeySelect ? 'pointer' : 'default' }}
    >
      <Table.Td>
        <Stack gap={4}>
          <Text fw={500}>{apiKey.name}</Text>
          {apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date() && (
            <Badge color="red" size="xs">
              Expired
            </Badge>
          )}
        </Stack>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Code>
            {apiKey.prefix && `${apiKey.prefix}_`}
            {apiKey.start || '****'}
            {showKeys[apiKey.id] && apiKey.key
              ? apiKey.key.slice(apiKey.start?.length || 4)
              : '****'}
          </Code>
          {apiKey.key && (
            <>
              <ActionIcon
                onClick={(e) => {
                  e.stopPropagation();
                  toggleKeyVisibility(apiKey.id);
                }}
                size="sm"
                variant="subtle"
              >
                {showKeys[apiKey.id] ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </ActionIcon>
              <ActionIcon
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(apiKey.key!);
                }}
                size="sm"
                variant="subtle"
              >
                <IconCopy size={16} />
              </ActionIcon>
            </>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={apiKey.enabled ? 'green' : 'gray'}>
          {apiKey.enabled ? 'Active' : 'Disabled'}
        </Badge>
      </Table.Td>
      {showUserInfo && (
        <Table.Td>
          <Code fz="xs">{apiKey.userId || 'N/A'}</Code>
        </Table.Td>
      )}
      <Table.Td>
        <Stack gap={4}>
          {apiKey.remaining !== null && apiKey.remaining !== undefined ? (
            <Text c={apiKey.remaining <= 10 ? 'red' : undefined} size="sm">
              {apiKey.remaining} uses left
            </Text>
          ) : (
            <Text c="dimmed" size="sm">
              Unlimited
            </Text>
          )}
          {apiKey.rateLimitEnabled && (
            <Text c="dimmed" size="sm">
              {apiKey.rateLimitMax}/{apiKey.rateLimitTimeWindow}ms
            </Text>
          )}
        </Stack>
      </Table.Td>
      <Table.Td>
        <time dateTime={apiKey.createdAt}>{new Date(apiKey.createdAt).toLocaleDateString()}</time>
      </Table.Td>
      <Table.Td>
        <Group justify="flex-end">
          <ActionIcon
            color="red"
            onClick={(e) => {
              e.stopPropagation();
              setKeyToDelete(apiKey);
              openDeleteModal();
            }}
            variant="subtle"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Stack gap="md">
        {allowFiltering && (
          <Group>
            <TextInput
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              placeholder="Search by name or user ID..."
              style={{ maxWidth: 400, flex: 1 }}
              value={searchTerm}
            />
            <Select
              onChange={(value) => setFilterEnabled(value as 'all' | 'enabled' | 'disabled')}
              data={[
                { label: 'All Keys', value: 'all' },
                { label: 'Enabled Only', value: 'enabled' },
                { label: 'Disabled Only', value: 'disabled' },
              ]}
              value={filterEnabled}
              w={150}
            />
            <ActionIcon
              onClick={handleRefresh}
              aria-label="Refresh API keys"
              size="lg"
              variant="default"
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
        )}

        {filteredKeys.length === 0 ? (
          <Box py="xl" ta="center">
            <Text c="dimmed">
              {searchTerm || filterEnabled !== 'all'
                ? 'No API keys match your filters'
                : 'No API keys found'}
            </Text>
          </Box>
        ) : (
          <Table highlightOnHover={!!onKeySelect}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Key</Table.Th>
                <Table.Th>Status</Table.Th>
                {showUserInfo && <Table.Th>User ID</Table.Th>}
                <Table.Th>Limits</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        )}
      </Stack>

      <Modal onClose={closeDeleteModal} opened={deleteModalOpened} centered title="Delete API Key">
        <Stack gap="md">
          <Text>
            Are you sure you want to delete the API key "{keyToDelete?.name}"? This action cannot be
            undone.
          </Text>
          <Group justify="flex-end">
            <Button onClick={closeDeleteModal} variant="default">
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
