'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Container,
  Divider,
  Grid,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconBrain,
  IconChartBar,
  IconCreditCard,
  IconEdit,
  IconFlag,
  IconMail,
  IconPalette,
  IconPlus,
  IconRocket,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { FLAGS } from '@repo/analytics';
import { useAnalytics, useObservability, useUIAnalytics } from '@repo/observability';

// Mock feature flag data structure
interface FeatureFlag {
  category: 'workflows' | 'ui' | 'ai' | 'analytics' | 'auth' | 'payments' | 'email';
  description: string;
  enabled: boolean;
  environment: 'development' | 'staging' | 'production';
  key: string;
  lastModified: Date;
  modifiedBy: string;
  name: string;
}

const flagCategories = [
  {
    name: 'Workflows',
    color: 'blue',
    description: 'Feature flags for workflow execution and management',
    icon: IconRocket,
    key: 'workflows',
  },
  {
    name: 'User Interface',
    color: 'violet',
    description: 'UI components and interface enhancements',
    icon: IconPalette,
    key: 'ui',
  },
  {
    name: 'AI Features',
    color: 'green',
    description: 'AI and machine learning capabilities',
    icon: IconBrain,
    key: 'ai',
  },
  {
    name: 'Analytics',
    color: 'cyan',
    description: 'Analytics tracking and reporting features',
    icon: IconChartBar,
    key: 'analytics',
  },
  {
    name: 'Authentication',
    color: 'orange',
    description: 'Authentication and authorization features',
    icon: IconUsers,
    key: 'auth',
  },
  {
    name: 'Payments',
    color: 'red',
    description: 'Payment processing and billing features',
    icon: IconCreditCard,
    key: 'payments',
  },
  {
    name: 'Email',
    color: 'indigo',
    description: 'Email notifications and communication features',
    icon: IconMail,
    key: 'email',
  },
];

const mockFlags: FeatureFlag[] = [
  // Workflow flags
  {
    name: 'Product Classification',
    category: 'workflows',
    description: 'AI-powered product categorization workflows',
    enabled: true,
    environment: 'development',
    key: FLAGS.workflows.productClassification,
    lastModified: new Date(),
    modifiedBy: 'admin@example.com',
  },
  {
    name: 'Schedule Management',
    category: 'workflows',
    description: 'Cron-based workflow scheduling system',
    enabled: true,
    environment: 'development',
    key: FLAGS.workflows.schedules,
    lastModified: new Date(),
    modifiedBy: 'admin@example.com',
  },
  {
    name: 'External Integrations',
    category: 'workflows',
    description: 'Third-party system integrations and webhooks',
    enabled: true,
    environment: 'development',
    key: FLAGS.workflows.integrations,
    lastModified: new Date(),
    modifiedBy: 'admin@example.com',
  },
  // UI flags
  {
    name: 'Dark Mode',
    category: 'ui',
    description: 'Dark theme support across the application',
    enabled: true,
    environment: 'development',
    key: FLAGS.ui.darkMode,
    lastModified: new Date(),
    modifiedBy: 'admin@example.com',
  },
  {
    name: 'UI Animations',
    category: 'ui',
    description: 'Enhanced animations and transitions',
    enabled: false,
    environment: 'development',
    key: FLAGS.ui.animations,
    lastModified: new Date(),
    modifiedBy: 'admin@example.com',
  },
  // AI flags
  {
    name: 'AI Features',
    category: 'ai',
    description: 'Core AI and machine learning functionality',
    enabled: true,
    environment: 'development',
    key: FLAGS.ai.enabled,
    lastModified: new Date(),
    modifiedBy: 'admin@example.com',
  },
  {
    name: 'Anthropic Integration',
    category: 'ai',
    description: 'Claude AI model integration',
    enabled: true,
    environment: 'development',
    key: FLAGS.ai.anthropic,
    lastModified: new Date(),
    modifiedBy: 'admin@example.com',
  },
  // Email flags
  {
    name: 'Email System',
    category: 'email',
    description: 'Core email functionality using Resend',
    enabled: true,
    environment: 'development',
    key: FLAGS.email.enabled,
    lastModified: new Date(),
    modifiedBy: 'admin@example.com',
  },
  {
    name: 'Magic Link Authentication',
    category: 'email',
    description: 'Passwordless authentication via email magic links',
    enabled: true,
    environment: 'development',
    key: FLAGS.email.magicLink,
    lastModified: new Date(),
    modifiedBy: 'admin@example.com',
  },
  {
    name: 'Organization Invitations',
    category: 'email',
    description: 'Email invitations for organization membership',
    enabled: true,
    environment: 'development',
    key: FLAGS.email.organizationInvites,
    lastModified: new Date(),
    modifiedBy: 'admin@example.com',
  },
  {
    name: 'Welcome Emails',
    category: 'email',
    description: 'Automated welcome emails for new organizations',
    enabled: true,
    environment: 'development',
    key: FLAGS.email.welcome,
    lastModified: new Date(),
    modifiedBy: 'admin@example.com',
  },
];

function FlagCard({
  flag,
  onDelete,
  onEdit,
  onToggle,
}: {
  flag: FeatureFlag;
  onToggle: (key: string) => void;
  onEdit: (flag: FeatureFlag) => void;
  onDelete: (key: string) => void;
}) {
  const { trackClick } = useUIAnalytics();
  const category = flagCategories.find((c) => c.key === flag.category);

  const handleToggle = () => {
    onToggle(flag.key);
    trackClick('feature_flag_toggle', {
      category: flag.category,
      flagKey: flag.key,
      newState: !flag.enabled,
    });
  };

  return (
    <Card shadow="sm" withBorder padding="md">
      <Stack gap="sm">
        <Group align="flex-start" justify="space-between">
          <div style={{ flex: 1 }}>
            <Group gap="xs" mb="xs">
              <Badge color={category?.color} variant="light">
                {category?.name}
              </Badge>
              <Badge size="xs" variant="outline">
                {flag.environment}
              </Badge>
            </Group>
            <Text fw={500} mb="xs" size="sm">
              {flag.name}
            </Text>
            <Text c="dimmed" mb="sm" size="xs">
              {flag.description}
            </Text>
            <Code c="dimmed">{flag.key}</Code>
          </div>

          <Switch
            color={category?.color}
            onChange={handleToggle}
            checked={flag.enabled}
            size="md"
          />
        </Group>

        <Divider />

        <Group justify="space-between">
          <Text c="dimmed" size="xs">
            Modified by {flag.modifiedBy}
          </Text>
          <Group gap="xs">
            <Tooltip label="Edit flag">
              <ActionIcon
                onClick={() => {
                  onEdit(flag);
                  trackClick('feature_flag_edit', { flagKey: flag.key });
                }}
                size="sm"
                variant="subtle"
              >
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete flag">
              <ActionIcon
                color="red"
                onClick={() => {
                  onDelete(flag.key);
                  trackClick('feature_flag_delete', { flagKey: flag.key });
                }}
                size="sm"
                variant="subtle"
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}

function CreateFlagModal({
  onClose,
  onSubmit,
  opened,
}: {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<FeatureFlag>) => void;
}) {
  const form = useForm({
    validate: {
      name: (value) => (value.length < 3 ? 'Name must be at least 3 characters' : null),
      description: (value) =>
        value.length < 10 ? 'Description must be at least 10 characters' : null,
      key: (value) => (value.length < 3 ? 'Key must be at least 3 characters' : null),
    },
    initialValues: {
      name: '',
      category: 'workflows' as const,
      description: '',
      enabled: false,
      key: '',
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    onSubmit({
      ...values,
      environment: 'development',
      lastModified: new Date(),
      modifiedBy: 'current-user@example.com',
    });
    form.reset();
    onClose();
  };

  return (
    <Modal onClose={onClose} opened={opened} size="lg" title="Create Feature Flag">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            placeholder="e.g., Advanced Search"
            label="Flag Name"
            required
            {...form.getInputProps('name')}
          />

          <TextInput
            description="Unique identifier for this flag"
            placeholder="e.g., ui.advanced-search"
            label="Flag Key"
            required
            {...form.getInputProps('key')}
          />

          <Select
            data={flagCategories.map((cat) => ({ label: cat.name, value: cat.key }))}
            label="Category"
            required
            {...form.getInputProps('category')}
          />

          <Textarea
            minRows={3}
            placeholder="What does this feature flag control?"
            label="Description"
            required
            {...form.getInputProps('description')}
          />

          <Switch
            description="Whether this flag should be enabled when created"
            label="Enable by default"
            {...form.getInputProps('enabled', { type: 'checkbox' })}
          />

          <Group justify="flex-end">
            <Button onClick={onClose} variant="light">
              Cancel
            </Button>
            <Button type="submit">Create Flag</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(mockFlags);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [createModalOpened, { close: closeCreateModal, open: openCreateModal }] =
    useDisclosure(false);

  // Analytics and observability
  const { trackPage } = useAnalytics();
  const { trackClick, trackView } = useUIAnalytics();
  const { trackEvent } = useObservability();

  useEffect(() => {
    trackPage('feature_flags_management');
    trackView('feature_flags_page');
    trackEvent({
      action: 'view',
      category: 'admin',
      label: 'feature_flags',
      metadata: { totalFlags: flags.length },
    });
  }, [trackPage, trackView, trackEvent, flags.length]);

  const filteredFlags = selectedCategory
    ? flags.filter((flag) => flag.category === selectedCategory)
    : flags;

  const handleToggleFlag = (key: string) => {
    setFlags((prev) =>
      prev.map((flag) =>
        flag.key === key ? { ...flag, enabled: !flag.enabled, lastModified: new Date() } : flag,
      ),
    );

    notifications.show({
      color: 'blue',
      message: `Flag ${key} has been ${flags.find((f) => f.key === key)?.enabled ? 'disabled' : 'enabled'}`,
      title: 'Feature flag updated',
    });
  };

  const handleEditFlag = (flag: FeatureFlag) => {
    modals.open({
      children: <Text>Edit functionality would be implemented here</Text>,
      title: `Edit ${flag.name}`,
    });
  };

  const handleDeleteFlag = (key: string) => {
    modals.openConfirmModal({
      children: (
        <Text>
          Are you sure you want to delete this feature flag? This action cannot be undone.
        </Text>
      ),
      confirmProps: { color: 'red' },
      labels: { cancel: 'Cancel', confirm: 'Delete' },
      onConfirm: () => {
        setFlags((prev) => prev.filter((flag) => flag.key !== key));
        notifications.show({
          color: 'red',
          message: 'Feature flag has been permanently deleted',
          title: 'Flag deleted',
        });
      },
      title: 'Delete feature flag',
    });
  };

  const handleCreateFlag = (values: Partial<FeatureFlag>) => {
    const newFlag: FeatureFlag = {
      ...(values as FeatureFlag),
    };
    setFlags((prev) => [...prev, newFlag]);

    notifications.show({
      color: 'green',
      message: `${newFlag.name} has been created successfully`,
      title: 'Feature flag created',
    });
  };

  const categoryStats = flagCategories.map((category) => ({
    ...category,
    enabled: flags.filter((f) => f.category === category.key && f.enabled).length,
    total: flags.filter((f) => f.category === category.key).length,
  }));

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <div>
          <Group align="center" justify="space-between">
            <div>
              <Title order={1}>Feature Flags</Title>
              <Text c="dimmed" mt="sm" size="lg">
                Manage feature toggles and experimental functionality
              </Text>
            </div>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                openCreateModal();
                trackClick('create_feature_flag_button');
              }}
            >
              Create Flag
            </Button>
          </Group>
        </div>

        {/* Category Overview */}
        <Grid gutter="md">
          {categoryStats.map((category) => (
            <Grid.Col key={category.key} span={{ base: 12, lg: 4, sm: 6 }}>
              <Paper
                onClick={() => {
                  setSelectedCategory(selectedCategory === category.key ? null : category.key);
                  trackClick('category_filter', { category: category.key });
                }}
                withBorder
                style={{
                  borderColor:
                    selectedCategory === category.key
                      ? `var(--mantine-color-${category.color}-4)`
                      : undefined,
                  cursor: 'pointer',
                }}
                p="md"
              >
                <Group gap="sm">
                  <ThemeIcon color={category.color} size="lg" variant="light">
                    <category.icon size={24} />
                  </ThemeIcon>
                  <div style={{ flex: 1 }}>
                    <Text fw={500} size="sm">
                      {category.name}
                    </Text>
                    <Group gap="xs" mt="xs">
                      <Badge color={category.color} size="sm" variant="filled">
                        {category.enabled}/{category.total} enabled
                      </Badge>
                    </Group>
                  </div>
                </Group>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>

        {/* Filters */}
        {selectedCategory && (
          <Alert
            color="blue"
            title={`Filtering by ${flagCategories.find((c) => c.key === selectedCategory)?.name}`}
          >
            <Group justify="space-between">
              <Text size="sm">Showing {filteredFlags.length} flags in this category</Text>
              <Button onClick={() => setSelectedCategory(null)} size="xs" variant="light">
                Clear filter
              </Button>
            </Group>
          </Alert>
        )}

        {/* Feature Flags Grid */}
        <Grid gutter="md">
          {filteredFlags.map((flag) => (
            <Grid.Col key={flag.key} span={{ base: 12, lg: 4, sm: 6 }}>
              <FlagCard
                onDelete={handleDeleteFlag}
                onEdit={handleEditFlag}
                onToggle={handleToggleFlag}
                flag={flag}
              />
            </Grid.Col>
          ))}
        </Grid>

        {filteredFlags.length === 0 && (
          <Paper withBorder p="xl">
            <Stack align="center" gap="md">
              <ThemeIcon color="gray" size="xl" variant="light">
                <IconFlag size={32} />
              </ThemeIcon>
              <Text c="dimmed" fw={500} size="lg">
                No feature flags found
              </Text>
              <Text c="dimmed" size="sm" ta="center">
                {selectedCategory
                  ? `No flags found in the ${flagCategories.find((c) => c.key === selectedCategory)?.name} category`
                  : 'Create your first feature flag to get started'}
              </Text>
              {!selectedCategory && (
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={openCreateModal}
                  variant="light"
                >
                  Create Feature Flag
                </Button>
              )}
            </Stack>
          </Paper>
        )}
      </Stack>

      <CreateFlagModal
        onClose={closeCreateModal}
        onSubmit={handleCreateFlag}
        opened={createModalOpened}
      />
    </Container>
  );
}
