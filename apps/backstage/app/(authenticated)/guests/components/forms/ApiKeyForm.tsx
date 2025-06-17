'use client';

import {
  Button,
  Group,
  Stack,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Alert,
  Code,
  ActionIcon,
  Tooltip,
  Modal,
  Text,
} from '@mantine/core';
import { IconAlertTriangle, IconCopy, IconEye, IconEyeOff } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useClipboard, useDisclosure } from '@mantine/hooks';

import { createApiKey, updateApiKey, listAllOrganizations } from '@repo/auth/server/next';
import type { ApiKey, Organization } from '../../types';

interface ApiKeyFormProps {
  apiKey?: ApiKey;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ApiKeyForm({ apiKey, onSuccess, onCancel }: ApiKeyFormProps) {
  const router = useRouter();
  const clipboard = useClipboard({ timeout: 2000 });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [keyModalOpened, { open: openKeyModal, close: closeKeyModal }] = useDisclosure(false);
  const [createdKey, setCreatedKey] = useState<string>('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEdit = !!apiKey;

  const [formData, setFormData] = useState({
    name: apiKey?.name || '',
    organizationId: apiKey?.organizationId || '',
    permissions: apiKey?.permissions || [],
    expiresAt: apiKey?.expiresAt ? new Date(apiKey.expiresAt).toISOString().split('T')[0] : '',
    metadata: apiKey?.metadata || {
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

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const result = await listAllOrganizations();
      if (result.success && result.data) {
        setOrganizations(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEdit) {
        const result = await updateApiKey({
          id: apiKey.id,
          name: formData.name,
          permissions: formData.permissions,
          expiresAt: formData.expiresAt || undefined,
          metadata: formData.metadata,
        });

        if (result.success) {
          notifications.show({
            title: 'Success',
            message: 'API key updated successfully',
            color: 'green',
          });
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/guests/api-keys');
          }
        } else {
          notifications.show({
            title: 'Error',
            message: result.error || 'Failed to update API key',
            color: 'red',
          });
        }
      } else {
        const result = await createApiKey({
          name: formData.name,
          organizationId: formData.organizationId || undefined,
          permissions: formData.permissions.length > 0 ? formData.permissions : ['read'],
          expiresAt: formData.expiresAt || undefined,
          metadata: formData.metadata,
        });

        if (result.success && result.data) {
          setCreatedKey(result.data.key || result.data.apiKey || '');
          openKeyModal();
        } else {
          notifications.show({
            title: 'Error',
            message: result.error || 'Failed to create API key',
            color: 'red',
          });
        }
      }
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} API key:`, error);
      notifications.show({
        title: 'Error',
        message: `Failed to ${isEdit ? 'update' : 'create'} API key`,
        color: 'red',
      });
    } finally {
      setLoading(false);
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

  const handleKeyModalClose = () => {
    closeKeyModal();
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/guests/api-keys');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <>
      <Stack gap="md">
        <TextInput
          label="Key Name"
          placeholder="Enter a descriptive name for this API key"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
        />

        {!isEdit && (
          <Select
            label="Organization (Optional)"
            placeholder="Select organization to scope this key"
            value={formData.organizationId}
            onChange={(value) => setFormData((prev) => ({ ...prev, organizationId: value || '' }))}
            data={organizations.map((org) => ({ value: org.id, label: org.name }))}
            clearable
          />
        )}

        <MultiSelect
          label="Permissions"
          placeholder="Select permissions for this API key"
          value={formData.permissions}
          onChange={(value) => setFormData((prev) => ({ ...prev, permissions: value }))}
          data={availablePermissions}
          description="Leave empty to use default read permissions"
        />

        <TextInput
          label="Expiration Date (Optional)"
          placeholder="YYYY-MM-DD"
          type="date"
          value={formData.expiresAt}
          onChange={(e) => setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))}
          description="Leave empty for a key that never expires"
        />

        <Select
          label="Key Type"
          value={formData.metadata.type}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              metadata: { ...prev.metadata, type: value || 'user' },
            }))
          }
          data={[
            { value: 'user', label: 'User Key' },
            { value: 'service', label: 'Service Key' },
          ]}
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Add a description for this API key..."
          value={formData.metadata.description}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              metadata: { ...prev.metadata, description: e.target.value },
            }))
          }
          rows={3}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim()} loading={loading}>
            {isEdit ? 'Update' : 'Create'} API Key
          </Button>
        </Group>
      </Stack>

      {/* Show Created API Key Modal */}
      <Modal
        opened={keyModalOpened}
        onClose={handleKeyModalClose}
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
            This is the only time you'll see this API key. Make sure to copy it now and store it
            securely.
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
            <Button onClick={handleKeyModalClose}>I've Saved My Key</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
