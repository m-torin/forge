'use client';

import { Button, Group, Stack, TextInput, Textarea, Progress, Alert } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconAlertTriangle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { z } from 'zod';

import { createOrganizationAction, updateOrganizationAction } from '@/actions/pim3/actions';
import type { Organization } from '@/types/pim3';

// Validation schema
const organizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .refine(
      (val) => !val.startsWith('-') && !val.endsWith('-'),
      'Slug cannot start or end with hyphen',
    ),
  description: z.string().max(500, 'Description too long').optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationFormProps {
  organization?: Organization;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Utility functions
const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function OrganizationForm({ organization, onSuccess, onCancel }: OrganizationFormProps) {
  const router = useRouter();
  const isEdit = !!organization;
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const form = useForm<OrganizationFormData>({
    validate: zodResolver(organizationSchema),
    initialValues: {
      name: organization?.name || '',
      slug: organization?.slug || '',
      description: organization?.metadata?.description || organization?.description || '',
    },
    transformValues: (values) => ({
      ...values,
      slug: values.slug || generateSlug(values.name),
    }),
  });

  // Auto-generate slug from name (only for new organizations)
  useEffect(() => {
    if (!isEdit && form.values.name && !form.isTouched('slug')) {
      form.setFieldValue('slug', generateSlug(form.values.name));
    }
  }, [form.values.name, isEdit]);

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 80 ? prev + 20 : prev));
      }, 100);

      const result = isEdit
        ? await updateOrganizationAction(organization!.id, {
            name: values.name,
            slug: values.slug,
            metadata: values.description ? { description: values.description } : undefined,
          })
        : await createOrganizationAction({
            name: values.name,
            slug: values.slug,
            metadata: values.description ? { description: values.description } : undefined,
          });

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Organization ${isEdit ? 'updated' : 'created'} successfully`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });

        // Small delay for progress completion animation
        setTimeout(() => {
          onSuccess ? onSuccess() : router.push('/guests/organizations');
        }, 500);
      } else {
        throw new Error(result.error || `Failed to ${isEdit ? 'update' : 'create'} organization`);
      }
    } catch (error) {
      setProgress(0);
      console.error(`Failed to ${isEdit ? 'update' : 'create'} organization:`, error);

      notifications.show({
        title: 'Error',
        message:
          error instanceof Error
            ? error.message
            : `Failed to ${isEdit ? 'update' : 'create'} organization`,
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });

      // Add form-level error for persistent display
      form.setErrors({ name: 'Please try again or contact support if the problem persists' });
    } finally {
      setSubmitting(false);
    }
  });

  const handleCancel = () => {
    if (form.isDirty()) {
      // Show confirmation for unsaved changes
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel ? onCancel() : router.back();
      }
    } else {
      onCancel ? onCancel() : router.back();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {submitting && <Progress value={progress} size="sm" animated color="blue" />}

        {form.errors.name && !submitting && (
          <Alert color="red" icon={<IconAlertTriangle size={16} />}>
            {form.errors.name}
          </Alert>
        )}

        <TextInput
          label="Organization Name"
          placeholder="Enter organization name"
          withAsterisk
          {...form.getInputProps('name')}
          disabled={submitting}
        />

        <TextInput
          label="Slug"
          placeholder="organization-slug"
          description="URL-friendly identifier for the organization"
          withAsterisk
          {...form.getInputProps('slug')}
          disabled={submitting}
        />

        <Textarea
          label="Description"
          placeholder="Enter organization description (optional)"
          rows={3}
          maxRows={5}
          autosize
          {...form.getInputProps('description')}
          disabled={submitting}
        />

        <Group justify="flex-end" mt="xl">
          <Button variant="light" onClick={handleCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={!form.isValid()}>
            {isEdit ? 'Update' : 'Create'} Organization
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
