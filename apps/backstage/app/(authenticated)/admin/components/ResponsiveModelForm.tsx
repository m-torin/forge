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
  Tooltip,
  ActionIcon,
  Loader,
  Badge,
  Pill,
  SegmentedControl,
  Radio,
  Slider,
  ColorInput,
  Rating,
  Fieldset,
  Alert,
  Divider,
  Container,
  Grid,
  Collapse,
  Paper,
  Progress,
  Box,
  Drawer,
  ScrollArea,
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
  IconDeviceFloppy,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { z } from 'zod';
import { useMediaQuery, useDisclosure } from '@mantine/hooks';

import { notify } from '@repo/notifications/mantine-notifications';
import { useAutoSave } from '../hooks/useAutoSave';
import type { FormFieldV2 } from './ModelFormV2';

interface ResponsiveModelFormProps {
  title: string;
  fields: FormFieldV2[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  submitLabel?: string;
  cancelHref?: string;
  // Layout options
  layout?: 'vertical' | 'horizontal' | 'floating';
  showProgress?: boolean;
  autoSave?: boolean;
  confirmCancel?: boolean;
  // Mobile options
  mobileLayout?: 'stacked' | 'accordion' | 'steps';
  collapsibleSections?: boolean;
  floatingActionButton?: boolean;
}

export function ResponsiveModelForm({
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
  mobileLayout = 'stacked',
  collapsibleSections = true,
  floatingActionButton = true,
}: ResponsiveModelFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['default']));
  const [currentStep, setCurrentStep] = useState(0);
  const [actionsDrawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  // Responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

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

  const fieldsetKeys = Object.keys(fieldsets);

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
        acc[field.name] = (value: any, values: Record<string, any>) => {
          if (field.dependsOn && !field.dependsOn.condition(values[field.dependsOn.field])) {
            return null;
          }

          if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
            return field.errorText || `${field.label} is required`;
          }

          if (field.validation) {
            return field.validation(value);
          }

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

  // Auto-save integration
  const {
    status: autoSaveStatus,
    lastSaved,
    handleBlur: autoSaveBlur,
    triggerSave,
    isSaving,
  } = useAutoSave(
    form.values,
    form.isDirty(),
    form.isValid(),
    async (values) => {
      await onSubmit(values);
    },
    {
      enabled: autoSave,
      delay: 2000,
      showNotifications: isMobile ? false : true, // Reduce notifications on mobile
      showSaveIndicator: true,
    },
  );

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
    autoSaveBlur();
  };

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

          try {
            const errorData = JSON.parse(error.message);
            if (errorData.fieldErrors) {
              setFieldErrors(errorData.fieldErrors);
            }
          } catch {
            // Not a JSON error
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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const renderField = (field: FormFieldV2) => {
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
      // Responsive sizing
      size: isMobile ? 'sm' : 'md',
    };

    // Mobile-optimized field rendering
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
            hideControls={isMobile} // Hide controls on mobile for space
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={field.rows || (isMobile ? 3 : 4)}
            autosize
            minRows={isMobile ? 2 : 3}
            maxRows={isMobile ? 6 : 10}
          />
        );

      case 'select':
        return (
          <Select
            {...commonProps}
            data={field.options || []}
            searchable={!isMobile} // Disable search on mobile for simplicity
            clearable
            nothingFoundMessage="No options found"
            checkIconPosition="right"
            withinPortal={isMobile} // Use portal on mobile to avoid overflow issues
          />
        );

      case 'multiselect':
        return (
          <MultiSelect
            {...commonProps}
            data={field.options || []}
            searchable={!isMobile}
            clearable
            hidePickedOptions
            maxValues={field.max}
            maxDropdownHeight={isMobile ? 200 : 300}
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
            splitChars={[',', ' ', '|']}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            {...form.getInputProps(field.name, { type: 'checkbox' })}
            label={field.label}
            description={field.description}
            size={isMobile ? 'sm' : 'md'}
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
            size={isMobile ? 'sm' : 'md'}
          />
        );

      case 'date':
        return (
          <DatePickerInput
            {...commonProps}
            clearable
            valueFormat="MMMM DD, YYYY"
            leftSection={undefined}
            popoverProps={{ withinPortal: isMobile }}
          />
        );

      case 'datetime':
        return (
          <DateTimePicker
            {...commonProps}
            clearable
            valueFormat="MMMM DD, YYYY HH:mm"
            leftSection={undefined}
            popoverProps={{ withinPortal: isMobile }}
          />
        );

      case 'json':
        return (
          <JsonInput
            {...commonProps}
            formatOnBlur
            autosize
            minRows={isMobile ? 3 : 4}
            maxRows={isMobile ? 10 : 15}
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

  // Render mobile accordion layout
  const renderAccordionLayout = () => (
    <Stack gap="md">
      {Object.entries(fieldsets).map(([fieldsetName, fieldsetFields], index) => (
        <Paper key={fieldsetName} withBorder>
          <Box
            p="md"
            style={{ cursor: collapsibleSections ? 'pointer' : undefined }}
            onClick={() => collapsibleSections && toggleSection(fieldsetName)}
          >
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text fw={600} size="sm">
                  {fieldsetName === 'default' ? 'General Information' : fieldsetName}
                </Text>
                <Text size="xs" c="dimmed">
                  {fieldsetFields.filter((f) => form.values[f.name]).length} of{' '}
                  {fieldsetFields.length} fields completed
                </Text>
              </div>
              {collapsibleSections && (
                <ActionIcon variant="subtle" size="sm">
                  {expandedSections.has(fieldsetName) ? (
                    <IconChevronUp size={16} />
                  ) : (
                    <IconChevronDown size={16} />
                  )}
                </ActionIcon>
              )}
            </Group>
          </Box>

          <Collapse in={expandedSections.has(fieldsetName)}>
            <Divider />
            <Stack gap="md" p="md">
              {fieldsetFields.map((field) => (
                <div key={field.name}>{renderField(field)}</div>
              ))}
            </Stack>
          </Collapse>
        </Paper>
      ))}
    </Stack>
  );

  // Render mobile steps layout
  const renderStepsLayout = () => {
    const currentFieldset = fieldsetKeys[currentStep];
    const currentFields = fieldsets[currentFieldset];

    return (
      <Stack gap="md">
        <Paper withBorder p="xs">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Step {currentStep + 1} of {fieldsetKeys.length}
            </Text>
            <Text size="xs" c="dimmed">
              {currentFieldset === 'default' ? 'General' : currentFieldset}
            </Text>
          </Group>
          <Progress value={((currentStep + 1) / fieldsetKeys.length) * 100} mt="xs" size="xs" />
        </Paper>

        <Stack gap="md">
          {currentFields.map((field) => (
            <div key={field.name}>{renderField(field)}</div>
          ))}
        </Stack>

        <Group justify="space-between" mt="md">
          <Button
            variant="subtle"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            size="sm"
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStep(Math.min(fieldsetKeys.length - 1, currentStep + 1))}
            disabled={currentStep === fieldsetKeys.length - 1}
            size="sm"
          >
            Next
          </Button>
        </Group>
      </Stack>
    );
  };

  // Render desktop layout
  const renderDesktopLayout = () => (
    <Stack gap="lg">
      {Object.entries(fieldsets).map(([fieldsetName, fieldsetFields]) => (
        <div key={fieldsetName}>
          {fieldsetName !== 'default' && (
            <Divider label={fieldsetName} labelPosition="left" mb="md" />
          )}
          <Grid gutter="md">
            {fieldsetFields.map((field) => (
              <Grid.Col
                key={field.name}
                span={{ base: 12, sm: field.columns === 2 ? 6 : 12, md: field.columns || 12 }}
              >
                {renderField(field)}
              </Grid.Col>
            ))}
          </Grid>
        </div>
      ))}
    </Stack>
  );

  // Floating action button for mobile
  const renderFloatingActions = () => (
    <>
      {isMobile && floatingActionButton && (
        <Box
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 100,
          }}
        >
          <ActionIcon size="xl" radius="xl" variant="filled" onClick={openDrawer}>
            <IconDeviceFloppy size={24} />
          </ActionIcon>
        </Box>
      )}

      <Drawer
        opened={actionsDrawerOpened}
        onClose={closeDrawer}
        title="Form Actions"
        position="bottom"
        size="auto"
      >
        <Stack gap="md" p="md">
          {autoSave && (
            <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
              <Group justify="space-between">
                <Text size="sm">Auto-save is {isSaving ? 'saving...' : 'enabled'}</Text>
                {lastSaved && (
                  <Text size="xs" c="dimmed">
                    Last saved: {new Date(lastSaved).toLocaleTimeString()}
                  </Text>
                )}
              </Group>
            </Alert>
          )}

          <Group grow>
            {cancelHref && (
              <Button onClick={handleCancel} disabled={isPending} variant="subtle" size="sm">
                Cancel
              </Button>
            )}
            <Button
              onClick={() => handleSubmit()}
              loading={isPending}
              disabled={!form.isValid() && touchedFields.size > 0}
              leftSection={
                form.isValid() && touchedFields.size === fields.length ? (
                  <IconCheck size={16} />
                ) : undefined
              }
              size="sm"
            >
              {submitLabel}
            </Button>
          </Group>
        </Stack>
      </Drawer>
    </>
  );

  return (
    <Container size={isDesktop ? 'md' : '100%'} px={isMobile ? 'xs' : 'md'}>
      <Card withBorder p={{ base: 'xs', sm: 'md', lg: 'lg' }}>
        <form onSubmit={handleSubmit}>
          <Stack gap={{ base: 'md', sm: 'lg' }} style={{ opacity: isPending ? 0.6 : 1 }}>
            {/* Header */}
            <Box>
              <Group justify="space-between" align="flex-start" mb="md">
                <div style={{ flex: 1 }}>
                  <Title order={isMobile ? 3 : 2} size={isMobile ? 'h4' : 'h2'}>
                    {title}
                  </Title>
                  <Text c="dimmed" mt={4} size={isMobile ? 'xs' : 'sm'}>
                    {fields.filter((f) => f.required).length > 0
                      ? 'Fill in the information below. Fields marked with * are required.'
                      : 'Fill in the information below.'}
                  </Text>
                </div>
                {showProgress && !isMobile && (
                  <Badge
                    size="lg"
                    color={completionPercentage === 100 ? 'green' : 'blue'}
                    variant="light"
                  >
                    {completionPercentage}% Complete
                  </Badge>
                )}
              </Group>

              {showProgress && isMobile && (
                <Progress
                  value={completionPercentage}
                  color={completionPercentage === 100 ? 'green' : 'blue'}
                  size="sm"
                  mb="md"
                />
              )}
            </Box>

            {/* Form fields */}
            {isMobile && mobileLayout === 'accordion'
              ? renderAccordionLayout()
              : isMobile && mobileLayout === 'steps'
                ? renderStepsLayout()
                : renderDesktopLayout()}

            {/* Desktop actions */}
            {!isMobile && (
              <Group justify="space-between" mt="xl">
                <Group gap="xs">
                  {form.isDirty() && (
                    <Text size="xs" c="dimmed">
                      You have unsaved changes
                    </Text>
                  )}
                  {(isPending || isSaving) && <Loader size="xs" />}
                  {autoSave && lastSaved && (
                    <Text size="xs" c="dimmed">
                      Last saved: {new Date(lastSaved).toLocaleTimeString()}
                    </Text>
                  )}
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
            )}
          </Stack>
        </form>
      </Card>

      {/* Mobile floating actions */}
      {renderFloatingActions()}
    </Container>
  );
}
