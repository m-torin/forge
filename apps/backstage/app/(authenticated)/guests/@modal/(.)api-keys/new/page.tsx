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
import {
  IconExclamationTriangle,
  IconCopy,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import { ModalWrapper } from '../../modal-wrapper';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export default function NewApiKeyModal() {
  const router = useRouter();
  const clipboard = useClipboard({ timeout: 2000 });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [keyModalOpened, { open: openKeyModal, close: closeKeyModal }] = useDisclosure(false);
  const [createdKey, setCreatedKey] = useState<string>('');
  const [showKey, setShowKey] = useState(false);
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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
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
        openKeyModal();
        // Trigger a refresh of the API keys data
        window.dispatchEvent(new CustomEvent('refreshApiKeys'));
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
    router.back();
  };

  return (
    <>
      <ModalWrapper title="Create New API Key">
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
            <Button variant="light" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateApiKey}
              disabled={!newKey.name.trim()}
              loading={loading}
            >
              Create API Key
            </Button>
          </Group>
        </Stack>
      </ModalWrapper>

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
            icon={<IconExclamationTriangle size={16} />}
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
            <Button onClick={handleKeyModalClose}>
              I've Saved My Key
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}