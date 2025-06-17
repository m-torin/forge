'use client';

import { Button, Group, Stack, TextInput, Textarea } from '@mantine/core';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

import { createOrganization, updateOrganization } from '@repo/auth/server/next';
import type { Organization } from '../../types';

interface OrganizationFormProps {
  organization?: Organization;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function OrganizationForm({ organization, onSuccess, onCancel }: OrganizationFormProps) {
  const router = useRouter();
  const isEdit = !!organization;

  const [formData, setFormData] = useState({
    name: organization?.name || '',
    slug: organization?.slug || '',
    description: organization?.metadata?.description || organization?.description || '',
  });
  const [loading, setLoading] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : prev.slug || generateSlug(name),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEdit) {
        const result = await updateOrganization({
          name: formData.name,
          slug: formData.slug,
        });

        if (result.success) {
          notifications.show({
            title: 'Success',
            message: 'Organization updated successfully',
            color: 'green',
          });
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/guests/organizations');
          }
        } else {
          notifications.show({
            title: 'Error',
            message: result.error || 'Failed to update organization',
            color: 'red',
          });
        }
      } else {
        const result = await createOrganization({
          name: formData.name,
          slug: formData.slug,
          metadata: formData.description ? { description: formData.description } : undefined,
        });

        if (result.success) {
          notifications.show({
            title: 'Success',
            message: 'Organization created successfully',
            color: 'green',
          });
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/guests/organizations');
          }
        } else {
          notifications.show({
            title: 'Error',
            message: result.error || 'Failed to create organization',
            color: 'red',
          });
        }
      }
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} organization:`, error);
      notifications.show({
        title: 'Error',
        message: `Failed to ${isEdit ? 'update' : 'create'} organization`,
        color: 'red',
      });
    } finally {
      setLoading(false);
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
    <Stack gap="md">
      <TextInput
        label="Organization Name"
        placeholder="Enter organization name"
        value={formData.name}
        onChange={(e) => handleNameChange(e.target.value)}
        required
      />
      <TextInput
        label="Slug"
        placeholder="organization-slug"
        value={formData.slug}
        onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
        description="URL-friendly identifier for the organization"
        required
      />
      <Textarea
        label="Description"
        placeholder="Enter organization description (optional)"
        value={formData.description}
        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        rows={3}
      />
      <Group justify="flex-end" mt="md">
        <Button variant="light" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!formData.name || !formData.slug}
          loading={loading}
        >
          {isEdit ? 'Update' : 'Create'} Organization
        </Button>
      </Group>
    </Stack>
  );
}
