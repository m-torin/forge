'use client';

import { createRegistry } from '@/actions/registries';
import { useRouter } from 'next/navigation';
import { useForm, zodResolver } from '@mantine/form';
import { Button, TextInput, Textarea, Select, Switch, Group } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import { useState } from 'react';

const registrySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['WISHLIST', 'GIFT', 'WEDDING', 'BABY', 'BIRTHDAY', 'HOLIDAY', 'OTHER']),
  eventDate: z.date().optional(),
  isPublic: z.boolean(),
});

type RegistryFormData = z.infer<typeof registrySchema>;

const registryTypes = [
  { value: 'WISHLIST', label: 'Wishlist' },
  { value: 'GIFT', label: 'Gift Registry' },
  { value: 'WEDDING', label: 'Wedding Registry' },
  { value: 'BABY', label: 'Baby Registry' },
  { value: 'BIRTHDAY', label: 'Birthday' },
  { value: 'HOLIDAY', label: 'Holiday' },
  { value: 'OTHER', label: 'Other' },
];

export function RegistryForm({ locale }: { locale: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegistryFormData>({
    validate: zodResolver(registrySchema),
    initialValues: {
      title: '',
      description: '',
      type: 'WISHLIST',
      eventDate: undefined,
      isPublic: false,
    },
  });

  const handleSubmit = async (values: RegistryFormData) => {
    setIsSubmitting(true);

    try {
      const result = await createRegistry(values);

      if (result.success && result.data) {
        notifications.show({
          title: 'Success',
          message: 'Registry created successfully',
          color: 'green',
        });
        router.push(`/${locale}/registries/${result.data.id}`);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to create registry',
          color: 'red',
        });
      }
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-6">
      <TextInput
        label="Registry Name"
        placeholder="My Wedding Registry"
        required
        {...form.getInputProps('title')}
      />

      <Select label="Registry Type" data={registryTypes} required {...form.getInputProps('type')} />

      <Textarea
        label="Description"
        placeholder="Tell your guests about this registry..."
        rows={4}
        {...form.getInputProps('description')}
      />

      <DateInput
        label="Event Date"
        placeholder="Select date"
        clearable
        {...form.getInputProps('eventDate')}
      />

      <Switch
        label="Make this registry public"
        description="Public registries can be found by anyone with the link"
        {...form.getInputProps('isPublic', { type: 'checkbox' })}
      />

      <Group justify="flex-end" mt="xl">
        <Button variant="subtle" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Create Registry
        </Button>
      </Group>
    </form>
  );
}
