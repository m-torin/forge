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
  JsonInput,
  Modal,
  NumberInput,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconDatabase,
  IconEdit,
  IconPlus,
  IconSettings,
  IconTrash,
  IconWebhook,
} from '@tabler/icons-react';
import { useState } from 'react';

interface WorkflowConfig {
  concurrency: number;
  description: string;
  enabled: boolean;
  endpoint: string;
  environment: Record<string, string>;
  id: string;
  metadata: Record<string, any>;
  name: string;
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  retryPolicy: {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };
  timeout: number;
  webhooks: {
    onSuccess?: string;
    onFailure?: string;
    onStart?: string;
  };
}

interface WebhookEndpoint {
  headers: Record<string, string>;
  id: string;
  method: 'POST' | 'GET';
  name: string;
  retryOnFailure: boolean;
  timeout: number;
  url: string;
}

export default function WorkflowConfigurationPage() {
  const [activeTab, setActiveTab] = useState<string | null>('workflows');
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([
    {
      id: 'product-classification',
      name: 'Product Classification',
      concurrency: 5,
      description: 'AI-powered product categorization workflow',
      enabled: true,
      endpoint: '/api/workflows/product-classification',
      environment: {
        OPENAI_API_KEY: '***',
        UPSTASH_VECTOR_URL: '***',
      },
      metadata: {
        author: 'AI Team',
        version: '1.2.0',
      },
      rateLimiting: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60000,
      },
      retryPolicy: {
        backoffMultiplier: 2,
        initialDelay: 1000,
        maxDelay: 60000,
        maxRetries: 3,
      },
      timeout: 300000, // 5 minutes
      webhooks: {
        onFailure: 'webhook-2',
        onSuccess: 'webhook-1',
      },
    },
    {
      id: 'kitchen-sink',
      name: 'Kitchen Sink Demo',
      concurrency: 3,
      description: 'Comprehensive workflow demonstration',
      enabled: true,
      endpoint: '/api/workflows/kitchen-sink',
      environment: {},
      metadata: {
        author: 'Platform Team',
        version: '2.0.0',
      },
      rateLimiting: {
        enabled: false,
        maxRequests: 50,
        windowMs: 60000,
      },
      retryPolicy: {
        backoffMultiplier: 3,
        initialDelay: 2000,
        maxDelay: 120000,
        maxRetries: 5,
      },
      timeout: 600000, // 10 minutes
      webhooks: {},
    },
  ]);

  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([
    {
      id: 'webhook-1',
      name: 'Success Notification',
      url: 'https://api.example.com/webhooks/success',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': '***',
      },
      method: 'POST',
      retryOnFailure: true,
      timeout: 30000,
    },
    {
      id: 'webhook-2',
      name: 'Error Alert',
      url: 'https://api.example.com/webhooks/error',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      retryOnFailure: false,
      timeout: 10000,
    },
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowConfig | null>(null);
  const [workflowModalOpened, { close: closeWorkflowModal, open: openWorkflowModal }] =
    useDisclosure(false);
  const [webhookModalOpened, { close: closeWebhookModal, open: openWebhookModal }] =
    useDisclosure(false);

  const [webhookForm, setWebhookForm] = useState<{
    name: string;
    url: string;
    headers: string;
    method: 'POST' | 'GET';
    retryOnFailure: boolean;
    timeout: number;
  }>({
    name: '',
    url: '',
    headers: '{\n  "Content-Type": "application/json"\n}',
    method: 'POST',
    retryOnFailure: true,
    timeout: 30000,
  });

  const handleEditWorkflow = (workflow: WorkflowConfig) => {
    setSelectedWorkflow(workflow);
    openWorkflowModal();
  };

  const handleSaveWorkflow = (updates: Partial<WorkflowConfig>) => {
    if (selectedWorkflow) {
      setWorkflows(workflows.map((w) => (w.id === selectedWorkflow.id ? { ...w, ...updates } : w)));
      notifications.show({
        color: 'green',
        message: `${selectedWorkflow.name} configuration has been updated`,
        title: 'Configuration Updated',
      });
      closeWorkflowModal();
    }
  };

  const handleCreateWebhook = () => {
    try {
      const newWebhook: WebhookEndpoint = {
        id: `webhook-${Date.now()}`,
        name: webhookForm.name,
        url: webhookForm.url,
        headers: JSON.parse(webhookForm.headers),
        method: webhookForm.method,
        retryOnFailure: webhookForm.retryOnFailure,
        timeout: webhookForm.timeout,
      };

      setWebhooks([...webhooks, newWebhook]);
      notifications.show({
        color: 'green',
        message: 'New webhook endpoint has been added',
        title: 'Webhook Created',
      });
      closeWebhookModal();

      // Reset form
      setWebhookForm({
        name: '',
        url: '',
        headers: '{\n  "Content-Type": "application/json"\n}',
        method: 'POST',
        retryOnFailure: true,
        timeout: 30000,
      });
    } catch {
      notifications.show({
        color: 'red',
        message: 'Invalid JSON in headers field',
        title: 'Error',
      });
    }
  };

  const duplicateWorkflow = (workflow: WorkflowConfig) => {
    const newWorkflow: WorkflowConfig = {
      ...workflow,
      id: `${workflow.id}-copy-${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      endpoint: `${workflow.endpoint}-copy`,
    };
    setWorkflows([...workflows, newWorkflow]);
    notifications.show({
      color: 'blue',
      message: `${workflow.name} has been duplicated`,
      title: 'Workflow Duplicated',
    });
  };

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Workflow Configuration</Title>
          <Text c="dimmed" mt="md" size="lg">
            Configure workflow settings, retry policies, and integrations
          </Text>
        </div>

        {/* Configuration Stats */}
        <Grid>
          <Grid.Col span={3}>
            <Paper withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Total Workflows
                  </Text>
                  <Text fw={700} size="xl">
                    {workflows.length}
                  </Text>
                </div>
                <ThemeIcon size="xl" variant="light">
                  <IconSettings size={28} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Enabled
                  </Text>
                  <Text c="green" fw={700} size="xl">
                    {workflows.filter((w) => w.enabled).length}
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
                    Webhooks
                  </Text>
                  <Text fw={700} size="xl">
                    {webhooks.length}
                  </Text>
                </div>
                <ThemeIcon color="blue" size="xl" variant="light">
                  <IconWebhook size={28} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Rate Limited
                  </Text>
                  <Text fw={700} size="xl">
                    {workflows.filter((w) => w.rateLimiting.enabled).length}
                  </Text>
                </div>
                <ThemeIcon color="orange" size="xl" variant="light">
                  <IconAlertCircle size={28} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        <Tabs onChange={setActiveTab} value={activeTab}>
          <Tabs.List>
            <Tabs.Tab leftSection={<IconSettings size={16} />} value="workflows">
              Workflows
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconWebhook size={16} />} value="webhooks">
              Webhooks
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconDatabase size={16} />} value="environment">
              Environment
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel pt="md" value="workflows">
            <Stack gap="md">
              {workflows.map((workflow) => (
                <Card key={workflow.id} shadow="sm" withBorder p="lg">
                  <Group justify="space-between" mb="md">
                    <Group>
                      <Switch
                        onChange={(e) => {
                          setWorkflows(
                            workflows.map((w) =>
                              w.id === workflow.id ? { ...w, enabled: e.currentTarget.checked } : w,
                            ),
                          );
                        }}
                        checked={workflow.enabled}
                        size="md"
                      />
                      <div>
                        <Group gap="xs">
                          <Text fw={500} size="lg">
                            {workflow.name}
                          </Text>
                          <Badge size="sm" variant="light">
                            v{workflow.metadata.version}
                          </Badge>
                        </Group>
                        <Text c="dimmed" size="sm">
                          {workflow.description}
                        </Text>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Tooltip label="Edit Configuration">
                        <ActionIcon onClick={() => handleEditWorkflow(workflow)} variant="light">
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Duplicate">
                        <ActionIcon onClick={() => duplicateWorkflow(workflow)} variant="light">
                          <IconCopy size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>

                  <Grid>
                    <Grid.Col span={3}>
                      <Text c="dimmed" size="sm">
                        Endpoint
                      </Text>
                      <Code block>{workflow.endpoint}</Code>
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Text c="dimmed" size="sm">
                        Retry Policy
                      </Text>
                      <Text size="sm">Max {workflow.retryPolicy.maxRetries} retries</Text>
                      <Text c="dimmed" size="xs">
                        {workflow.retryPolicy.initialDelay}ms initial delay
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Text c="dimmed" size="sm">
                        Concurrency
                      </Text>
                      <Text size="sm">{workflow.concurrency} parallel</Text>
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Text c="dimmed" size="sm">
                        Rate Limiting
                      </Text>
                      {workflow.rateLimiting.enabled ? (
                        <Text size="sm">{workflow.rateLimiting.maxRequests} req/min</Text>
                      ) : (
                        <Text c="dimmed" size="sm">
                          Disabled
                        </Text>
                      )}
                    </Grid.Col>
                  </Grid>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="webhooks">
            <Stack gap="md">
              <Group justify="flex-end">
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    setWebhookForm({
                      name: '',
                      url: '',
                      headers: '{\n  "Content-Type": "application/json"\n}',
                      method: 'POST',
                      retryOnFailure: true,
                      timeout: 30000,
                    });
                    openWebhookModal();
                  }}
                >
                  Add Webhook
                </Button>
              </Group>

              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>URL</Table.Th>
                    <Table.Th>Method</Table.Th>
                    <Table.Th>Retry</Table.Th>
                    <Table.Th>Timeout</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {webhooks.map((webhook) => (
                    <Table.Tr key={webhook.id}>
                      <Table.Td>{webhook.name}</Table.Td>
                      <Table.Td>
                        <Code>{webhook.url}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light">{webhook.method}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={webhook.retryOnFailure ? 'green' : 'gray'} variant="dot">
                          {webhook.retryOnFailure ? 'Yes' : 'No'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{webhook.timeout / 1000}s</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon size="sm" variant="light">
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon
                            color="red"
                            onClick={() => {
                              setWebhooks(webhooks.filter((w) => w.id !== webhook.id));
                              notifications.show({
                                color: 'red',
                                message: 'Webhook endpoint has been removed',
                                title: 'Webhook Deleted',
                              });
                            }}
                            size="sm"
                            variant="light"
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="environment">
            <Alert color="blue" icon={<IconAlertCircle />} mb="md">
              Environment variables are securely stored and encrypted. Only variable names are
              visible here.
            </Alert>

            <Stack gap="md">
              {workflows.map((workflow) => (
                <Card key={workflow.id} shadow="sm" withBorder p="md">
                  <Title order={4} mb="sm">
                    {workflow.name}
                  </Title>
                  {Object.entries(workflow.environment).length > 0 ? (
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Variable</Table.Th>
                          <Table.Th>Value</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {Object.entries(workflow.environment).map(([key, value]) => (
                          <Table.Tr key={key}>
                            <Table.Td>
                              <Code>{key}</Code>
                            </Table.Td>
                            <Table.Td>
                              <Text c="dimmed" size="sm">
                                {value}
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  ) : (
                    <Text c="dimmed" size="sm">
                      No environment variables configured
                    </Text>
                  )}
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Edit Workflow Modal */}
      <Modal
        onClose={closeWorkflowModal}
        opened={workflowModalOpened}
        size="xl"
        title={`Edit ${selectedWorkflow?.name} Configuration`}
      >
        {selectedWorkflow && (
          <Stack gap="md">
            <Divider label="Retry Policy" />
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  onChange={(value) =>
                    handleSaveWorkflow({
                      retryPolicy: {
                        ...selectedWorkflow.retryPolicy,
                        maxRetries: typeof value === 'number' ? value : 0,
                      },
                    })
                  }
                  label="Max Retries"
                  max={10}
                  min={0}
                  value={selectedWorkflow.retryPolicy.maxRetries}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  onChange={(value) =>
                    handleSaveWorkflow({
                      retryPolicy: {
                        ...selectedWorkflow.retryPolicy,
                        initialDelay: typeof value === 'number' ? value : 1000,
                      },
                    })
                  }
                  label="Initial Delay (ms)"
                  max={60000}
                  min={100}
                  value={selectedWorkflow.retryPolicy.initialDelay}
                />
              </Grid.Col>
            </Grid>

            <Divider label="Performance" />
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  onChange={(value) =>
                    handleSaveWorkflow({ timeout: typeof value === 'number' ? value : 60000 })
                  }
                  label="Timeout (ms)"
                  max={3600000}
                  min={1000}
                  value={selectedWorkflow.timeout}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Slider
                  onChange={(value) => handleSaveWorkflow({ concurrency: value })}
                  label="Concurrency Limit"
                  marks={[
                    { label: '1', value: 1 },
                    { label: '5', value: 5 },
                    { label: '10', value: 10 },
                    { label: '20', value: 20 },
                  ]}
                  max={20}
                  min={1}
                  value={selectedWorkflow.concurrency}
                />
              </Grid.Col>
            </Grid>

            <Divider label="Rate Limiting" />
            <Switch
              onChange={(e) =>
                handleSaveWorkflow({
                  rateLimiting: {
                    ...selectedWorkflow.rateLimiting,
                    enabled: e.currentTarget.checked,
                  },
                })
              }
              checked={selectedWorkflow.rateLimiting.enabled}
              label="Enable rate limiting"
            />

            {selectedWorkflow.rateLimiting.enabled && (
              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    onChange={(value) =>
                      handleSaveWorkflow({
                        rateLimiting: {
                          ...selectedWorkflow.rateLimiting,
                          maxRequests: typeof value === 'number' ? value : 100,
                        },
                      })
                    }
                    label="Max Requests"
                    max={1000}
                    min={1}
                    value={selectedWorkflow.rateLimiting.maxRequests}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    onChange={(value) =>
                      handleSaveWorkflow({
                        rateLimiting: {
                          ...selectedWorkflow.rateLimiting,
                          windowMs: typeof value === 'number' ? value : 60000,
                        },
                      })
                    }
                    label="Window (ms)"
                    max={3600000}
                    min={1000}
                    value={selectedWorkflow.rateLimiting.windowMs}
                  />
                </Grid.Col>
              </Grid>
            )}
          </Stack>
        )}
      </Modal>

      {/* Create Webhook Modal */}
      <Modal
        onClose={closeWebhookModal}
        opened={webhookModalOpened}
        size="lg"
        title="Create Webhook Endpoint"
      >
        <Stack gap="md">
          <TextInput
            onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
            placeholder="e.g., Success Notification"
            label="Name"
            required
            value={webhookForm.name}
          />

          <TextInput
            onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
            placeholder="https://api.example.com/webhook"
            label="URL"
            required
            value={webhookForm.url}
          />

          <Select
            onChange={(value) =>
              setWebhookForm({ ...webhookForm, method: value as 'POST' | 'GET' })
            }
            data={[
              { label: 'POST', value: 'POST' },
              { label: 'GET', value: 'GET' },
            ]}
            label="Method"
            value={webhookForm.method}
          />

          <JsonInput
            validationError="Invalid JSON"
            formatOnBlur
            minRows={4}
            onChange={(value) => setWebhookForm({ ...webhookForm, headers: value })}
            placeholder="Enter JSON headers"
            label="Headers"
            value={webhookForm.headers}
          />

          <Switch
            onChange={(e) =>
              setWebhookForm({ ...webhookForm, retryOnFailure: e.currentTarget.checked })
            }
            checked={webhookForm.retryOnFailure}
            label="Retry on failure"
          />

          <NumberInput
            onChange={(value) =>
              setWebhookForm({ ...webhookForm, timeout: typeof value === 'number' ? value : 30000 })
            }
            label="Timeout (ms)"
            max={60000}
            min={1000}
            value={webhookForm.timeout}
          />

          <Group justify="flex-end">
            <Button onClick={closeWebhookModal} variant="light">
              Cancel
            </Button>
            <Button onClick={handleCreateWebhook}>Create Webhook</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
