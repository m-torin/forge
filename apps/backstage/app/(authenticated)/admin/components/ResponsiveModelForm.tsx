'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Collapse,
  Container,
  Divider,
  Drawer,
  FileInput,
  Grid,
  Group,
  JsonInput,
  Loader,
  MultiSelect,
  NumberInput,
  Paper,
  PasswordInput,
  Progress,
  Select,
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
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconDeviceFloppy,
  IconInfoCircle,
  IconUpload,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { z } from 'zod';

import { notify } from '@repo/notifications/mantine-notifications';

import { useAutoSave } from '../hooks/useAutoSave';

import type { FormFieldV2 } from './ModelFormV2';

interface ResponsiveModelFormProps {
  autoSave?: boolean;
  cancelHref?: string;
  collapsibleSections?: boolean;
  confirmCancel?: boolean;
  fields: FormFieldV2[];
  floatingActionButton?: boolean;
  initialValues?: Record<string, any>;
  // Layout options
  layout?: 'vertical' | 'horizontal' | 'floating';
  // Mobile options
  mobileLayout?: 'stacked' | 'accordion' | 'steps';
  onSubmit: (values: Record<string, any>) => Promise<void>;
  showProgress?: boolean;
  submitLabel?: string;
  title: string;
}

export function ResponsiveModelForm({
  autoSave = false,
  cancelHref,
  collapsibleSections = true,
  confirmCancel = true,
  fields,
  floatingActionButton = true,
  initialValues = {},
  layout = 'vertical',
  mobileLayout = 'stacked',
  onSubmit,
  showProgress = true,
  submitLabel = 'Save',
  title,
}: ResponsiveModelFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['default']));
  const [currentStep, setCurrentStep] = useState(0);
  const [actionsDrawerOpened, { close: closeDrawer, open: openDrawer }] = useDisclosure(false);

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
    handleBlur: autoSaveBlur,
    isSaving,
    lastSaved,
    status: autoSaveStatus,
    triggerSave,
  } = useAutoSave(
    form.values,
    form.isDirty(),
    form.isValid(),
    async (values) => {
      await onSubmit(values);
    },
    {
      delay: 2000,
      enabled: autoSave,
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
            hideControls={isMobile} // Hide controls on mobile for space
            thousandSeparator=","
            decimalScale={2}
            max={field.max}
            min={field.min}
            step={field.step}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            autosize
            maxRows={isMobile ? 6 : 10}
            minRows={isMobile ? 2 : 3}
            rows={field.rows || (isMobile ? 3 : 4)}
          />
        );

      case 'select':
        return (
          <Select
            {...commonProps}
            checkIconPosition="right"
            nothingFoundMessage="No options found"
            withinPortal={isMobile} // Use portal on mobile to avoid overflow issues
            clearable
            data={field.options || []}
            searchable={!isMobile} // Disable search on mobile for simplicity
          />
        );

      case 'multiselect':
        return (
          <MultiSelect
            {...commonProps}
            hidePickedOptions
            maxDropdownHeight={isMobile ? 200 : 300}
            clearable
            data={field.options || []}
            maxValues={field.max}
            searchable={!isMobile}
          />
        );

      case 'tags':
        return (
          <TagsInput
            {...commonProps}
            allowDuplicates={false}
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
            size={isMobile ? 'sm' : 'md'}
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
            size={isMobile ? 'sm' : 'md'}
          />
        );

      case 'date':
        return (
          <DatePickerInput
            {...commonProps}
            leftSection={undefined}
            popoverProps={{ withinPortal: isMobile }}
            valueFormat="MMMM DD, YYYY"
            clearable
          />
        );

      case 'datetime':
        return (
          <DateTimePicker
            {...commonProps}
            leftSection={undefined}
            popoverProps={{ withinPortal: isMobile }}
            valueFormat="MMMM DD, YYYY HH:mm"
            clearable
          />
        );

      case 'json':
        return (
          <JsonInput
            {...commonProps}
            validationError="Invalid JSON"
            autosize
            formatOnBlur
            maxRows={isMobile ? 10 : 15}
            minRows={isMobile ? 3 : 4}
          />
        );

      case 'file':
        return (
          <FileInput
            {...commonProps}
            leftSection={<IconUpload size={16} />}
            accept={field.accept}
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
            onClick={() => collapsibleSections && toggleSection(fieldsetName)}
            style={{ cursor: collapsibleSections ? 'pointer' : undefined }}
            p="md"
          >
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text fw={600} size="sm">
                  {fieldsetName === 'default' ? 'General Information' : fieldsetName}
                </Text>
                <Text c="dimmed" size="xs">
                  {fieldsetFields.filter((f) => form.values[f.name]).length} of{' '}
                  {fieldsetFields.length} fields completed
                </Text>
              </div>
              {collapsibleSections && (
                <ActionIcon size="sm" variant="subtle">
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
            <Text fw={600} size="sm">
              Step {currentStep + 1} of {fieldsetKeys.length}
            </Text>
            <Text c="dimmed" size="xs">
              {currentFieldset === 'default' ? 'General' : currentFieldset}
            </Text>
          </Group>
          <Progress mt="xs" size="xs" value={((currentStep + 1) / fieldsetKeys.length) * 100} />
        </Paper>

        <Stack gap="md">
          {currentFields.map((field) => (
            <div key={field.name}>{renderField(field)}</div>
          ))}
        </Stack>

        <Group justify="space-between" mt="md">
          <Button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            size="sm"
            variant="subtle"
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
            <Divider labelPosition="left" label={fieldsetName} mb="md" />
          )}
          <Grid gutter="md">
            {fieldsetFields.map((field) => (
              <Grid.Col
                key={field.name}
                span={{ base: 12, md: field.columns || 12, sm: field.columns === 2 ? 6 : 12 }}
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
            bottom: 16,
            position: 'fixed',
            right: 16,
            zIndex: 100,
          }}
        >
          <ActionIcon onClick={openDrawer} radius="xl" size="xl" variant="filled">
            <IconDeviceFloppy size={24} />
          </ActionIcon>
        </Box>
      )}

      <Drawer
        onClose={closeDrawer}
        opened={actionsDrawerOpened}
        position="bottom"
        size="auto"
        title="Form Actions"
      >
        <Stack gap="md" p="md">
          {autoSave && (
            <Alert color="blue" icon={<IconAlertCircle size={16} />} variant="light">
              <Group justify="space-between">
                <Text size="sm">Auto-save is {isSaving ? 'saving...' : 'enabled'}</Text>
                {lastSaved && (
                  <Text c="dimmed" size="xs">
                    Last saved: {new Date(lastSaved).toLocaleTimeString()}
                  </Text>
                )}
              </Group>
            </Alert>
          )}

          <Group grow>
            {cancelHref && (
              <Button onClick={handleCancel} disabled={isPending} size="sm" variant="subtle">
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
              onClick={() => handleSubmit()}
              disabled={!form.isValid() && touchedFields.size > 0}
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
    <Container px={isMobile ? 'xs' : 'md'} size={isDesktop ? 'md' : '100%'}>
      <Card withBorder p={{ base: 'xs', lg: 'lg', sm: 'md' }}>
        <form onSubmit={handleSubmit}>
          <Stack style={{ opacity: isPending ? 0.6 : 1 }} gap={{ base: 'md', sm: 'lg' }}>
            {/* Header */}
            <Box>
              <Group align="flex-start" justify="space-between" mb="md">
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
                    color={completionPercentage === 100 ? 'green' : 'blue'}
                    size="lg"
                    variant="light"
                  >
                    {completionPercentage}% Complete
                  </Badge>
                )}
              </Group>

              {showProgress && isMobile && (
                <Progress
                  color={completionPercentage === 100 ? 'green' : 'blue'}
                  mb="md"
                  size="sm"
                  value={completionPercentage}
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
                    <Text c="dimmed" size="xs">
                      You have unsaved changes
                    </Text>
                  )}
                  {(isPending || isSaving) && <Loader size="xs" />}
                  {autoSave && lastSaved && (
                    <Text c="dimmed" size="xs">
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
            )}
          </Stack>
        </form>
      </Card>

      {/* Mobile floating actions */}
      {renderFloatingActions()}
    </Container>
  );
}
