'use client';

import {
  Button,
  Group,
  Stack,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Alert,
  Code,
  ActionIcon,
  Tooltip,
  Modal,
  Text,
  Progress,
  Stepper,
  Badge,
  Card,
  Divider,
  DateInput,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconKey,
  IconSettings,
  IconShield,
  IconCalendar,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import { z } from 'zod';

import { usePimForm } from '@/hooks/pim3/usePimForm';
import { useFormDataLoading } from '@/hooks/pim3/useFormLoading';
import { useFormErrors } from '@/hooks/pim3/useFormErrors';
import { createApiKeyAction, updateApiKeyAction, getOrganizationsAction } from '@/actions/guests';
import type { ApiKey, Organization } from '@/types/guests';
import { ApiKeyType } from '@repo/database/prisma';

// Validation schema with conditional validation
const apiKeySchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
    organizationId: z.string().optional(),
    permissions: z.array(z.string()).min(1, 'At least one permission is required'),
    expiresAt: z.date().min(new Date(), 'Expiration date must be in the future').nullable(),
    type: z.nativeEnum(ApiKeyType).default(ApiKeyType.USER),
    description: z.string().max(500, 'Description too long').optional(),
  })
  .refine(
    (data) => {
      // Service keys must have an organization
      if (data.type === 'service' && !data.organizationId) {
        return false;
      }
      return true;
    },
    {
      message: 'Service keys must be associated with an organization',
      path: ['organizationId'],
    },
  )
  .refine(
    (data) => {
      // Admin permissions require justification in description
      if (
        data.permissions.includes('admin') &&
        (!data.description || data.description.length < 10)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Admin permissions require detailed description (min 10 characters)',
      path: ['description'],
    },
  );

type ApiKeyFormData = z.infer<typeof apiKeySchema>;

interface ApiKeyFormProps {
  apiKey?: ApiKey;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Constants
const AVAILABLE_PERMISSIONS = [
  { value: 'read', label: 'Read', description: 'View data and resources', color: 'blue' },
  { value: 'write', label: 'Write', description: 'Create and modify data', color: 'green' },
  { value: 'admin', label: 'Admin', description: 'Administrative access', color: 'red' },
  { value: 'delete', label: 'Delete', description: 'Remove data and resources', color: 'orange' },
  { value: 'manage_users', label: 'Manage Users', description: 'User management', color: 'violet' },
  {
    value: 'manage_organizations',
    label: 'Manage Organizations',
    description: 'Organization management',
    color: 'indigo',
  },
  {
    value: 'manage_api_keys',
    label: 'Manage API Keys',
    description: 'API key management',
    color: 'cyan',
  },
];

const KEY_TYPES = [
  { value: 'user', label: 'User Key', description: 'For individual user access' },
  { value: 'service', label: 'Service Key', description: 'For service-to-service communication' },
];

export function ApiKeyForm({ apiKey, onSuccess, onCancel }: ApiKeyFormProps) {
  const router = useRouter();
  const clipboard = useClipboard({ timeout: 2000 });
  const [keyModalOpened, { open: openKeyModal, close: closeKeyModal }] = useDisclosure(false);
  const [createdKey, setCreatedKey] = useState<string>('');
  const [showKey, setShowKey] = useState(false);

  const isEditing = !!apiKey;

  // Form data loading
  const { isDataLoading, withDataLoading } = useFormDataLoading();

  // Form with conditional validation
  const form = usePimForm({
    schema: apiKeySchema,
    initialValues: {
      name: '',
      organizationId: '',
      permissions: [],
      expiresAt: null,
      type: 'user' as const,
      description: '',
    },
    // Conditional validation based on form state
    transformOnSubmit: async (values) => {
      return {
        ...values,
        organizationId: values.organizationId || null,
        expiresAt: values.expiresAt || null,
        metadata: {
          type: values.type,
          description: values.description || undefined,
        },
      };
    },
    dirtyTracking: true,
    onSuccess: () => {
      if (!isEditing && createdKey) {
        openKeyModal();
      } else {
        onSuccess?.();
      }
    },
  });

  // Error handling
  const errorHandler = useFormErrors(form);

  // Form data
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  // Load organizations data
  useEffect(() => {
    const loadOrganizations = withDataLoading('options', async () => {
      const result = await getOrganizationsAction();
      if (result?.success && result.data) {
        setOrganizations(result.data);
      }
    });

    loadOrganizations().catch(errorHandler.handleServerError);
  }, [withDataLoading, errorHandler]);

  // Load existing API key data
  useEffect(() => {
    if (isEditing && apiKey) {
      form.setValues({
        name: apiKey.name,
        organizationId: apiKey.organizationId || '',
        permissions: apiKey.permissions || ['read'],
        expiresAt: apiKey.expiresAt ? new Date(apiKey.expiresAt) : null,
        type: (apiKey.metadata?.type as 'user' | 'service') || 'user',
        description: apiKey.metadata?.description || '',
      });
      form.markAsSaved();
    }
  }, [isEditing, apiKey, form]);

  // Submit handler
  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const result = isEditing
        ? await updateApiKeyAction(apiKey!.id, {
            name: values.name,
            permissions: values.permissions,
            expiresAt: values.expiresAt?.toISOString(),
            metadata: {
              type: values.type,
              description: values.description,
            },
          })
        : await createApiKeyAction({
            name: values.name,
            organizationId: values.organizationId || undefined,
            permissions: values.permissions,
            expiresAt: values.expiresAt?.toISOString(),
            metadata: {
              type: values.type,
              description: values.description,
            },
          });

      if (!result.success) {
        throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} API key`);
      }

      if (isEditing) {
        errorHandler.showSuccess('API key updated successfully');
      } else {
        setCreatedKey(result.data?.key || result.data?.apiKey || '');
        setActiveStep(3);
        errorHandler.showSuccess('API key created successfully');
      }
    } catch (error) {
      errorHandler.handleServerError(error);
      throw error;
    }
  });

  const copyApiKey = () => {
    clipboard.copy(createdKey);
    errorHandler.showSuccess('API key copied to clipboard');
  };

  const handleKeyModalClose = () => {
    closeKeyModal();
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/guests/api-keys');
    }
  };

  const handleCancel = () => {
    if (form.warnUnsavedChanges()) {
      onCancel ? onCancel() : router.back();
    }
  };

  return (
    <>
      {!isEditing && (
        <Stepper active={activeStep} onStepClick={setActiveStep} mb="xl">
          <Stepper.Step label="Basic Info" icon={<IconKey size={18} />} />
          <Stepper.Step label="Permissions" icon={<IconShield size={18} />} />
          <Stepper.Step label="Configuration" icon={<IconSettings size={18} />} />
          <Stepper.Step label="Review" icon={<IconCheck size={18} />} />
        </Stepper>
      )}

      {form.isDirty && (
        <Alert color="orange" mb="md">
          You have unsaved changes.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {form.isSubmitting && <Progress value={75} size="sm" animated color="blue" />}

          {/* Basic Information */}
          <Card withBorder p="lg">
            <Stack gap="md">
              <Text fw={600} size="lg">
                Basic Information
              </Text>

              <TextInput
                label="Key Name"
                placeholder="Enter a descriptive name for this API key"
                withAsterisk
                leftSection={<IconKey size={16} />}
                {...form.getInputProps('name')}
                disabled={form.isSubmitting}
              />

              <Select
                label="Key Type"
                withAsterisk
                {...form.getInputProps('type')}
                data={KEY_TYPES.map((type) => ({
                  ...type,
                  label: `${type.label} - ${type.description}`,
                }))}
                disabled={form.isSubmitting}
              />

              {/* Conditional validation: Service keys need organization */}
              {form.values.type === 'service' && (
                <Select
                  label="Organization"
                  placeholder="Select organization to scope this key"
                  leftSection={<IconSettings size={16} />}
                  {...form.getInputProps('organizationId')}
                  data={organizations.map((org) => ({ value: org.id, label: org.name }))}
                  disabled={form.isSubmitting}
                  withAsterisk
                  description="Service keys must be associated with an organization"
                />
              )}

              {!isEditing && form.values.type === 'user' && (
                <Select
                  label="Organization (Optional)"
                  placeholder="Select organization to scope this key"
                  leftSection={<IconSettings size={16} />}
                  {...form.getInputProps('organizationId')}
                  data={organizations.map((org) => ({ value: org.id, label: org.name }))}
                  clearable
                  disabled={form.isSubmitting}
                />
              )}
            </Stack>
          </Card>

          {/* Permissions */}
          <Card withBorder p="lg">
            <Stack gap="md">
              <Text fw={600} size="lg">
                Permissions
              </Text>
              <Text size="sm" c="dimmed">
                Select the permissions this API key should have. Choose carefully as these define
                what actions can be performed.
              </Text>

              <MultiSelect
                label="Permissions"
                placeholder="Select permissions"
                data={AVAILABLE_PERMISSIONS.map((permission) => ({
                  value: permission.value,
                  label: `${permission.label} - ${permission.description}`,
                }))}
                {...form.getInputProps('permissions')}
                disabled={form.isSubmitting}
                withAsterisk
              />

              {/* Conditional validation warning for admin permissions */}
              {form.values.permissions.includes('admin') && (
                <Alert color="red" icon={<IconAlertTriangle size={16} />}>
                  Admin permissions require detailed justification in the description field.
                </Alert>
              )}
            </Stack>
          </Card>

          {/* Configuration */}
          <Card withBorder p="lg">
            <Stack gap="md">
              <Text fw={600} size="lg">
                Configuration
              </Text>

              <DateInput
                label="Expiration Date (Optional)"
                placeholder="Select expiration date"
                leftSection={<IconCalendar size={16} />}
                description="Leave empty for a key that never expires"
                minDate={new Date()}
                {...form.getInputProps('expiresAt')}
                disabled={form.isSubmitting}
                clearable
              />

              <Textarea
                label="Description"
                placeholder="Add a description for this API key..."
                rows={3}
                maxRows={5}
                autosize
                {...form.getInputProps('description')}
                disabled={form.isSubmitting}
                withAsterisk={form.values.permissions.includes('admin')}
                description={
                  form.values.permissions.includes('admin')
                    ? 'Required for admin permissions - explain why admin access is needed'
                    : 'Optional description for this API key'
                }
              />
            </Stack>
          </Card>

          <Divider />

          <Group justify="flex-end">
            <Button variant="light" onClick={handleCancel} disabled={form.isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={form.isSubmitting}
              disabled={!form.isValid()}
              leftSection={<IconKey size={16} />}
            >
              {isEditing ? 'Update' : 'Create'} API Key
            </Button>
          </Group>
        </Stack>
      </form>

      {/* Enhanced API Key Success Modal */}
      <Modal
        opened={keyModalOpened}
        onClose={handleKeyModalClose}
        title="🎉 API Key Created Successfully"
        closeOnClickOutside={false}
        closeOnEscape={false}
        size="lg"
      >
        <Stack gap="lg">
          <Alert
            icon={<IconAlertTriangle size={16} />}
            title="⚠️ Critical: Save Your API Key Now"
            color="orange"
            variant="filled"
          >
            This is the <strong>only time</strong> you'll see this API key. Copy it immediately and
            store it securely. You won't be able to view it again after closing this dialog.
          </Alert>

          <Card withBorder p="lg" bg="gray.0">
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600} size="lg">
                  Your New API Key
                </Text>
                <Badge color="green" variant="filled">
                  Active
                </Badge>
              </Group>

              <Group gap="xs" align="stretch">
                <Code
                  style={{
                    flex: 1,
                    fontSize: '11px',
                    fontFamily: 'Monaco, Consolas, monospace',
                    padding: '12px',
                    wordBreak: 'break-all',
                    filter: showKey ? 'none' : 'blur(4px)',
                    transition: 'filter 0.2s ease',
                    border: '1px solid var(--mantine-color-gray-3)',
                  }}
                >
                  {createdKey}
                </Code>
                <Group gap="xs">
                  <Tooltip label={showKey ? 'Hide key' : 'Show key'}>
                    <ActionIcon variant="light" size="lg" onClick={() => setShowKey(!showKey)}>
                      {showKey ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label={clipboard.copied ? 'Copied!' : 'Copy to clipboard'}>
                    <ActionIcon
                      variant="light"
                      size="lg"
                      color={clipboard.copied ? 'green' : 'blue'}
                      onClick={copyApiKey}
                    >
                      <IconCopy size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>

              {clipboard.copied && (
                <Alert color="green" variant="light">
                  ✅ API key copied to clipboard!
                </Alert>
              )}
            </Stack>
          </Card>

          <Divider />

          <Stack gap="xs">
            <Text fw={600} size="sm">
              Next Steps:
            </Text>
            <Text size="sm" c="dimmed">
              • Store this key in your environment variables or secure configuration
            </Text>
            <Text size="sm" c="dimmed">
              • Use this key in your API requests via the Authorization header
            </Text>
            <Text size="sm" c="dimmed">
              • Monitor key usage in the API Keys dashboard
            </Text>
          </Stack>

          <Group justify="space-between" mt="xl">
            <Button variant="light" onClick={() => router.push('/guests/api-keys')}>
              View All Keys
            </Button>
            <Button
              onClick={handleKeyModalClose}
              disabled={!clipboard.copied}
              color={clipboard.copied ? 'green' : 'blue'}
            >
              {clipboard.copied ? "✅ I've Saved My Key" : '⚠️ Copy Key First'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
