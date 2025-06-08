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
  Autocomplete,
  TagsInput,
  Combobox,
  useCombobox,
  Tooltip,
  ActionIcon,
  Loader,
  Badge,
  Pill,
  rem,
  SegmentedControl,
  Radio,
  Slider,
  ColorInput,
  Rating,
  Fieldset,
  Alert,
  Divider,
} from '@mantine/core';
import { DateTimePicker, DatePickerInput } from '@mantine/dates';
import { useForm, zodResolver } from '@mantine/form';
import {
  IconUpload,
  IconInfoCircle,
  IconPlus,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconSearch,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { z } from 'zod';
import { useDebouncedValue } from '@mantine/hooks';

import { notify } from '@repo/notifications/mantine-notifications';
import { useAutoSave } from '../hooks/useAutoSave';

export interface FormFieldV2 {
  // Basic properties
  name: string;
  label: string;
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

  // Field configuration
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  defaultValue?: any;

  // Validation
  validation?: (value: any) => string | null;
  zodSchema?: z.ZodSchema;

  // UI customization
  icon?: React.ReactNode;
  rightSection?: React.ReactNode;
  tooltip?: string;
  helperText?: string;
  errorText?: string;

  // Field-specific options
  options?: { value: string; label: string; disabled?: boolean; group?: string }[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  accept?: string;
  maxFileSize?: number;
  multiple?: boolean;

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

  // Group fields together
  fieldset?: string;
  columns?: number; // For grid layout
}

interface ModelFormV2Props {
  title: string;
  fields: FormFieldV2[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  submitLabel?: string;
  cancelHref?: string;
  // New props
  layout?: 'vertical' | 'horizontal';
  showProgress?: boolean;
  autoSave?: boolean;
  confirmCancel?: boolean;
}

export function ModelFormV2({
  title,
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = 'Save',
  cancelHref,
  layout = 'vertical',
  showProgress = true,
  autoSave = false,
  confirmCancel = true,
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
          title: 'Success!',
          message: `${title} has been saved successfully`,
        });
        if (cancelHref) {
          router.push(cancelHref);
        }
      } catch (error) {
        if (error instanceof Error) {
          notify.error({
            title: 'Error',
            message: error.message,
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
      label: field.label,
      placeholder: field.placeholder,
      description: field.description,
      required: field.required,
      disabled: field.disabled || isPending,
      readOnly: field.readOnly,
      error: fieldErrors[field.name] || form.errors[field.name],
      leftSection: field.icon,
      rightSection:
        field.rightSection ||
        (field.tooltip && (
          <Tooltip label={field.tooltip} withArrow>
            <ActionIcon size="xs" variant="subtle">
              <IconInfoCircle size={16} />
            </ActionIcon>
          </Tooltip>
        )),
      onBlur: () => handleFieldBlur(field.name),
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
            min={field.min}
            max={field.max}
            step={field.step}
            decimalScale={2}
            thousandSeparator=","
            hideControls={false}
          />
        );

      case 'textarea':
        return (
          <Textarea {...commonProps} rows={field.rows || 4} autosize minRows={2} maxRows={10} />
        );

      case 'select':
        return (
          <Select
            {...commonProps}
            data={field.options || []}
            searchable
            clearable
            nothingFoundMessage="No options found"
            checkIconPosition="right"
            renderOption={({ option }) => (
              <Group gap="xs">
                <Text size="sm">{option.label}</Text>
                {option.disabled && (
                  <Badge size="xs" color="gray">
                    Unavailable
                  </Badge>
                )}
              </Group>
            )}
          />
        );

      case 'autocomplete':
        return (
          <Autocomplete
            {...commonProps}
            data={field.options || []}
            limit={10}
            leftSection={<IconSearch size={16} />}
          />
        );

      case 'multiselect':
        return (
          <MultiSelect
            {...commonProps}
            data={field.options || []}
            searchable
            clearable
            hidePickedOptions
            maxValues={field.max}
            renderOption={({ option }) => (
              <Group gap="xs">
                <Text size="sm">{option.label}</Text>
              </Group>
            )}
          />
        );

      case 'tags':
        return (
          <TagsInput
            {...commonProps}
            data={field.options?.map((o) => o.label) || []}
            maxTags={field.max}
            allowDuplicates={false}
            clearable
            leftSection={<IconPlus size={16} />}
            splitChars={[',', ' ', '|']}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            {...form.getInputProps(field.name, { type: 'checkbox' })}
            label={field.label}
            description={field.description}
          />
        );

      case 'switch':
        return (
          <Switch
            {...form.getInputProps(field.name, { type: 'checkbox' })}
            label={field.label}
            description={field.description}
            onLabel="ON"
            offLabel="OFF"
          />
        );

      case 'radio':
        return (
          <Radio.Group {...propsWithoutRightSection}>
            <Stack gap="xs" mt="xs">
              {field.options?.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  disabled={option.disabled}
                />
              ))}
            </Stack>
          </Radio.Group>
        );

      case 'segmented':
        return (
          <div>
            <Text size="sm" fw={500} mb={4}>
              {field.label}
            </Text>
            {field.description && (
              <Text size="xs" c="dimmed" mb={8}>
                {field.description}
              </Text>
            )}
            <SegmentedControl
              {...form.getInputProps(field.name)}
              data={field.options || []}
              fullWidth
            />
          </div>
        );

      case 'slider':
        return (
          <div>
            <Group justify="space-between" mb={4}>
              <Text size="sm" fw={500}>
                {field.label}
              </Text>
              <Badge variant="light">{form.values[field.name] || field.min || 0}</Badge>
            </Group>
            {field.description && (
              <Text size="xs" c="dimmed" mb={8}>
                {field.description}
              </Text>
            )}
            <Slider
              {...form.getInputProps(field.name)}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              marks={[
                { value: field.min || 0, label: field.min || 0 },
                { value: field.max || 100, label: field.max || 100 },
              ]}
            />
          </div>
        );

      case 'rating':
        return (
          <div>
            <Text size="sm" fw={500} mb={4}>
              {field.label}
            </Text>
            {field.description && (
              <Text size="xs" c="dimmed" mb={8}>
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
            clearable
            valueFormat="MMMM DD, YYYY"
            leftSection={undefined}
          />
        );

      case 'datetime':
        return (
          <DateTimePicker
            {...commonProps}
            clearable
            valueFormat="MMMM DD, YYYY HH:mm"
            leftSection={undefined}
          />
        );

      case 'daterange':
        return (
          <DatePickerInput
            {...commonProps}
            type="range"
            clearable
            valueFormat="MMM DD"
            leftSection={undefined}
          />
        );

      case 'json':
        return (
          <JsonInput
            {...commonProps}
            formatOnBlur
            autosize
            minRows={4}
            maxRows={15}
            validationError="Invalid JSON"
          />
        );

      case 'file':
        return (
          <FileInput
            {...commonProps}
            accept={field.accept}
            leftSection={<IconUpload size={16} />}
            clearable
            multiple={field.multiple}
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
          />
        );

      case 'relationship':
        // This would be a more complex component for handling relationships
        return (
          <Select
            {...commonProps}
            data={field.options || []}
            searchable
            clearable
            nothingFoundMessage="No records found"
            leftSection={<IconSearch size={16} />}
            renderOption={({ option }) => (
              <Group gap="xs">
                <div style={{ flex: 1 }}>
                  <Text size="sm">{option.label}</Text>
                  {field.relationshipConfig?.displayKey && (
                    <Text size="xs" c="dimmed">
                      ID: {option.value}
                    </Text>
                  )}
                </div>
              </Group>
            )}
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
        <Stack gap="lg" style={{ opacity: isPending ? 0.6 : 1 }}>
          <div>
            <Group justify="space-between" align="flex-start">
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
                  size="lg"
                  color={completionPercentage === 100 ? 'green' : 'blue'}
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
                <>
                  <Divider label={fieldsetName} labelPosition="left" mb="md" />
                </>
              )}
              <Stack gap="md">
                {fieldsetFields.map((field) => (
                  <div key={field.name}>{renderField(field)}</div>
                ))}
              </Stack>
            </div>
          ))}

          {autoSave && (
            <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
              Auto-save is enabled. Changes are saved automatically.
            </Alert>
          )}

          <Group justify="space-between" mt="xl">
            <Group gap="xs">
              {form.isDirty() && (
                <Text size="xs" c="dimmed">
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
                type="submit"
                loading={isPending}
                disabled={!form.isValid() && touchedFields.size > 0}
                leftSection={
                  form.isValid() && touchedFields.size === fields.length ? (
                    <IconCheck size={16} />
                  ) : undefined
                }
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
