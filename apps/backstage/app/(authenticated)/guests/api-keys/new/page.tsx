'use client';

import {
  Button,
  Group,
  Stack,
  TextInput,
  Select,
  MultiSelect,
  Checkbox,
  Alert,
  Container,
  Card,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { IconInfoCircle, IconArrowLeft } from '@tabler/icons-react';

export default function NewApiKeyPage() {
  const router = useRouter();
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    expiresAt: null as Date | null,
    permissions: [] as string[],
    enabled: true,
    organizationId: '',
    userId: '',
  });
  const [loading, setLoading] = useState(false);

  const availablePermissions = [
    { value: 'read', label: 'Read Access' },
    { value: 'write', label: 'Write Access' },
    { value: 'admin', label: 'Admin Access' },
    { value: 'users:read', label: 'Read Users' },
    { value: 'users:write', label: 'Manage Users' },
    { value: 'organizations:read', label: 'Read Organizations' },
    { value: 'organizations:write', label: 'Manage Organizations' },
    { value: 'api-keys:read', label: 'Read API Keys' },
    { value: 'api-keys:write', label: 'Manage API Keys' },
  ];

  const handleCreateApiKey = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newApiKey,
          expiresAt: newApiKey.expiresAt?.toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        notifications.show({
          title: 'Success',
          message: 'API key created successfully',
          color: 'green',
        });
        router.push('/guests?tab=api-keys' as any);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
            Back to API Keys
          </Button>
        </Group>

        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Stack gap="md">
            <h2>Create New API Key</h2>
            
            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
              The API key will be generated securely and shown only once after creation.
            </Alert>

            <TextInput
              label="API Key Name"
              placeholder="Enter a descriptive name"
              value={newApiKey.name}
              onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
              required
            />

            <DateInput
              label="Expiration Date"
              placeholder="Select expiration date (optional)"
              value={newApiKey.expiresAt}
              onChange={(date) => setNewApiKey(prev => ({ ...prev, expiresAt: date }))}
              minDate={new Date()}
              clearable
            />

            <MultiSelect
              label="Permissions"
              placeholder="Select permissions"
              data={availablePermissions}
              value={newApiKey.permissions}
              onChange={(permissions) => setNewApiKey(prev => ({ ...prev, permissions }))}
              searchable
              clearable
            />

            <Select
              label="Scope"
              placeholder="Select scope (optional)"
              data={[
                { value: '', label: 'Global (all resources)' },
                { value: 'user', label: 'User-specific' },
                { value: 'organization', label: 'Organization-specific' },
              ]}
              value={newApiKey.userId ? 'user' : newApiKey.organizationId ? 'organization' : ''}
              onChange={(value) => {
                if (value === 'user') {
                  setNewApiKey(prev => ({ ...prev, organizationId: '', userId: 'current' }));
                } else if (value === 'organization') {
                  setNewApiKey(prev => ({ ...prev, userId: '', organizationId: 'current' }));
                } else {
                  setNewApiKey(prev => ({ ...prev, userId: '', organizationId: '' }));
                }
              }}
            />

            <Checkbox
              label="Enable API key immediately"
              checked={newApiKey.enabled}
              onChange={(e) => setNewApiKey(prev => ({ ...prev, enabled: e.currentTarget.checked }))}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => router.push('/guests?tab=api-keys' as any)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateApiKey}
                disabled={!newApiKey.name}
                loading={loading}
              >
                Create API Key
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}