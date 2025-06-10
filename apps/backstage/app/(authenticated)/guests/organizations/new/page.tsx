'use client';

import {
  Button,
  Group,
  Stack,
  TextInput,
  Textarea,
  Container,
  Card,
} from '@mantine/core';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { IconArrowLeft } from '@tabler/icons-react';

export default function NewOrganizationPage() {
  const router = useRouter();
  const [newOrganization, setNewOrganization] = useState({
    name: '',
    slug: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleCreateOrganization = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrganization),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Organization created successfully',
          color: 'green',
        });
        router.push('/guests?tab=organizations' as any);
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

  const handleSlugChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setNewOrganization(prev => ({ ...prev, slug }));
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
            Back to Organizations
          </Button>
        </Group>

        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Stack gap="md">
            <h2>Create New Organization</h2>
            <TextInput
              label="Organization Name"
              placeholder="Enter organization name"
              value={newOrganization.name}
              onChange={(e) => {
                const name = e.target.value;
                const prevSlug = newOrganization.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                setNewOrganization(prev => ({ ...prev, name }));
                if (!newOrganization.slug || newOrganization.slug === prevSlug) {
                  handleSlugChange(name);
                }
              }}
              required
            />
            <TextInput
              label="Slug"
              placeholder="organization-slug"
              value={newOrganization.slug}
              onChange={(e) => setNewOrganization(prev => ({ ...prev, slug: e.target.value }))}
              description="Used in URLs and must be unique"
              required
            />
            <Textarea
              label="Description"
              placeholder="Enter organization description (optional)"
              value={newOrganization.description}
              onChange={(e) => setNewOrganization(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => router.push('/guests?tab=organizations' as any)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateOrganization}
                disabled={!newOrganization.name || !newOrganization.slug}
                loading={loading}
              >
                Create Organization
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}