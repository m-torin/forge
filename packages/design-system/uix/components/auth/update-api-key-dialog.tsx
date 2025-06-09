'use client';

import {
  ActionIcon,
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  NumberInput,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconEdit } from '@tabler/icons-react';
import React, { useState } from 'react';

import { updateApiKey } from '@repo/auth/client';

/**
 * API key data structure for updates.
 */
interface ApiKeyData {
  /** Whether the API key is enabled */
  enabled: boolean;
  /** Unique identifier for the API key */
  id: string;
  /** Display name for the API key */
  name: string;
  /** API key permissions by resource type */
  permissions?: Record<string, string[]>;
  /** Whether rate limiting is enabled */
  rateLimitEnabled?: boolean;
  /** Maximum requests per time window */
  rateLimitMax?: number;
  /** Rate limit time window in milliseconds */
  rateLimitTimeWindow?: number;
  /** Refill amount for rate limiting */
  refillAmount?: number;
  /** Refill interval in milliseconds */
  refillInterval?: number;
  /** Remaining uses limit */
  remaining?: number;
}

/**
 * Form data interface for API key updates.
 */
interface UpdateApiKeyFormData {
  /** Whether the API key is enabled */
  enabled: boolean;
  /** Display name for the API key */
  name: string;
  /** Whether rate limiting is enabled */
  rateLimitEnabled: boolean;
  /** Maximum requests per time window */
  rateLimitMax: number | '';
  /** Rate limit time window in milliseconds */
  rateLimitTimeWindow: number | '';
  /** Refill amount for rate limiting */
  refillAmount: number | '';
  /** Refill interval in milliseconds */
  refillInterval: number | '';
  /** Remaining uses limit */
  remaining: number | '';
}

/**
 * Props for the UpdateApiKeyDialog component.
 */
interface UpdateApiKeyDialogProps {
  /** Whether to show advanced server options (admin only) */
  allowServerOptions?: boolean;
  /** The API key data to be updated */
  apiKey: ApiKeyData;
  /** Callback function called on successful API key update */
  onSuccess?: () => void;
}

/**
 * Dialog component for updating existing API keys with comprehensive configuration options.
 *
 * @param props - Component props
 * @returns API key update dialog with form validation and success display
 *
 * @example
 * ```tsx
 * <UpdateApiKeyDialog
 *   allowServerOptions={user.isAdmin}
 *   apiKey={selectedApiKey}
 *   onSuccess={() => refetch()}
 * />
 * ```
 */
export function UpdateApiKeyDialog({
  allowServerOptions = false,
  apiKey,
  onSuccess,
}: UpdateApiKeyDialogProps) {
  const [opened, { close, open }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, string[]>>(
    apiKey.permissions || {
      read: [],
      write: [],
    },
  );

  const form = useForm<UpdateApiKeyFormData>({
    validate: {
      name: (value) => {
        if (!value.trim()) return 'API key name is required';
        if (value.length < 3) return 'Name must be at least 3 characters';
        if (value.length > 50) return 'Name must be less than 50 characters';
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
    },
    initialValues: {
      name: apiKey.name,
      enabled: apiKey.enabled,
      rateLimitEnabled: apiKey.rateLimitEnabled ?? false,
      rateLimitMax: apiKey.rateLimitMax || 100,
      rateLimitTimeWindow: apiKey.rateLimitTimeWindow || 86400000,
      refillAmount: apiKey.refillAmount || '',
      refillInterval: apiKey.refillInterval || '',
      remaining: apiKey.remaining || '',
    },
  });

  /**
   * Handles API key update form submission.
   *
   * @param values - Validated form data
   */
  const handleUpdate = async (values: UpdateApiKeyFormData) => {
    try {
      setLoading(true);

      const requestData: any = {
        name: values.name,
        enabled: values.enabled,
        keyId: apiKey.id,
      };

      // Add server options if admin mode
      if (allowServerOptions) {
        if (values.remaining !== '') requestData.remaining = values.remaining;
        if (values.refillAmount !== '') requestData.refillAmount = values.refillAmount;
        if (values.refillInterval !== '') requestData.refillInterval = values.refillInterval;
        requestData.rateLimitEnabled = values.rateLimitEnabled;
        if (values.rateLimitEnabled) {
          requestData.rateLimitTimeWindow = values.rateLimitTimeWindow;
          requestData.rateLimitMax = values.rateLimitMax;
        }
        requestData.permissions = permissions;
      }

      const { error } = await updateApiKey(requestData);

      if (error) {
        notifications.show({
          color: 'red',
          message: error.message || 'Failed to update API key',
          title: 'Error',
        });
        return;
      }

      notifications.show({
        color: 'green',
        message: 'API key updated successfully',
        title: 'Success',
      });
      close();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update API key:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to update API key',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles dialog close and resets all form state.
   */
  const handleClose = () => {
    close();
    form.reset();
    setPermissions(apiKey.permissions || { read: [], write: [] });
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
      <ActionIcon onClick={open} variant="subtle">
        <IconEdit size={16} />
      </ActionIcon>

      <Modal
        onClose={handleClose}
        opened={opened}
        size="md"
        title={<Title order={4}>Update API Key</Title>}
      >
        <Text c="dimmed" mb="lg" size="sm">
          Update the settings for your API key.
        </Text>

        <form onSubmit={form.onSubmit(handleUpdate)}>
          <Stack gap="md">
            <TextInput
              {...form.getInputProps('name')}
              placeholder="My API Key"
              label="Name"
              required
            />

            <Group justify="space-between">
              <Text size="sm">Enabled</Text>
              <Switch {...form.getInputProps('enabled', { type: 'checkbox' })} />
            </Group>

            {allowServerOptions && (
              <>
                <Divider labelPosition="left" label="Permissions" />
                <Stack gap="xs">
                  <Checkbox
                    onChange={(e) =>
                      handlePermissionChange('read', 'user', e.currentTarget.checked)
                    }
                    checked={permissions.read?.includes('user')}
                    label="Read User Data"
                  />
                  <Checkbox
                    onChange={(e) =>
                      handlePermissionChange('write', 'user', e.currentTarget.checked)
                    }
                    checked={permissions.write?.includes('user')}
                    label="Write User Data"
                  />
                  <Checkbox
                    onChange={(e) =>
                      handlePermissionChange('read', 'organization', e.currentTarget.checked)
                    }
                    checked={permissions.read?.includes('organization')}
                    label="Read Organization Data"
                  />
                  <Checkbox
                    onChange={(e) =>
                      handlePermissionChange('write', 'organization', e.currentTarget.checked)
                    }
                    checked={permissions.write?.includes('organization')}
                    label="Write Organization Data"
                  />
                </Stack>

                <Divider labelPosition="left" label="Server Options (Admin Only)" />
                <Stack gap="sm">
                  <NumberInput
                    {...form.getInputProps('remaining')}
                    placeholder="Leave empty for unlimited"
                    label="Remaining Uses"
                    min={0}
                  />

                  <Group grow>
                    <NumberInput
                      {...form.getInputProps('refillAmount')}
                      placeholder="e.g., 1000"
                      label="Refill Amount"
                      min={0}
                    />
                    <NumberInput
                      {...form.getInputProps('refillInterval')}
                      placeholder="e.g., 86400000"
                      label="Refill Interval (ms)"
                      min={0}
                    />
                  </Group>

                  <Group justify="space-between">
                    <Text size="sm">Enable Rate Limiting</Text>
                    <Switch {...form.getInputProps('rateLimitEnabled', { type: 'checkbox' })} />
                  </Group>

                  {form.values.rateLimitEnabled && (
                    <Group grow>
                      <NumberInput
                        {...form.getInputProps('rateLimitMax')}
                        label="Max Requests"
                        min={1}
                        required
                      />
                      <NumberInput
                        {...form.getInputProps('rateLimitTimeWindow')}
                        label="Time Window (ms)"
                        min={1}
                        required
                      />
                    </Group>
                  )}
                </Stack>
              </>
            )}
          </Stack>

          <Group justify="flex-end" mt="xl">
            <Button onClick={handleClose} type="button" variant="subtle">
              Cancel
            </Button>
            <Button loading={loading} disabled={!form.isValid()} type="submit">
              Update API Key
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
}
