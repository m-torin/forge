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
  Chip,
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
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import { z } from 'zod';

import { createApiKeyAction, updateApiKeyAction, getOrganizationsAction } from '@/actions/pim3/actions';
import type { ApiKey, Organization } from '@/types/pim3';

// Validation schema
const apiKeySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
  organizationId: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  expiresAt: z.date().min(new Date(), 'Expiration date must be in the future').nullable(),
  metadata: z.object({
    type: z.enum(['user', 'service']),
    description: z.string().max(500, 'Description too long').optional(),
  }),
});

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
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [keyModalOpened, { open: openKeyModal, close: closeKeyModal }] = useDisclosure(false);
  const [createdKey, setCreatedKey] = useState<string>('');
  const [showKey, setShowKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const isEdit = !!apiKey;

  const form = useForm<ApiKeyFormData>({
    validate: zodResolver(apiKeySchema),
    initialValues: {
      name: apiKey?.name || '',
      organizationId: apiKey?.organizationId || '',
      permissions: apiKey?.permissions || ['read'],
      expiresAt: apiKey?.expiresAt ? new Date(apiKey.expiresAt) : null,
      metadata: {
        type: (apiKey?.metadata?.type as 'user' | 'service') || 'user',
        description: apiKey?.metadata?.description || '',
      },
    },
  });

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const result = await getOrganizationsAction();
        if (result?.success && result.data) {
          setOrganizations(result.data);
        }
      } catch (error) {
        console.error('Failed to load organizations:', error);
      }
    };
    loadOrganizations();
  }, []);

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 80 ? prev + 20 : prev));
      }, 150);

      const result = isEdit
        ? await updateApiKeyAction(apiKey!.id, {
            name: values.name,
            permissions: values.permissions,
            expiresAt: values.expiresAt?.toISOString(),
            metadata: values.metadata,
          })
        : await createApiKeyAction({
            name: values.name,
            organizationId: values.organizationId || undefined,
            permissions: values.permissions,
            expiresAt: values.expiresAt?.toISOString(),
            metadata: values.metadata,
          });

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        if (isEdit) {
          notifications.show({
            title: 'Success',
            message: 'API key updated successfully',
            color: 'green',
            icon: <IconCheck size={16} />,
          });
          setTimeout(() => (onSuccess ? onSuccess() : router.push('/guests/api-keys')), 500);
        } else if (result.data) {
          setCreatedKey(result.data.key || result.data.apiKey || '');
          setActiveStep(3); // Move to success step
          openKeyModal();
        }
      } else {
        throw new Error(result.error || `Failed to ${isEdit ? 'update' : 'create'} API key`);
      }
    } catch (error) {
      setProgress(0);
      console.error(`Failed to ${isEdit ? 'update' : 'create'} API key:`, error);
      notifications.show({
        title: 'Error',
        message:
          error instanceof Error
            ? error.message
            : `Failed to ${isEdit ? 'update' : 'create'} API key`,
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });
    } finally {
      setSubmitting(false);
    }
  });

  const copyApiKey = () => {
    clipboard.copy(createdKey);
    notifications.show({
      title: 'Copied',
      message: 'API key copied to clipboard',
      color: 'green',
    });
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
    if (form.isDirty()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel ? onCancel() : router.back();
      }
    } else {
      onCancel ? onCancel() : router.back();
    }
  };

  return (
    <>
      {!isEdit && (
        <Stepper active={activeStep} onStepClick={setActiveStep} mb="xl">
          <Stepper.Step label="Basic Info" icon={<IconKey size={18} />} />
          <Stepper.Step label="Permissions" icon={<IconShield size={18} />} />
          <Stepper.Step label="Configuration" icon={<IconSettings size={18} />} />
          <Stepper.Step label="Review" icon={<IconCheck size={18} />} />
        </Stepper>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {submitting && <Progress value={progress} size="sm" animated color="blue" />}

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
                disabled={submitting}
              />

              {!isEdit && (
                <Select
                  label="Organization (Optional)"
                  placeholder="Select organization to scope this key"
                  leftSection={<IconSettings size={16} />}
                  {...form.getInputProps('organizationId')}
                  data={organizations.map((org) => ({ value: org.id, label: org.name }))}
                  clearable
                  disabled={submitting}
                />
              )}

              <Select
                label="Key Type"
                withAsterisk
                {...form.getInputProps('metadata.type')}
                data={KEY_TYPES.map((type) => ({
                  ...type,
                  label: `${type.label} - ${type.description}`,
                }))}
                disabled={submitting}
              />
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

              <Stack gap="xs">
                {AVAILABLE_PERMISSIONS.map((permission) => (
                  <Card
                    key={permission.value}
                    p="sm"
                    withBorder={form.values.permissions.includes(permission.value)}
                  >
                    <Group justify="space-between">
                      <Group>
                        <Chip
                          checked={form.values.permissions.includes(permission.value)}
                          onChange={(checked) => {
                            const current = form.values.permissions;
                            const updated = checked
                              ? [...current, permission.value]
                              : current.filter((p) => p !== permission.value);
                            form.setFieldValue('permissions', updated);
                          }}
                          color={permission.color}
                          disabled={submitting}
                        >
                          {permission.label}
                        </Chip>
                        <div>
                          <Text size="sm" fw={500}>
                            {permission.label}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {permission.description}
                          </Text>
                        </div>
                      </Group>
                      <Badge color={permission.color} variant="light" size="sm">
                        {permission.value}
                      </Badge>
                    </Group>
                  </Card>
                ))}
              </Stack>

              {form.errors.permissions && (
                <Text c="red" size="sm">
                  {form.errors.permissions}
                </Text>
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
                disabled={submitting}
                clearable
              />

              <Textarea
                label="Description (Optional)"
                placeholder="Add a description for this API key..."
                rows={3}
                maxRows={5}
                autosize
                {...form.getInputProps('metadata.description')}
                disabled={submitting}
              />
            </Stack>
          </Card>

          <Divider />

          <Group justify="flex-end">
            <Button variant="light" onClick={handleCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              disabled={!form.isValid()}
              leftSection={<IconKey size={16} />}
            >
              {isEdit ? 'Update' : 'Create'} API Key
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
