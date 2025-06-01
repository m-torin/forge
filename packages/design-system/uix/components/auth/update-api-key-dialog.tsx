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
import { notifications } from '@mantine/notifications';
import { IconEdit } from '@tabler/icons-react';
import React, { useState } from 'react';

import { updateApiKey } from '@repo/auth/client';

interface UpdateApiKeyDialogProps {
  allowServerOptions?: boolean;
  apiKey: {
    id: string;
    name: string;
    enabled: boolean;
    remaining?: number;
    refillAmount?: number;
    refillInterval?: number;
    rateLimitEnabled?: boolean;
    rateLimitTimeWindow?: number;
    rateLimitMax?: number;
    permissions?: Record<string, string[]>;
  };
  onSuccess?: () => void;
}

export function UpdateApiKeyDialog({
  allowServerOptions = false,
  apiKey,
  onSuccess,
}: UpdateApiKeyDialogProps) {
  const [name, setName] = useState(apiKey.name);
  const [enabled, setEnabled] = useState(apiKey.enabled);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Server options (admin only)
  const [remaining, setRemaining] = useState(apiKey.remaining || undefined);
  const [refillAmount, setRefillAmount] = useState(apiKey.refillAmount || undefined);
  const [refillInterval, setRefillInterval] = useState(apiKey.refillInterval || undefined);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(apiKey.rateLimitEnabled ?? false);
  const [rateLimitTimeWindow, setRateLimitTimeWindow] = useState(
    apiKey.rateLimitTimeWindow || 86400000,
  );
  const [rateLimitMax, setRateLimitMax] = useState(apiKey.rateLimitMax || 100);
  const [permissions, setPermissions] = useState<Record<string, string[]>>(
    apiKey.permissions || {
      read: [],
      write: [],
    },
  );

  const handleUpdate = async () => {
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

      const requestData: any = {
        name,
        enabled,
        keyId: apiKey.id,
      };

      // Add server options if admin mode
      if (allowServerOptions) {
        if (remaining !== undefined) requestData.remaining = remaining;
        if (refillAmount) requestData.refillAmount = refillAmount;
        if (refillInterval) requestData.refillInterval = refillInterval;
        requestData.rateLimitEnabled = rateLimitEnabled;
        if (rateLimitEnabled) {
          requestData.rateLimitTimeWindow = rateLimitTimeWindow;
          requestData.rateLimitMax = rateLimitMax;
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
      setIsOpen(false);
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

  const handleClose = () => {
    setIsOpen(false);
    setName(apiKey.name);
    setEnabled(apiKey.enabled);
    setRemaining(apiKey.remaining || undefined);
    setRefillAmount(apiKey.refillAmount || undefined);
    setRefillInterval(apiKey.refillInterval || undefined);
    setRateLimitEnabled(apiKey.rateLimitEnabled ?? false);
    setRateLimitTimeWindow(apiKey.rateLimitTimeWindow || 86400000);
    setRateLimitMax(apiKey.rateLimitMax || 100);
    setPermissions(apiKey.permissions || { read: [], write: [] });
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
      <ActionIcon onClick={() => setIsOpen(true)} variant="subtle">
        <IconEdit size={16} />
      </ActionIcon>

      <Modal
        onClose={handleClose}
        opened={isOpen}
        size="md"
        title={<Title order={4}>Update API Key</Title>}
      >
        <Text c="dimmed" mb="lg" size="sm">
          Update the settings for your API key.
        </Text>

        <Stack gap="md">
          <TextInput
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="My API Key"
            label="Name"
            required
            value={name}
          />

          <Group justify="space-between">
            <Text size="sm">Enabled</Text>
            <Switch onChange={(e) => setEnabled(e.currentTarget.checked)} checked={enabled} />
          </Group>

          {allowServerOptions && (
            <>
              <Divider labelPosition="left" label="Permissions" />
              <Stack gap="xs">
                <Checkbox
                  onChange={(e) => handlePermissionChange('read', 'user', e.currentTarget.checked)}
                  checked={permissions.read?.includes('user')}
                  label="Read User Data"
                />
                <Checkbox
                  onChange={(e) => handlePermissionChange('write', 'user', e.currentTarget.checked)}
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
                  onChange={(value) => setRemaining(value as number | undefined)}
                  placeholder="Leave empty for unlimited"
                  label="Remaining Uses"
                  min={0}
                  value={remaining}
                />

                <Group grow>
                  <NumberInput
                    onChange={(value) => setRefillAmount(value as number | undefined)}
                    placeholder="e.g., 1000"
                    label="Refill Amount"
                    min={0}
                    value={refillAmount}
                  />
                  <NumberInput
                    onChange={(value) => setRefillInterval(value as number | undefined)}
                    placeholder="e.g., 86400000"
                    label="Refill Interval (ms)"
                    min={0}
                    value={refillInterval}
                  />
                </Group>

                <Group justify="space-between">
                  <Text size="sm">Enable Rate Limiting</Text>
                  <Switch
                    onChange={(e) => setRateLimitEnabled(e.currentTarget.checked)}
                    checked={rateLimitEnabled}
                  />
                </Group>

                {rateLimitEnabled && (
                  <Group grow>
                    <NumberInput
                      onChange={(value) => setRateLimitMax(value as number)}
                      label="Max Requests"
                      min={1}
                      required
                      value={rateLimitMax}
                    />
                    <NumberInput
                      onChange={(value) => setRateLimitTimeWindow(value as number)}
                      label="Time Window (ms)"
                      min={1}
                      required
                      value={rateLimitTimeWindow}
                    />
                  </Group>
                )}
              </Stack>
            </>
          )}
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button onClick={handleClose} variant="subtle">
            Cancel
          </Button>
          <Button loading={loading} onClick={handleUpdate} disabled={!name.trim()}>
            Update API Key
          </Button>
        </Group>
      </Modal>
    </>
  );
}
