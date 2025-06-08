'use client';

import {
  Button,
  Card,
  Checkbox,
  DateInput,
  FileInput,
  Group,
  JsonInput,
  MultiSelect,
  NumberInput,
  PasswordInput,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconUpload } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { notify } from '@repo/notifications/mantine-notifications';

export interface FormField {
  accept?: string;
  defaultValue?: any;
  description?: string;
  label: string;
  max?: number;
  min?: number;
  name: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  rows?: number;
  step?: number;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'textarea'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'switch'
    | 'date'
    | 'datetime'
    | 'json'
    | 'file';
  validation?: (value: any) => string | null;
}

interface ModelFormProps {
  cancelHref?: string;
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  submitLabel?: string;
  title: string;
}

export function ModelForm({
  cancelHref,
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = 'Save',
  title,
}: ModelFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Create form with initial values and validation
  const form = useForm({
    initialValues: fields.reduce(
      (acc, field) => {
        acc[field.name] = initialValues[field.name] ?? field.defaultValue ?? '';
        return acc;
      },
      {} as Record<string, any>,
    ),

    validate: fields.reduce(
      (acc, field) => {
        if (field.required) {
          acc[field.name] = (value: any) => {
            if (!value || (typeof value === 'string' && !value.trim())) {
              return `${field.label} is required`;
            }
            return null;
          };
        }
        if (field.validation) {
          acc[field.name] = field.validation;
        }
        return acc;
      },
      {} as Record<string, (value: any) => string | null>,
    ),
  });

  const handleSubmit = form.onSubmit((values) => {
    startTransition(async () => {
      try {
        await onSubmit(values);
        notify.success({
          title: 'Success!',
          message: `${title} has been saved successfully`,
        });
        if (cancelHref) {
          router.push(cancelHref);
        }
      } catch (error) {
        notify.error({
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to save. Please try again.',
        });
      }
    });
  });

  const renderField = (field: FormField) => {
    const commonProps = {
      description: field.description,
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      ...form.getInputProps(field.name),
    };

    switch (field.type) {
      case 'text':
      case 'email':
        return <TextInput {...commonProps} type={field.type} />;

      case 'password':
        return <PasswordInput {...commonProps} />;

      case 'number':
        return (
          <NumberInput
            {...commonProps}
            thousandSeparator=","
            decimalScale={2}
            max={field.max}
            min={field.min}
            step={field.step}
          />
        );

      case 'textarea':
        return <Textarea {...commonProps} autosize minRows={2} rows={field.rows || 4} />;

      case 'select':
        return <Select {...commonProps} clearable data={field.options || []} searchable />;

      case 'multiselect':
        return <MultiSelect {...commonProps} clearable data={field.options || []} searchable />;

      case 'checkbox':
        return (
          <Checkbox
            {...form.getInputProps(field.name, { type: 'checkbox' })}
            description={field.description}
            label={field.label}
          />
        );

      case 'switch':
        return (
          <Switch
            {...form.getInputProps(field.name, { type: 'checkbox' })}
            description={field.description}
            label={field.label}
          />
        );

      case 'date':
        return <DateInput {...commonProps} clearable />;

      case 'datetime':
        return <DateTimePicker {...commonProps} clearable />;

      case 'json':
        return <JsonInput {...commonProps} autosize formatOnBlur minRows={4} />;

      case 'file':
        return (
          <FileInput
            {...commonProps}
            leftSection={<IconUpload size={16} />}
            accept={field.accept}
            clearable
          />
        );

      default:
        return <TextInput {...commonProps} />;
    }
  };

  return (
    <Card withBorder style={{ position: 'relative' }}>
      <form onSubmit={handleSubmit}>
        <Stack gap="lg" style={{ opacity: isPending ? 0.6 : 1 }}>
          <div>
            <Title order={2}>{title}</Title>
            <Text c="dimmed" mt={4} size="sm">
              {fields.filter((f) => f.required).length > 0
                ? 'Fill in the information below. Fields marked with * are required.'
                : 'Fill in the information below.'}
            </Text>
          </div>

          <Stack gap="md">
            {fields.map((field) => (
              <div key={field.name}>{renderField(field)}</div>
            ))}
          </Stack>

          <Group justify="space-between" mt="xl">
            <Text size="xs" c="dimmed">
              {form.isDirty() ? 'You have unsaved changes' : ''}
            </Text>
            <Group>
              {cancelHref && (
                <Button
                  onClick={() => {
                    if (form.isDirty()) {
                      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                        router.push(cancelHref);
                      }
                    } else {
                      router.push(cancelHref);
                    }
                  }}
                  disabled={isPending}
                  variant="subtle"
                >
                  Cancel
                </Button>
              )}
              <Button loading={isPending} type="submit" disabled={!form.isValid()}>
                {submitLabel}
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
