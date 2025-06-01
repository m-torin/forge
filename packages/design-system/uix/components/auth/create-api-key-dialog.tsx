'use client';

import {
  ActionIcon,
  Button,
  Checkbox,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';

import { createApiKey } from '@repo/auth/client';

interface CreateApiKeyDialogProps {
  allowServerOptions?: boolean;
  onSuccess?: () => void;
}

export function CreateApiKeyDialog({
  allowServerOptions = false,
  onSuccess,
}: CreateApiKeyDialogProps) {
  const [opened, { close, open }] = useDisclosure(false);
  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('forge');
  const [expiresIn, setExpiresIn] = useState<string>('never');
  const [metadata, setMetadata] = useState('');
  const [enableRateLimit, setEnableRateLimit] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({
    read: ['user', 'organization'],
    write: ['user'],
  });
  const [loading, setLoading] = useState(false);
  const [newApiKey, setNewApiKey] = useState<{ key: string; id: string } | null>(null);

  // Server options (admin only)
  const [userId, setUserId] = useState('');
  const [remaining, setRemaining] = useState<string>('');
  const [refillAmount, setRefillAmount] = useState<string>('');
  const [refillInterval, setRefillInterval] = useState<string>('');
  const [rateLimitTimeWindow, setRateLimitTimeWindow] = useState<string>('86400000');
  const [rateLimitMax, setRateLimitMax] = useState<string>('100');

  const handleCreate = async () => {
    if (!name.trim()) {
      notifications.show({
        color: 'red',
        message: 'Please enter a name for the API key',
        title: 'Error',
      });
      return;
    }

    if (allowServerOptions && refillAmount && !refillInterval) {
      notifications.show({
        color: 'red',
        message: 'Please provide refill interval when refill amount is set',
        title: 'Error',
      });
      return;
    }

    if (allowServerOptions && refillInterval && !refillAmount) {
      notifications.show({
        color: 'red',
        message: 'Please provide refill amount when refill interval is set',
        title: 'Error',
      });
      return;
    }

    try {
      setLoading(true);

      const metadataObj = metadata.trim() ? JSON.parse(metadata) : undefined;
      const expiresInSeconds = expiresIn === 'never' ? null : parseInt(expiresIn);

      const requestData: any = {
        name,
        expiresIn: expiresInSeconds,
        metadata: metadataObj,
        permissions,
        prefix,
      };

      // Add server options if admin mode
      if (allowServerOptions) {
        if (userId) requestData.userId = userId;
        if (remaining) requestData.remaining = parseInt(remaining);
        if (refillAmount) requestData.refillAmount = parseInt(refillAmount);
        if (refillInterval) requestData.refillInterval = parseInt(refillInterval);
        if (enableRateLimit) {
          requestData.rateLimitEnabled = true;
          requestData.rateLimitTimeWindow = parseInt(rateLimitTimeWindow);
          requestData.rateLimitMax = parseInt(rateLimitMax);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notifications.show({
      color: 'green',
      message: 'Copied to clipboard',
      title: 'Success',
    });
  };

  const handleClose = () => {
    close();
    setNewApiKey(null);
    setName('');
    setPrefix('forge');
    setExpiresIn('never');
    setMetadata('');
    setEnableRateLimit(true);
    setPermissions({
      read: ['user', 'organization'],
      write: ['user'],
    });
    setUserId('');
    setRemaining('');
    setRefillAmount('');
    setRefillInterval('');
    setRateLimitTimeWindow('86400000');
    setRateLimitMax('100');
  };

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
            <Stack gap="md">
              <TextInput
                onChange={(e) => setName(e.currentTarget.value)}
                placeholder="My API Key"
                label="Name"
                required
                value={name}
              />
              <TextInput
                onChange={(e) => setPrefix(e.currentTarget.value)}
                placeholder="forge"
                label="Prefix"
                maxLength={12}
                value={prefix}
              />
              <Select
                onChange={(value) => setExpiresIn(value || 'never')}
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
                value={expiresIn}
              />
              <Textarea
                onChange={(e) => setMetadata(e.currentTarget.value)}
                placeholder='{"tier": "premium"}'
                rows={3}
                label="Metadata (JSON)"
                value={metadata}
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
                onChange={(event) => setEnableRateLimit(event.currentTarget.checked)}
                checked={enableRateLimit}
                label={`Enable rate limiting ${!allowServerOptions ? '(100 requests/day)' : ''}`}
              />

              {allowServerOptions && (
                <Stack gap="md">
                  <Text fw={600} size="sm">
                    Server Options (Admin Only)
                  </Text>
                  <TextInput
                    onChange={(e) => setUserId(e.currentTarget.value)}
                    placeholder="Leave empty to assign to current user"
                    label="User ID (optional)"
                    value={userId}
                  />
                  <TextInput
                    onChange={(e) => setRemaining(e.currentTarget.value)}
                    placeholder="Leave empty for unlimited"
                    label="Remaining Uses (optional)"
                    type="number"
                    value={remaining}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <TextInput
                      onChange={(e) => setRefillAmount(e.currentTarget.value)}
                      placeholder="e.g., 1000"
                      label="Refill Amount"
                      type="number"
                      value={refillAmount}
                    />
                    <TextInput
                      onChange={(e) => setRefillInterval(e.currentTarget.value)}
                      placeholder="e.g., 86400000"
                      label="Refill Interval (ms)"
                      type="number"
                      value={refillInterval}
                    />
                  </div>
                  {enableRateLimit && (
                    <div className="grid grid-cols-2 gap-2">
                      <TextInput
                        onChange={(e) => setRateLimitMax(e.currentTarget.value)}
                        label="Max Requests"
                        type="number"
                        value={rateLimitMax}
                      />
                      <TextInput
                        onChange={(e) => setRateLimitTimeWindow(e.currentTarget.value)}
                        label="Time Window (ms)"
                        type="number"
                        value={rateLimitTimeWindow}
                      />
                    </div>
                  )}
                </Stack>
              )}
            </Stack>
            <Button fullWidth onClick={handleCreate} disabled={loading || !name.trim()} mt="md">
              {loading ? 'Creating...' : 'Create API Key'}
            </Button>
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
