'use client';

import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';

import { createApiKey } from '@repo/auth/client';

/**
 * API key creation form data interface.
 */
interface ApiKeyFormData {
  /** Whether rate limiting is enabled */
  enableRateLimit: boolean;
  /** Expiration time in seconds, or 'never' */
  expiresIn: string;
  /** JSON metadata string */
  metadata: string;
  /** Display name for the API key */
  name: string;
  /** Key prefix for identification */
  prefix: string;
  /** Maximum requests per time window */
  rateLimitMax: string;
  /** Rate limit time window in milliseconds */
  rateLimitTimeWindow: string;
  /** Refill amount for rate limiting */
  refillAmount: string;
  /** Refill interval in milliseconds */
  refillInterval: string;
  /** Remaining uses limit */
  remaining: string;
  /** User ID for server-side assignment (admin only) */
  userId: string;
}

/**
 * Permission structure for API key access control.
 */
interface ApiKeyPermissions {
  /** Additional permission types (allows indexing) */
  [action: string]: string[] | undefined;
  /** Read permissions by resource type */
  read?: string[];
  /** Write permissions by resource type */
  write?: string[];
}

/**
 * Props for the CreateApiKeyDialog component.
 */
interface CreateApiKeyDialogProps {
  /** Whether to show advanced server options (admin only) */
  allowServerOptions?: boolean;
  /** Callback function called on successful API key creation */
  onSuccess?: () => void;
}

/**
 * Result of successful API key creation.
 */
interface CreatedApiKey {
  /** Unique identifier for the API key */
  id: string;
  /** The actual API key string */
  key: string;
}

/**
 * Dialog component for creating new API keys with comprehensive configuration options.
 *
 * @param props - Component props
 * @returns API key creation dialog with form validation and success display
 *
 * @example
 * ```tsx
 * <CreateApiKeyDialog
 *   allowServerOptions={user.isAdmin}
 *   onSuccess={() => refetch()}
 * />
 * ```
 */
export function CreateApiKeyDialog({
  allowServerOptions = false,
  onSuccess,
}: CreateApiKeyDialogProps) {
  const [opened, { close, open }] = useDisclosure(false);
  const [permissions, setPermissions] = useState<ApiKeyPermissions>({
    read: ['user', 'organization'],
    write: ['user'],
  });
  const [loading, setLoading] = useState(false);
  const [newApiKey, setNewApiKey] = useState<CreatedApiKey | null>(null);

  const form = useForm<ApiKeyFormData>({
    validate: {
      name: (value) => {
        if (!value.trim()) return 'API key name is required';
        if (value.length < 3) return 'Name must be at least 3 characters';
        if (value.length > 50) return 'Name must be less than 50 characters';
        return null;
      },
      metadata: (value) => {
        if (value.trim()) {
          try {
            JSON.parse(value);
          } catch {
            return 'Metadata must be valid JSON';
          }
        }
        return null;
      },
      prefix: (value) => {
        if (value && value.length > 12) return 'Prefix must be 12 characters or less';
        if (value && !/^[a-zA-Z0-9-_]+$/.test(value)) {
          return 'Prefix can only contain letters, numbers, hyphens, and underscores';
        }
        return null;
      },
      rateLimitMax: (value) => {
        if (value && (!Number.isInteger(Number(value)) || Number(value) < 1)) {
          return 'Max requests must be a positive integer';
        }
        return null;
      },
      rateLimitTimeWindow: (value) => {
        if (value && (!Number.isInteger(Number(value)) || Number(value) < 1000)) {
          return 'Time window must be at least 1000ms';
        }
        return null;
      },
      refillAmount: (value, values) => {
        if (allowServerOptions && value && !values.refillInterval) {
          return 'Refill interval is required when refill amount is set';
        }
        if (value && (!Number.isInteger(Number(value)) || Number(value) < 1)) {
          return 'Refill amount must be a positive integer';
        }
        return null;
      },
      refillInterval: (value, values) => {
        if (allowServerOptions && value && !values.refillAmount) {
          return 'Refill amount is required when refill interval is set';
        }
        if (value && (!Number.isInteger(Number(value)) || Number(value) < 1)) {
          return 'Refill interval must be a positive integer';
        }
        return null;
      },
      remaining: (value) => {
        if (value && (!Number.isInteger(Number(value)) || Number(value) < 1)) {
          return 'Remaining uses must be a positive integer';
        }
        return null;
      },
    },
    initialValues: {
      name: '',
      enableRateLimit: true,
      expiresIn: 'never',
      metadata: '',
      prefix: 'forge',
      rateLimitMax: '100',
      rateLimitTimeWindow: '86400000',
      refillAmount: '',
      refillInterval: '',
      remaining: '',
      userId: '',
    },
  });

  /**
   * Handles API key creation form submission.
   *
   * @param values - Validated form data
   */
  const handleCreate = async (values: ApiKeyFormData) => {
    try {
      setLoading(true);

      const metadataObj = values.metadata.trim() ? JSON.parse(values.metadata) : undefined;
      const expiresInSeconds = values.expiresIn === 'never' ? null : parseInt(values.expiresIn);

      const requestData: any = {
        name: values.name,
        expiresIn: expiresInSeconds,
        metadata: metadataObj,
        permissions,
        prefix: values.prefix,
      };

      // Add server options if admin mode
      if (allowServerOptions) {
        if (values.userId) requestData.userId = values.userId;
        if (values.remaining) requestData.remaining = parseInt(values.remaining);
        if (values.refillAmount) requestData.refillAmount = parseInt(values.refillAmount);
        if (values.refillInterval) requestData.refillInterval = parseInt(values.refillInterval);
        if (values.enableRateLimit) {
          requestData.rateLimitEnabled = true;
          requestData.rateLimitTimeWindow = parseInt(values.rateLimitTimeWindow);
          requestData.rateLimitMax = parseInt(values.rateLimitMax);
        } else {
          requestData.rateLimitEnabled = false;
        }
      }

      const { data, error } = await createApiKey(requestData);

      if (error) {
        notifications.show({
          color: 'red',
          message: error.message || 'Failed to create API key',
          title: 'Error',
        });
        return;
      }

      if (data) {
        setNewApiKey({ id: data.id, key: data.key });
        notifications.show({
          color: 'green',
          message: 'API key created successfully',
          title: 'Success',
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to create API key',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copies text to clipboard and shows success notification.
   *
   * @param text - Text to copy to clipboard
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notifications.show({
      color: 'green',
      message: 'Copied to clipboard',
      title: 'Success',
    });
  };

  /**
   * Handles dialog close and resets all form state.
   */
  const handleClose = () => {
    close();
    setNewApiKey(null);
    form.reset();
    setPermissions({
      read: ['user', 'organization'],
      write: ['user'],
    });
  };

  /**
   * Handles permission changes for API key access control.
   *
   * @param action - The permission action type (read/write)
   * @param resource - The resource type being permissioned
   * @param checked - Whether the permission is being enabled or disabled
   */
  const handlePermissionChange = (action: string, resource: string, checked: boolean) => {
    setPermissions((prev) => {
      const newPermissions = { ...prev };
      if (!newPermissions[action]) {
        newPermissions[action] = [];
      }

      if (checked) {
        if (!newPermissions[action].includes(resource)) {
          newPermissions[action] = [...newPermissions[action], resource];
        }
      } else {
        newPermissions[action] = newPermissions[action].filter((r) => r !== resource);
      }

      return newPermissions;
    });
  };

  return (
    <>
      <Button leftSection={<IconPlus size={16} />} onClick={open}>
        Create API Key
      </Button>
      <Modal onClose={handleClose} opened={opened} size="md" title="Create API Key">
        {!newApiKey ? (
          <>
            <Text color="dimmed" mb="md" size="sm">
              Create a new API key to authenticate requests to your application.
            </Text>
            <form onSubmit={form.onSubmit(handleCreate)}>
              <Stack gap="md">
                <TextInput
                  {...form.getInputProps('name')}
                  placeholder="My API Key"
                  label="Name"
                  required
                />
                <TextInput
                  {...form.getInputProps('prefix')}
                  placeholder="forge"
                  label="Prefix"
                  maxLength={12}
                />
                <Select
                  {...form.getInputProps('expiresIn')}
                  data={[
                    { label: 'Never', value: 'never' },
                    { label: '1 hour', value: '3600' },
                    { label: '1 day', value: '86400' },
                    { label: '7 days', value: '604800' },
                    { label: '30 days', value: '2592000' },
                    { label: '90 days', value: '7776000' },
                    { label: '1 year', value: '31536000' },
                  ]}
                  label="Expires In"
                />
                <Textarea
                  {...form.getInputProps('metadata')}
                  placeholder='{"tier": "premium"}'
                  rows={3}
                  label="Metadata (JSON)"
                />
                <Stack gap="xs">
                  <Text fw={500} size="sm">
                    Permissions
                  </Text>
                  <Checkbox
                    onChange={(event) =>
                      handlePermissionChange('read', 'user', event.currentTarget.checked)
                    }
                    checked={permissions.read?.includes('user')}
                    label="Read User Data"
                  />
                  <Checkbox
                    onChange={(event) =>
                      handlePermissionChange('write', 'user', event.currentTarget.checked)
                    }
                    checked={permissions.write?.includes('user')}
                    label="Write User Data"
                  />
                  <Checkbox
                    onChange={(event) =>
                      handlePermissionChange('read', 'organization', event.currentTarget.checked)
                    }
                    checked={permissions.read?.includes('organization')}
                    label="Read Organization Data"
                  />
                  <Checkbox
                    onChange={(event) =>
                      handlePermissionChange('write', 'organization', event.currentTarget.checked)
                    }
                    checked={permissions.write?.includes('organization')}
                    label="Write Organization Data"
                  />
                </Stack>
                <Checkbox
                  {...form.getInputProps('enableRateLimit', { type: 'checkbox' })}
                  label={`Enable rate limiting ${!allowServerOptions ? '(100 requests/day)' : ''}`}
                />

                {allowServerOptions && (
                  <Stack gap="md">
                    <Text fw={600} size="sm">
                      Server Options (Admin Only)
                    </Text>
                    <TextInput
                      {...form.getInputProps('userId')}
                      placeholder="Leave empty to assign to current user"
                      label="User ID (optional)"
                    />
                    <NumberInput
                      {...form.getInputProps('remaining')}
                      placeholder="Leave empty for unlimited"
                      label="Remaining Uses (optional)"
                      min={1}
                    />
                    <Group grow>
                      <NumberInput
                        {...form.getInputProps('refillAmount')}
                        placeholder="e.g., 1000"
                        label="Refill Amount"
                        min={1}
                      />
                      <NumberInput
                        {...form.getInputProps('refillInterval')}
                        placeholder="e.g., 86400000"
                        label="Refill Interval (ms)"
                        min={1}
                      />
                    </Group>
                    {form.values.enableRateLimit && (
                      <Group grow>
                        <NumberInput
                          {...form.getInputProps('rateLimitMax')}
                          label="Max Requests"
                          min={1}
                        />
                        <NumberInput
                          {...form.getInputProps('rateLimitTimeWindow')}
                          label="Time Window (ms)"
                          min={1000}
                        />
                      </Group>
                    )}
                  </Stack>
                )}

                <Button
                  fullWidth
                  loading={loading}
                  disabled={loading || !form.isValid()}
                  mt="md"
                  type="submit"
                >
                  Create API Key
                </Button>
              </Stack>
            </form>
          </>
        ) : (
          <Stack gap="md">
            <div>
              <Text fw={500} size="lg">
                API Key Created
              </Text>
              <Text color="dimmed" size="sm">
                Your API key has been created successfully. Make sure to copy it now as you won't be
                able to see it again.
              </Text>
            </div>
            <Paper withBorder p="md">
              <Stack gap="xs">
                <Text fw={500} size="sm">
                  Your API Key
                </Text>
                <Text color="dimmed" size="sm">
                  This is your new API key. Keep it secure and don't share it publicly.
                </Text>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono break-all">
                    {newApiKey.key}
                  </code>
                  <ActionIcon
                    onClick={() => copyToClipboard(newApiKey.key)}
                    size="lg"
                    variant="default"
                  >
                    <IconCopy size={16} />
                  </ActionIcon>
                </div>
              </Stack>
            </Paper>
            <Button fullWidth onClick={handleClose}>
              Close
            </Button>
          </Stack>
        )}
      </Modal>
    </>
  );
}
