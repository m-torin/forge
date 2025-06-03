'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Container,
  Grid,
  Group,
  JsonInput,
  Modal,
  Paper,
  Progress,
  Select,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconApi,
  IconChartBar,
  IconCheck,
  IconClock,
  IconFileExport,
  IconPlayerPlay,
  IconRefresh,
  IconSettings,
  IconSitemap,
} from '@tabler/icons-react';
import { useState } from 'react';

interface Integration {
  config: {
    source: string;
    destination: string;
    mapping?: Record<string, string>;
    filters?: Record<string, any>;
    schedule?: string;
  };
  description: string;
  endpoint: string;
  id: string;
  lastSync?: string;
  name: string;
  nextSync?: string;
  stats: {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    lastError?: string;
  };
  status: 'active' | 'inactive' | 'error';
  type: 'chart-pdps' | 'sitemap' | 'data-export' | 'external-api';
}

interface SyncJob {
  completedAt?: string;
  error?: string;
  id: string;
  integrationId: string;
  recordsProcessed: number;
  recordsTotal: number;
  startedAt: string;
  status: 'running' | 'completed' | 'failed';
}

const INTEGRATION_TYPES = [
  { color: 'blue', icon: IconChartBar, label: 'Chart PDPs', value: 'chart-pdps' },
  { color: 'green', icon: IconSitemap, label: 'Sitemap Generation', value: 'sitemap' },
  { color: 'violet', icon: IconFileExport, label: 'Data Export', value: 'data-export' },
  { color: 'orange', icon: IconApi, label: 'External API', value: 'external-api' },
];

export default function IntegrationWorkflowsPage() {
  const [activeTab, setActiveTab] = useState<string | null>('active');
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'int-1',
      name: 'Product Data Platform Sync',
      type: 'chart-pdps',
      config: {
        destination: 'chart_api',
        mapping: {
          price: 'retail_price',
          sku: 'product_id',
          title: 'product_name',
        },
        source: 'products_db',
      },
      description: 'Synchronize product data with chart system',
      endpoint: '/api/integrations/chart-pdps',
      lastSync: new Date(Date.now() - 3600000).toISOString(),
      nextSync: new Date(Date.now() + 3600000).toISOString(),
      stats: {
        failedSyncs: 1,
        lastError: 'Connection timeout',
        successfulSyncs: 23,
        totalSyncs: 24,
      },
      status: 'active',
    },
    {
      id: 'int-2',
      name: 'XML Sitemap Generator',
      type: 'sitemap',
      config: {
        destination: 'public/sitemaps',
        filters: {
          includeBlog: true,
          includeCategories: true,
          includeProducts: true,
        },
        source: 'website_pages',
      },
      description: 'Generate and update website sitemaps',
      endpoint: '/api/integrations/sitemap',
      lastSync: new Date(Date.now() - 86400000).toISOString(),
      stats: {
        failedSyncs: 0,
        successfulSyncs: 7,
        totalSyncs: 7,
      },
      status: 'active',
    },
  ]);

  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([
    {
      id: 'job-1',
      completedAt: new Date(Date.now() - 300000).toISOString(),
      integrationId: 'int-1',
      recordsProcessed: 1250,
      recordsTotal: 1250,
      startedAt: new Date(Date.now() - 600000).toISOString(),
      status: 'completed',
    },
    {
      id: 'job-2',
      integrationId: 'int-1',
      recordsProcessed: 450,
      recordsTotal: 1500,
      startedAt: new Date(Date.now() - 60000).toISOString(),
      status: 'running',
    },
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configModalOpened, { close: closeConfigModal, open: openConfigModal }] =
    useDisclosure(false);
  const [createModalOpened, { close: closeCreateModal, open: openCreateModal }] =
    useDisclosure(false);

  const createForm = useForm({
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      type: (value) => (!value ? 'Integration type is required' : null),
      destination: (value) => (!value ? 'Destination is required' : null),
      filtersJson: (value) => {
        try {
          JSON.parse(value);
          return null;
        } catch {
          return 'Invalid JSON';
        }
      },
      mappingJson: (value) => {
        try {
          JSON.parse(value);
          return null;
        } catch {
          return 'Invalid JSON';
        }
      },
      source: (value) => (!value ? 'Source is required' : null),
    },
    initialValues: {
      name: '',
      type: '',
      description: '',
      destination: '',
      filtersJson: '{}',
      mappingJson: '{}',
      schedule: 'manual',
      source: '',
    },
  });

  const configForm = useForm({
    initialValues: {
      destination: '',
      filtersJson: '{}',
      mappingJson: '{}',
      schedule: '',
      source: '',
    },
  });

  const handleCreateIntegration = (values: typeof createForm.values) => {
    const newIntegration: Integration = {
      id: `int-${Date.now()}`,
      name: values.name,
      type: values.type as Integration['type'],
      config: {
        destination: values.destination,
        filters: JSON.parse(values.filtersJson),
        mapping: JSON.parse(values.mappingJson),
        schedule: values.schedule,
        source: values.source,
      },
      description: values.description,
      endpoint: `/api/integrations/${values.type}`,
      stats: {
        failedSyncs: 0,
        successfulSyncs: 0,
        totalSyncs: 0,
      },
      status: 'inactive',
    };

    setIntegrations([...integrations, newIntegration]);
    notifications.show({
      color: 'green',
      message: 'New integration has been created successfully',
      title: 'Integration Created',
    });
    closeCreateModal();
    createForm.reset();
  };

  const handleUpdateConfig = (values: typeof configForm.values) => {
    if (selectedIntegration) {
      setIntegrations(
        integrations.map((i) =>
          i.id === selectedIntegration.id
            ? {
                ...i,
                config: {
                  destination: values.destination,
                  filters: JSON.parse(values.filtersJson),
                  mapping: JSON.parse(values.mappingJson),
                  schedule: values.schedule,
                  source: values.source,
                },
              }
            : i,
        ),
      );
      notifications.show({
        color: 'green',
        message: 'Integration configuration has been updated',
        title: 'Configuration Updated',
      });
      closeConfigModal();
    }
  };

  const triggerSync = (integrationId: string) => {
    const integration = integrations.find((i) => i.id === integrationId);
    if (integration) {
      const newJob: SyncJob = {
        id: `job-${Date.now()}`,
        integrationId,
        recordsProcessed: 0,
        recordsTotal: 1000, // Mock total
        startedAt: new Date().toISOString(),
        status: 'running',
      };
      setSyncJobs([newJob, ...syncJobs]);

      notifications.show({
        color: 'blue',
        message: `${integration.name} synchronization has been triggered`,
        title: 'Sync Started',
      });
    }
  };

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(
      integrations.map((i) =>
        i.id === integrationId
          ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' }
          : i,
      ),
    );
  };

  const getIntegrationIcon = (type: string) => {
    const intType = INTEGRATION_TYPES.find((t) => t.value === type);
    return intType ? <intType.icon size={20} /> : <IconApi size={20} />;
  };

  const getIntegrationColor = (type: string) => {
    const intType = INTEGRATION_TYPES.find((t) => t.value === type);
    return intType?.color || 'gray';
  };

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <div>
          <Group align="center" justify="space-between">
            <div>
              <Title order={1}>Integration Workflows</Title>
              <Text c="dimmed" mt="md" size="lg">
                Manage data synchronization and external system integrations
              </Text>
            </div>
            <Button leftSection={<IconApi size={16} />} onClick={openCreateModal}>
              Create Integration
            </Button>
          </Group>
        </div>

        {/* Integration Stats */}
        <Grid>
          <Grid.Col span={3}>
            <Paper withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Total Integrations
                  </Text>
                  <Text fw={700} size="xl">
                    {integrations.length}
                  </Text>
                </div>
                <ThemeIcon size="xl" variant="light">
                  <IconApi size={28} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Active
                  </Text>
                  <Text c="green" fw={700} size="xl">
                    {integrations.filter((i) => i.status === 'active').length}
                  </Text>
                </div>
                <ThemeIcon color="green" size="xl" variant="light">
                  <IconCheck size={28} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Running Jobs
                  </Text>
                  <Text c="blue" fw={700} size="xl">
                    {syncJobs.filter((j) => j.status === 'running').length}
                  </Text>
                </div>
                <ThemeIcon color="blue" size="xl" variant="light">
                  <IconRefresh size={28} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Success Rate
                  </Text>
                  <Text fw={700} size="xl">
                    96%
                  </Text>
                </div>
                <Progress style={{ width: 60 }} radius="xl" size="xl" value={96} />
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        <Tabs onChange={setActiveTab} value={activeTab}>
          <Tabs.List>
            <Tabs.Tab leftSection={<IconApi size={16} />} value="active">
              Active Integrations
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconClock size={16} />} value="jobs">
              Sync Jobs
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel pt="md" value="active">
            <Stack gap="md">
              {integrations.map((integration) => (
                <Card key={integration.id} shadow="sm" withBorder p="lg">
                  <Group justify="space-between" mb="md">
                    <Group>
                      <Switch
                        onChange={() => toggleIntegration(integration.id)}
                        checked={integration.status === 'active'}
                        size="md"
                      />
                      <ThemeIcon
                        color={getIntegrationColor(integration.type)}
                        size="lg"
                        variant="light"
                      >
                        {getIntegrationIcon(integration.type)}
                      </ThemeIcon>
                      <div>
                        <Group gap="xs">
                          <Text fw={500} size="lg">
                            {integration.name}
                          </Text>
                          <Badge color={getIntegrationColor(integration.type)} variant="light">
                            {INTEGRATION_TYPES.find((t) => t.value === integration.type)?.label}
                          </Badge>
                        </Group>
                        <Text c="dimmed" size="sm">
                          {integration.description}
                        </Text>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Button
                        leftSection={<IconPlayerPlay size={14} />}
                        onClick={() => triggerSync(integration.id)}
                        disabled={integration.status !== 'active'}
                        size="xs"
                        variant="light"
                      >
                        Sync Now
                      </Button>
                      <ActionIcon
                        onClick={() => {
                          setSelectedIntegration(integration);
                          configForm.setValues({
                            destination: integration.config.destination,
                            filtersJson: JSON.stringify(integration.config.filters || {}, null, 2),
                            mappingJson: JSON.stringify(integration.config.mapping || {}, null, 2),
                            schedule: integration.config.schedule || '',
                            source: integration.config.source,
                          });
                          openConfigModal();
                        }}
                        variant="light"
                      >
                        <IconSettings size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Grid>
                    <Grid.Col span={3}>
                      <Text c="dimmed" size="sm">
                        Source
                      </Text>
                      <Code block>{integration.config.source}</Code>
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Text c="dimmed" size="sm">
                        Destination
                      </Text>
                      <Code block>{integration.config.destination}</Code>
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Text c="dimmed" size="sm">
                        Last Sync
                      </Text>
                      <Text size="sm">
                        {integration.lastSync
                          ? new Date(integration.lastSync).toLocaleString()
                          : 'Never'}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Text c="dimmed" size="sm">
                        Success Rate
                      </Text>
                      <Text fw={500} size="sm">
                        {integration.stats.totalSyncs > 0
                          ? `${Math.round((integration.stats.successfulSyncs / integration.stats.totalSyncs) * 100)}%`
                          : 'N/A'}
                      </Text>
                    </Grid.Col>
                  </Grid>

                  {integration.stats.lastError && (
                    <Alert color="red" icon={<IconAlertCircle />} mt="md">
                      Last error: {integration.stats.lastError}
                    </Alert>
                  )}
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="jobs">
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Integration</Table.Th>
                  <Table.Th>Started</Table.Th>
                  <Table.Th>Progress</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Duration</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {syncJobs.map((job) => {
                  const integration = integrations.find((i) => i.id === job.integrationId);
                  const progress = (job.recordsProcessed / job.recordsTotal) * 100;
                  const duration = job.completedAt
                    ? new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()
                    : Date.now() - new Date(job.startedAt).getTime();

                  return (
                    <Table.Tr key={job.id}>
                      <Table.Td>
                        <Group gap="xs">
                          <ThemeIcon
                            color={getIntegrationColor(integration?.type || '')}
                            size="sm"
                            variant="light"
                          >
                            {integration && getIntegrationIcon(integration.type)}
                          </ThemeIcon>
                          <Text size="sm">{integration?.name || 'Unknown'}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>{new Date(job.startedAt).toLocaleString()}</Table.Td>
                      <Table.Td>
                        <div style={{ width: 150 }}>
                          <Text mb={4} size="xs">
                            {job.recordsProcessed} / {job.recordsTotal}
                          </Text>
                          <Progress
                            color={job.status === 'failed' ? 'red' : undefined}
                            animated={job.status === 'running'}
                            size="sm"
                            striped={job.status === 'running'}
                            value={progress}
                          />
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            job.status === 'completed'
                              ? 'green'
                              : job.status === 'failed'
                                ? 'red'
                                : 'blue'
                          }
                        >
                          {job.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{(duration / 1000).toFixed(1)}s</Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Create Integration Modal */}
      <Modal
        onClose={closeCreateModal}
        opened={createModalOpened}
        size="lg"
        title="Create Integration"
      >
        <form onSubmit={createForm.onSubmit(handleCreateIntegration)}>
          <Stack gap="md">
            <Select
              placeholder="Select integration type"
              data={INTEGRATION_TYPES}
              label="Integration Type"
              {...createForm.getInputProps('type')}
              required
            />

            <TextInput
              placeholder="e.g., Daily Product Sync"
              label="Name"
              {...createForm.getInputProps('name')}
              required
            />

            <TextInput
              placeholder="Brief description of the integration"
              label="Description"
              {...createForm.getInputProps('description')}
            />

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  placeholder="e.g., products_db"
                  label="Source"
                  {...createForm.getInputProps('source')}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  placeholder="e.g., external_api"
                  label="Destination"
                  {...createForm.getInputProps('destination')}
                  required
                />
              </Grid.Col>
            </Grid>

            <Select
              label="Schedule"
              {...createForm.getInputProps('schedule')}
              data={[
                { label: 'Manual', value: 'manual' },
                { label: 'Hourly', value: 'hourly' },
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
              ]}
            />

            <JsonInput
              placeholder="Enter field mapping JSON"
              label="Field Mapping"
              {...createForm.getInputProps('mappingJson')}
              formatOnBlur
              minRows={4}
            />

            <JsonInput
              placeholder="Enter filters JSON"
              label="Filters"
              {...createForm.getInputProps('filtersJson')}
              formatOnBlur
              minRows={4}
            />

            <Group justify="flex-end">
              <Button onClick={closeCreateModal} variant="light">
                Cancel
              </Button>
              <Button type="submit">Create Integration</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Configure Integration Modal */}
      <Modal
        onClose={closeConfigModal}
        opened={configModalOpened}
        size="lg"
        title={`Configure ${selectedIntegration?.name}`}
      >
        <form onSubmit={configForm.onSubmit(handleUpdateConfig)}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput label="Source" {...configForm.getInputProps('source')} required />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Destination"
                  {...configForm.getInputProps('destination')}
                  required
                />
              </Grid.Col>
            </Grid>

            <Select
              label="Schedule"
              {...configForm.getInputProps('schedule')}
              data={[
                { label: 'Manual', value: 'manual' },
                { label: 'Hourly', value: 'hourly' },
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
              ]}
            />

            <JsonInput
              label="Field Mapping"
              {...configForm.getInputProps('mappingJson')}
              formatOnBlur
              minRows={6}
            />

            <JsonInput
              label="Filters"
              {...configForm.getInputProps('filtersJson')}
              formatOnBlur
              minRows={6}
            />

            <Group justify="flex-end">
              <Button onClick={closeConfigModal} variant="light">
                Cancel
              </Button>
              <Button type="submit">Update Configuration</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
