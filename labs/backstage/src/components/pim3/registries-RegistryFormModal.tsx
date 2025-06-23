'use client';

import {
  Button,
  Checkbox,
  Group,
  Modal,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm, zodResolver } from '@mantine/form';
import { IconSettings, IconUsers } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { showErrorNotification, showSuccessNotification } from '@/utils/pim3/pim-helpers';
import { createRegistry, registryFormSchema, updateRegistry } from '@/actions/pim3/actions';
import { RegistryType } from '@repo/database/prisma';

import { RegistryUserAssignments } from './registries-RegistryUserAssignments';

import type { RegistryWithRelations } from '@/actions/pim3/actions';

interface RegistryFormModalProps {
  onClose: () => void;
  onSubmit?: () => void;
  opened: boolean;
  registry?: RegistryWithRelations | null;
}

const REGISTRY_TYPE_OPTIONS = [
  { label: 'Wishlist', value: 'WISHLIST' },
  { label: 'Gift Registry', value: 'GIFT' },
  { label: 'Wedding Registry', value: 'WEDDING' },
  { label: 'Baby Registry', value: 'BABY' },
  { label: 'Birthday Registry', value: 'BIRTHDAY' },
  { label: 'Holiday Registry', value: 'HOLIDAY' },
  { label: 'Other', value: 'OTHER' },
];

/**
 * RegistryFormModal component for creating and editing registries
 */
export function RegistryFormModal({ onClose, onSubmit, opened, registry }: RegistryFormModalProps) {
  const isEditing = !!registry;
  const [activeTab, setActiveTab] = useState<string | null>('details');
  const [refreshKey, setRefreshKey] = useState(0);

  const form = useForm({
    validate: zodResolver(registryFormSchema),
    initialValues: {
      type: RegistryType.WISHLIST,
      description: '',
      eventDate: null as Date | null,
      isPublic: false,
      title: '',
    },
  });

  useEffect(() => {
    if (registry) {
      form.setValues({
        type: 'WISHLIST',
        description: registry.description || '',
        eventDate: registry.eventDate ? new Date(registry.eventDate) : null,
        isPublic: registry.isPublic,
        title: registry.title,
      });
    } else {
      form.reset();
    }
    // Reset to details tab when modal opens
    setActiveTab('details');
  }, [registry, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const formData = {
        ...values,
        eventDate: values.eventDate || undefined,
      };

      const result = isEditing
        ? await updateRegistry(registry.id, formData)
        : await createRegistry(formData);

      if (result.success) {
        showSuccessNotification(`Registry ${isEditing ? 'updated' : 'created'} successfully`);
        onSubmit?.();
        if (!isEditing) {
          // For new registries, close the modal since we can't manage users yet
          onClose();
          form.reset();
        } else {
          // For edited registries, refresh the user assignments
          setRefreshKey((prev) => prev + 1);
        }
      } else {
        showErrorNotification(
          result.error || `Failed to ${isEditing ? 'update' : 'create'} registry`,
        );
      }
    } catch (error) {
      showErrorNotification(`Failed to ${isEditing ? 'update' : 'create'} registry`);
    }
  };

  const handleUserAssignmentRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    onSubmit?.(); // Refresh the parent component as well
  };

  return (
    <Modal
      onClose={onClose}
      opened={opened}
      size="xl"
      title={
        <Text fw={600} size="lg">
          {isEditing ? 'Edit Registry' : 'Create New Registry'}
        </Text>
      }
    >
      <Tabs onChange={setActiveTab} value={activeTab}>
        <Tabs.List>
          <Tabs.Tab leftSection={<IconSettings size={16} />} value="details">
            Registry Details
          </Tabs.Tab>
          {isEditing && (
            <Tabs.Tab leftSection={<IconUsers size={16} />} value="users">
              User Access ({registry?.users?.length || 0})
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel pt="md" value="details">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                placeholder="Enter registry title"
                label="Title"
                required
                {...form.getInputProps('title')}
                data-testid="registry-title-input"
              />

              <Textarea
                placeholder="Enter registry description (optional)"
                rows={3}
                label="Description"
                {...form.getInputProps('description')}
                data-testid="registry-description-input"
              />

              <Select
                placeholder="Select registry type"
                data={REGISTRY_TYPE_OPTIONS}
                label="Registry Type"
                required
                {...form.getInputProps('type')}
                data-testid="registry-type-select"
              />

              <DateInput
                placeholder="Select event date (optional)"
                clearable
                label="Event Date"
                {...form.getInputProps('eventDate')}
                data-testid="registry-event-date-input"
              />

              <Checkbox
                description="Public registries can be viewed by anyone with the link"
                label="Make this registry public"
                {...form.getInputProps('isPublic', { type: 'checkbox' })}
                data-testid="registry-public-checkbox"
              />

              <Group justify="flex-end" mt="xl">
                <Button onClick={onClose} variant="subtle">
                  Cancel
                </Button>
                <Button
                  data-testid="registry-submit-button"
                  loading={form.submitting}
                  type="submit"
                >
                  {isEditing ? 'Update Registry' : 'Create Registry'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>

        {isEditing && registry && (
          <Tabs.Panel pt="md" value="users">
            <RegistryUserAssignments
              key={refreshKey}
              onRefresh={handleUserAssignmentRefresh}
              editable={true}
              registryId={registry.id}
              users={registry.users || []}
            />

            <Group justify="flex-end" mt="xl">
              <Button onClick={onClose} variant="subtle">
                Close
              </Button>
            </Group>
          </Tabs.Panel>
        )}
      </Tabs>
    </Modal>
  );
}
