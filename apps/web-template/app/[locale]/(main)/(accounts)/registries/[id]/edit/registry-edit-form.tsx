'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput, Textarea, Select, Switch, Button, Group, Stack } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import { updateRegistry } from '@/actions/registries';

const editFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['WISHLIST', 'GIFT', 'WEDDING', 'BABY', 'BIRTHDAY', 'HOLIDAY', 'OTHER']),
  isPublic: z.boolean(),
  eventDate: z.date().nullable(),
});

interface RegistryEditFormProps {
  registry: any;
  locale: string;
}

export default function RegistryEditForm({ registry, locale }: RegistryEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    validate: zodResolver(editFormSchema),
    initialValues: {
      title: registry.title,
      description: registry.description || '',
      type: registry.type,
      isPublic: registry.isPublic,
      eventDate: registry.eventDate ? new Date(registry.eventDate) : null,
    },
  });

  const handleSubmit = async (values: z.infer<typeof editFormSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await updateRegistry(registry.id, {
        title: values.title,
        description: values.description || undefined,
        type: values.type,
        isPublic: values.isPublic,
        eventDate: values.eventDate || undefined,
      });

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Registry updated successfully',
          color: 'green',
        });
        router.push(`/${locale}/registries/${registry.id}`);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to update registry',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An error occurred',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Title"
          placeholder="My Wedding Registry"
          required
          {...form.getInputProps('title')}
        />

        <Textarea
          label="Description"
          placeholder="Add a description for your registry..."
          rows={3}
          {...form.getInputProps('description')}
        />

        <Select
          label="Registry Type"
          data={[
            { value: 'WISHLIST', label: 'Wishlist' },
            { value: 'GIFT', label: 'Gift Registry' },
            { value: 'WEDDING', label: 'Wedding' },
            { value: 'BABY', label: 'Baby Shower' },
            { value: 'BIRTHDAY', label: 'Birthday' },
            { value: 'HOLIDAY', label: 'Holiday' },
            { value: 'OTHER', label: 'Other' },
          ]}
          {...form.getInputProps('type')}
        />

        <DatePickerInput
          label="Event Date (optional)"
          placeholder="Select event date"
          clearable
          {...form.getInputProps('eventDate')}
        />

        <Switch
          label="Make this registry public"
          description="Anyone with the link will be able to view this registry"
          {...form.getInputProps('isPublic', { type: 'checkbox' })}
        />

        <Group justify="flex-end" mt="xl">
          <Button
            variant="subtle"
            onClick={() => router.push(`/${locale}/registries/${registry.id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
