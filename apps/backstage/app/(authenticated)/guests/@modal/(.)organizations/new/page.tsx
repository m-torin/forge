'use client';

import {
  Button,
  Group,
  Stack,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { ModalWrapper } from '../../modal-wrapper';

export default function NewOrganizationModal() {
  const router = useRouter();
  const [newOrg, setNewOrg] = useState({
    name: '',
    slug: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setNewOrg(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleCreateOrganization = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrg),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Organization created successfully',
          color: 'green',
        });
        router.back();
        // Trigger a refresh of the organizations data
        window.dispatchEvent(new CustomEvent('refreshOrganizations'));
      } else {
        const error = await response.json();
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to create organization',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create organization',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper title="Create New Organization">
      <Stack gap="md">
        <TextInput
          label="Organization Name"
          placeholder="Enter organization name"
          value={newOrg.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
        />
        <TextInput
          label="Slug"
          placeholder="organization-slug"
          value={newOrg.slug}
          onChange={(e) => setNewOrg(prev => ({ ...prev, slug: e.target.value }))}
          description="URL-friendly identifier for the organization"
          required
        />
        <Textarea
          label="Description"
          placeholder="Enter organization description (optional)"
          value={newOrg.description}
          onChange={(e) => setNewOrg(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateOrganization}
            disabled={!newOrg.name || !newOrg.slug}
            loading={loading}
          >
            Create Organization
          </Button>
        </Group>
      </Stack>
    </ModalWrapper>
  );
}