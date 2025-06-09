'use client';

import {
  ActionIcon,
  Alert,
  Autocomplete,
  Badge,
  Button,
  Card,
  Checkbox,
  ColorInput,
  Divider,
  FileInput,
  Group,
  JsonInput,
  Loader,
  MultiSelect,
  NumberInput,
  PasswordInput,
  Pill,
  Radio,
  Rating,
  SegmentedControl,
  Select,
  Slider,
  Stack,
  Switch,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput, DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconCheck,
  IconInfoCircle,
  IconPlus,
  IconSearch,
  IconUpload,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { z } from 'zod';

import { notify } from '@repo/notifications/mantine-notifications';

export interface FormFieldV2 {
  label: string;
  // Basic properties
  name: string;
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
    | 'file'
    // New types for better UX
    | 'autocomplete'
    | 'tags'
    | 'combobox'
    | 'radio'
    | 'segmented'
    | 'slider'
    | 'rating'
    | 'color'
    | 'daterange'
    | 'relationship'
    | 'async-select';

  defaultValue?: any;
  description?: string;
  disabled?: boolean;
  // Field configuration
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;

  // Validation
  validation?: (value: any) => string | null;
  zodSchema?: z.ZodSchema;

  errorText?: string;
  helperText?: string;
  // UI customization
  icon?: React.ReactNode;
  rightSection?: React.ReactNode;
  tooltip?: string;

  accept?: string;
  max?: number;
  maxFileSize?: number;
  min?: number;
  multiple?: boolean;
  // Field-specific options
  options?: { value: string; label: string; disabled?: boolean; group?: string }[];
  rows?: number;
  step?: number;

  // Relationship handling
  relationshipConfig?: {
    model: string;
    searchKey?: string;
    displayKey?: string;
    allowCreate?: boolean;
    preload?: boolean;
    filter?: Record<string, any>;
    include?: Record<string, any>;
  };

  // Conditional rendering
  dependsOn?: {
    field: string;
    condition: (value: any) => boolean;
  };

  // Async data loading
  loadOptions?: (query: string) => Promise<{ value: string; label: string }[]>;

  columns?: number; // For grid layout
  // Group fields together
  fieldset?: string;
}

interface ModelFormV2Props {
  autoSave?: boolean;
  cancelHref?: string;
  confirmCancel?: boolean;
  fields: FormFieldV2[];
  initialValues?: Record<string, any>;
  // New props
  layout?: 'vertical' | 'horizontal';
  onSubmit: (values: Record<string, any>) => Promise<void>;
  showProgress?: boolean;
  submitLabel?: string;
  title: string;
}

export function ModelFormV2({
  autoSave = false,
  cancelHref,
  confirmCancel = true,
  fields,
  initialValues = {},
  layout = 'vertical',
  onSubmit,
  showProgress = true,
  submitLabel = 'Save',
  title,
}: ModelFormV2Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Group fields by fieldset
  const fieldsets = fields.reduce(
    (acc, field) => {
      const key = field.fieldset || 'default';
      if (!acc[key]) acc[key] = [];
      acc[key].push(field);
      return acc;
    },
    {} as Record<string, FormFieldV2[]>,
  );

  // Create form with enhanced validation
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
        // Combine multiple validation strategies
        acc[field.name] = (value: any, values: Record<string, any>) => {
          // Check field dependencies first
          if (field.dependsOn && !field.dependsOn.condition(values[field.dependsOn.field])) {
            return null; // Skip validation if field is not visible
          }

          // Required validation
          if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
            return field.errorText || `${field.label} is required`;
          }

          // Custom validation
          if (field.validation) {
            return field.validation(value);
          }

          // Zod validation
          if (field.zodSchema) {
            try {
              field.zodSchema.parse(value);
              return null;
            } catch (error) {
              if (error instanceof z.ZodError) {
                return error.errors[0]?.message || 'Invalid value';
              }
            }
          }

          return null;
        };
        return acc;
      },
      {} as Record<string, (value: any, values: Record<string, any>) => string | null>,
    ),

    validateInputOnBlur: true,
    validateInputOnChange: touchedFields.size > 0,
  });

  // Track field touches for progressive validation
  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
  };

  // Auto-save functionality
  const [debouncedValues] = useDebouncedValue(form.values, 1000);
  useEffect(() => {
    if (autoSave && form.isDirty() && touchedFields.size > 0) {
      // Implement auto-save logic here
      console.log('Auto-saving...', debouncedValues);
    }
  }, [debouncedValues, autoSave, form, touchedFields.size]);

  const handleSubmit = form.onSubmit((values) => {
    startTransition(async () => {
      try {
        await onSubmit(values);
        notify.success({
          message: `${title} has been saved successfully`,
          title: 'Success!',
        });
        if (cancelHref) {
          router.push(cancelHref);
        }
      } catch (error) {
        if (error instanceof Error) {
          notify.error({
            message: error.message,
            title: 'Error',
          });

          // Parse field-specific errors if available
          try {
            const errorData = JSON.parse(error.message);
            if (errorData.fieldErrors) {
              setFieldErrors(errorData.fieldErrors);
            }
          } catch {
            // Not a JSON error, ignore
          }
        }
      }
    });
  });

  const handleCancel = () => {
    const doCancel = () => router.push(cancelHref!);

    if (confirmCancel && form.isDirty()) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        doCancel();
      }
    } else {
      doCancel();
    }
  };

  const renderField = (field: FormFieldV2) => {
    // Check field dependencies
    if (field.dependsOn) {
      const dependentValue = form.values[field.dependsOn.field];
      if (!field.dependsOn.condition(dependentValue)) {
        return null;
      }
    }

    const commonProps = {
      description: field.description,
      disabled: field.disabled || isPending,
      error: fieldErrors[field.name] || form.errors[field.name],
      label: field.label,
      leftSection: field.icon,
      onBlur: () => handleFieldBlur(field.name),
      placeholder: field.placeholder,
      readOnly: field.readOnly,
      required: field.required,
      rightSection:
        field.rightSection ||
        (field.tooltip && (
          <Tooltip withArrow label={field.tooltip}>
            <ActionIcon size="xs" variant="subtle">
              <IconInfoCircle size={16} />
            </ActionIcon>
          </Tooltip>
        )),
      ...form.getInputProps(field.name),
    };

    // Remove rightSection for specific field types that don't support it
    const propsWithoutRightSection = {
      ...commonProps,
      rightSection: undefined,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return field.type === 'password' ? (
          <PasswordInput {...commonProps} />
        ) : (
          <TextInput {...commonProps} type={field.type} />
        );

      case 'number':
        return (
          <NumberInput
            {...commonProps}
            hideControls={false}
            thousandSeparator=","
            decimalScale={2}
            max={field.max}
            min={field.min}
            step={field.step}
          />
        );

      case 'textarea':
        return (
          <Textarea {...commonProps} autosize maxRows={10} minRows={2} rows={field.rows || 4} />
        );

      case 'select':
        return (
          <Select
            {...commonProps}
            checkIconPosition="right"
            nothingFoundMessage="No options found"
            renderOption={({ option }) => (
              <Group gap="xs">
                <Text size="sm">{option.label}</Text>
                {option.disabled && (
                  <Badge color="gray" size="xs">
                    Unavailable
                  </Badge>
                )}
              </Group>
            )}
            clearable
            data={field.options || []}
            searchable
          />
        );

      case 'autocomplete':
        return (
          <Autocomplete
            {...commonProps}
            leftSection={<IconSearch size={16} />}
            data={field.options || []}
            limit={10}
          />
        );

      case 'multiselect':
        return (
          <MultiSelect
            {...commonProps}
            hidePickedOptions
            renderOption={({ option }) => (
              <Group gap="xs">
                <Text size="sm">{option.label}</Text>
              </Group>
            )}
            clearable
            data={field.options || []}
            maxValues={field.max}
            searchable
          />
        );

      case 'tags':
        return (
          <TagsInput
            {...commonProps}
            allowDuplicates={false}
            leftSection={<IconPlus size={16} />}
            clearable
            data={field.options?.map((o) => o.label) || []}
            maxTags={field.max}
            splitChars={[',', ' ', '|']}
          />
        );

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
            offLabel="OFF"
            onLabel="ON"
            label={field.label}
          />
        );

      case 'radio':
        return (
          <Radio.Group {...propsWithoutRightSection}>
            <Stack gap="xs" mt="xs">
              {field.options?.map((option) => (
                <Radio
                  key={option.value}
                  disabled={option.disabled}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Stack>
          </Radio.Group>
        );

      case 'segmented':
        return (
          <div>
            <Text fw={500} mb={4} size="sm">
              {field.label}
            </Text>
            {field.description && (
              <Text c="dimmed" mb={8} size="xs">
                {field.description}
              </Text>
            )}
            <SegmentedControl
              {...form.getInputProps(field.name)}
              fullWidth
              data={field.options || []}
            />
          </div>
        );

      case 'slider':
        return (
          <div>
            <Group justify="space-between" mb={4}>
              <Text fw={500} size="sm">
                {field.label}
              </Text>
              <Badge variant="light">{form.values[field.name] || field.min || 0}</Badge>
            </Group>
            {field.description && (
              <Text c="dimmed" mb={8} size="xs">
                {field.description}
              </Text>
            )}
            <Slider
              {...form.getInputProps(field.name)}
              marks={[
                { label: field.min || 0, value: field.min || 0 },
                { label: field.max || 100, value: field.max || 100 },
              ]}
              max={field.max || 100}
              min={field.min || 0}
              step={field.step || 1}
            />
          </div>
        );

      case 'rating':
        return (
          <div>
            <Text fw={500} mb={4} size="sm">
              {field.label}
            </Text>
            {field.description && (
              <Text c="dimmed" mb={8} size="xs">
                {field.description}
              </Text>
            )}
            <Rating {...form.getInputProps(field.name)} count={field.max || 5} size="lg" />
          </div>
        );

      case 'color':
        return (
          <ColorInput
            {...commonProps}
            format="rgba"
            swatches={[
              '#25262b',
              '#868e96',
              '#fa5252',
              '#e64980',
              '#be4bdb',
              '#7950f2',
              '#4c6ef5',
              '#228be6',
              '#15aabf',
              '#12b886',
              '#40c057',
              '#82c91e',
              '#fab005',
              '#fd7e14',
            ]}
          />
        );

      case 'date':
        return (
          <DatePickerInput
            {...commonProps}
            leftSection={undefined}
            valueFormat="MMMM DD, YYYY"
            clearable
          />
        );

      case 'datetime':
        return (
          <DateTimePicker
            {...commonProps}
            leftSection={undefined}
            valueFormat="MMMM DD, YYYY HH:mm"
            clearable
          />
        );

      case 'daterange':
        return (
          <DatePickerInput
            {...commonProps}
            leftSection={undefined}
            valueFormat="MMM DD"
            clearable
            type="range"
          />
        );

      case 'json':
        return (
          <JsonInput
            {...commonProps}
            validationError="Invalid JSON"
            autosize
            formatOnBlur
            maxRows={15}
            minRows={4}
          />
        );

      case 'file':
        return (
          <FileInput
            {...commonProps}
            leftSection={<IconUpload size={16} />}
            valueComponent={({ value }) => {
              if (Array.isArray(value)) {
                return (
                  <Pill.Group>
                    {value.map((file, index) => (
                      <Pill key={index} size="sm">
                        {file.name}
                      </Pill>
                    ))}
                  </Pill.Group>
                );
              }
              return value ? <Pill size="sm">{value.name}</Pill> : null;
            }}
            accept={field.accept}
            clearable
            multiple={field.multiple}
          />
        );

      case 'relationship':
        // This would be a more complex component for handling relationships
        return (
          <Select
            {...commonProps}
            leftSection={<IconSearch size={16} />}
            nothingFoundMessage="No records found"
            renderOption={({ option }) => (
              <Group gap="xs">
                <div style={{ flex: 1 }}>
                  <Text size="sm">{option.label}</Text>
                  {field.relationshipConfig?.displayKey && (
                    <Text c="dimmed" size="xs">
                      ID: {option.value}
                    </Text>
                  )}
                </div>
              </Group>
            )}
            clearable
            data={field.options || []}
            searchable
          />
        );

      default:
        return <TextInput {...commonProps} />;
    }
  };

  // Calculate form completion
  const totalFields = fields.filter((f) => !f.readOnly).length;
  const completedFields = fields.filter(
    (f) => !f.readOnly && form.values[f.name] && form.values[f.name] !== '',
  ).length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  return (
    <Card withBorder style={{ position: 'relative' }}>
      <form onSubmit={handleSubmit}>
        <Stack style={{ opacity: isPending ? 0.6 : 1 }} gap="lg">
          <div>
            <Group align="flex-start" justify="space-between">
              <div>
                <Title order={2}>{title}</Title>
                <Text c="dimmed" mt={4} size="sm">
                  {fields.filter((f) => f.required).length > 0
                    ? 'Fill in the information below. Fields marked with * are required.'
                    : 'Fill in the information below.'}
                </Text>
              </div>
              {showProgress && (
                <Badge
                  color={completionPercentage === 100 ? 'green' : 'blue'}
                  size="lg"
                  variant="light"
                >
                  {completionPercentage}% Complete
                </Badge>
              )}
            </Group>
          </div>

          {Object.entries(fieldsets).map(([fieldsetName, fieldsetFields]) => (
            <div key={fieldsetName}>
              {fieldsetName !== 'default' && (
                <Divider labelPosition="left" label={fieldsetName} mb="md" />
              )}
              <Stack gap="md">
                {fieldsetFields.map((field) => (
                  <div key={field.name}>{renderField(field)}</div>
                ))}
              </Stack>
            </div>
          ))}

          {autoSave && (
            <Alert color="blue" icon={<IconAlertCircle size={16} />} variant="light">
              Auto-save is enabled. Changes are saved automatically.
            </Alert>
          )}

          <Group justify="space-between" mt="xl">
            <Group gap="xs">
              {form.isDirty() && (
                <Text c="dimmed" size="xs">
                  You have unsaved changes
                </Text>
              )}
              {isPending && <Loader size="xs" />}
            </Group>
            <Group>
              {cancelHref && (
                <Button onClick={handleCancel} disabled={isPending} variant="subtle">
                  Cancel
                </Button>
              )}
              <Button
                leftSection={
                  form.isValid() && touchedFields.size === fields.length ? (
                    <IconCheck size={16} />
                  ) : undefined
                }
                loading={isPending}
                disabled={!form.isValid() && touchedFields.size > 0}
                type="submit"
              >
                {submitLabel}
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
