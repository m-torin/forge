'use client';

import { useWorkflow } from '@/contexts/workflow-context';
import { filterWorkflows, getAllTags, workflowMetadata } from '@/lib/workflow-metadata';
// import { track } from '@repo/analytics'; // Using platformAnalytics instead
import {
  ActionIcon,
  Affix,
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Chip,
  Code,
  Container,
  CopyButton,
  Grid,
  Group,
  Indicator,
  JsonInput,
  List,
  LoadingOverlay,
  Progress,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  Transition,
} from '@mantine/core';
import { useMap, useWindowScroll } from '@mantine/hooks';
import {
  IconApi,
  IconArrowUp,
  IconCheck,
  IconCopy,
  IconDatabase,
  IconFilter,
  IconPhoto,
  IconPlayerPlay,
  IconRocket,
  IconTerminal,
} from '@tabler/icons-react';
import { useState } from 'react';

// Example payloads for each workflow
const workflowExamples: Record<string, any> = {
  basic: {
    requiresValidation: true,
    name: 'Enhanced Basic Processing',
    batchSize: 5,
    requiresApproval: false,
    taskId: `task-${Date.now()}`,
    tasks: [
      { id: '1', data: { type: 'urgent' }, priority: 10 },
      { id: '2', data: { type: 'normal' }, priority: 5 },
      { id: '3', data: { type: 'batch' }, priority: 8 },
    ],
  },
  'chart-pdps': {
    message: 'Hello World from Chart PDPs!',
  },
  'chart-sitemaps': {
    message: 'Hello World from Chart Sitemaps!',
  },
  'gen-copy': {
    message: 'Hello World from Gen Copy!',
  },
  'image-processing': {
    imageId: `img-${Date.now()}`,
    imageUrl:
      'https://unsplash.com/photos/m6tAqZvy4RM/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzQ4NDU1NTEzfA&force=true&w=2400',
    options: {
      filters: ['grayscale', 'sepia', 'blur', 'sharpen'],
      outputFormat: 'webp',
      quality: 85,
      resolutions: [320, 640, 960, 1200], // Max 1200px
    },
    userId: 'user-123',
  },
  'kitchen-sink': {
    // ETL Pipeline
    destination: { type: 'database', config: { table: 'processed_data' } },
    pipelineId: `pipeline-${Date.now()}`,
    source: { type: 'api', url: 'https://api.example.com/data' },
    transformations: ['validate', 'sanitize', 'filter', 'enrich'],

    // Order Processing
    customer: { id: 'cust-456', email: 'test@example.com', tier: 'premium' },
    items: [{ price: 75, quantity: 2, sku: 'PREMIUM-ITEM' }],
    orderId: `order-${Date.now()}`,

    // Orchestration
    coffeeOrders: [
      { customerName: 'Alice', style: 'cappuccino' },
      { customerName: 'Bob', style: 'latte' },
    ],
    datasetId: `dataset-${Date.now()}`,
    notificationEmail: 'admin@example.com',
    operations: ['sum', 'average', 'max'],

    // Task Processing
    name: 'Comprehensive Kitchen Sink Demo',
    priority: 9,
    taskId: `task-${Date.now()}`,

    // Comprehensive options
    options: {
      batchSize: 10,
      maxDuration: 600,
      mode: 'full',
      notifyOn: ['complete'],
      notifyOnComplete: true,
      requiresApproval: true,
    },
  },
  'map-taxterm': {
    message: 'Hello World from Map Taxterm!',
  },
};

// Icon mapping
const iconMap: Record<string, any> = {
  blue: <IconRocket size={24} />,
  cyan: <IconDatabase size={24} />,
  green: <IconPhoto size={24} />,
  indigo: <IconDatabase size={24} />,
  lime: <IconDatabase size={24} />,
  orange: <IconDatabase size={24} />,
  pink: <IconRocket size={24} />,
  purple: <IconDatabase size={24} />,
  teal: <IconDatabase size={24} />,
  violet: <IconRocket size={24} />,
};

export default function WorkersPage() {
  const { loading, optimisticWorkflows, sseConnected, triggerWorkflowWithExample } = useWorkflow();
  const [scroll, scrollTo] = useWindowScroll();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterExpanded, setFilterExpanded] = useState(false);

  // Get all workflows from metadata
  const allWorkflows = Object.values(workflowMetadata).map((metadata) => ({
    ...metadata,
    endpoint: `/api/workflows/${metadata.id}`,
    example: workflowExamples[metadata.id] || {},
    icon: iconMap[metadata.color || 'blue'],
  }));

  // Filter workflows - pass the base metadata, then map the results
  const filteredWorkflows = filterWorkflows(Object.values(workflowMetadata), selectedTags).map(
    (metadata) => ({
      ...metadata,
      endpoint: `/api/workflows/${metadata.id}`,
      example: workflowExamples[metadata.id] || {},
      icon: iconMap[metadata.color || 'blue'],
    }),
  );
  const availableTags = getAllTags();

  // Use Mantine's useMap for payload state management
  const payloadsMap = useMap<string, string>(
    allWorkflows.map((w) => [w.id, JSON.stringify(w.example, null, 2)]),
  );

  const runningWorkflowsCount = Object.values(optimisticWorkflows).filter(
    (w: any) => w.status === 'running',
  ).length;

  return (
    <>
      <Container py="xl" size="lg">
        <Stack gap="xl">
          <div>
            <Group align="center" mb="md">
              <Title order={1}>Workflow Examples</Title>
              {runningWorkflowsCount > 0 && (
                <Indicator color="red" processing>
                  <Badge color="blue" variant="light">
                    {runningWorkflowsCount} running
                  </Badge>
                </Indicator>
              )}
            </Group>
            <Text c="dimmed" size="lg">
              Production-ready workflow patterns for distributed task execution
            </Text>
          </div>

          <Group justify="space-between">
            <Group>
              <Badge color={sseConnected ? 'green' : 'red'} size="sm" variant="dot">
                {sseConnected ? 'Live Updates' : 'Disconnected'}
              </Badge>
              <Badge size="sm" variant="light">
                {filteredWorkflows.length} of {allWorkflows.length} workflows
              </Badge>
              <Button href="/workflows" component="a" size="xs" variant="light">
                View New Dynamic Workflows →
              </Button>
              <Button href="/observability" component="a" size="xs" variant="outline">
                System Observability →
              </Button>
            </Group>
            <Group>
              <Button
                leftSection={<IconPlayerPlay size={16} />}
                onClick={() => {
                  allWorkflows.forEach((w) => triggerWorkflowWithExample(w));
                }}
                disabled={allWorkflows.length === 0}
                gradient={{ deg: 90, from: 'blue', to: 'cyan' }}
                size="sm"
                variant="gradient"
              >
                Run All Workflows ({allWorkflows.length})
              </Button>
              <Button
                leftSection={<IconFilter size={16} />}
                onClick={() => setFilterExpanded(!filterExpanded)}
                size="xs"
                variant="subtle"
              >
                {filterExpanded ? 'Hide' : 'Show'} Filters
              </Button>
            </Group>
          </Group>

          {/* Filter Section */}
          {filterExpanded && (
            <Card shadow="sm" withBorder p="md" radius="md">
              <div>
                <Group justify="space-between" mb="xs">
                  <Text fw={500} size="sm">
                    Filter by Tags
                  </Text>
                  {selectedTags.length > 0 && (
                    <Button onClick={() => setSelectedTags([])} size="xs" variant="subtle">
                      Clear all
                    </Button>
                  )}
                </Group>
                <Chip.Group onChange={setSelectedTags} multiple value={selectedTags}>
                  <Group gap="xs">
                    {availableTags.map((tag) => (
                      <Chip key={tag} size="sm" value={tag}>
                        {tag}
                      </Chip>
                    ))}
                  </Group>
                </Chip.Group>
              </div>
            </Card>
          )}

          <Tabs defaultValue="workflows">
            <Tabs.List>
              <Tabs.Tab leftSection={<IconRocket size={16} />} value="workflows">
                Legacy Workflows
              </Tabs.Tab>
              <Tabs.Tab leftSection={<IconApi size={16} />} value="api">
                API Reference
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel pt="md" value="workflows">
              <Stack gap="lg">
                {/* Quick Actions Bar */}
                <Group justify="space-between">
                  <Text c="dimmed" size="sm">
                    Click "Run" to execute a workflow, or customize the payload first.
                  </Text>
                  <Button
                    leftSection={<IconPlayerPlay size={14} />}
                    onClick={() => {
                      filteredWorkflows.forEach((w) => triggerWorkflowWithExample(w));
                    }}
                    disabled={filteredWorkflows.length === 0}
                    size="xs"
                    variant="subtle"
                  >
                    Run All Visible ({filteredWorkflows.length})
                  </Button>
                </Group>

                {filteredWorkflows.length === 0 ? (
                  <Alert color="gray" title="No workflows found">
                    No workflows match your current filters. Try adjusting your selection.
                  </Alert>
                ) : (
                  <Grid>
                    {filteredWorkflows.map((workflow) => {
                      const status = optimisticWorkflows[workflow.endpoint];
                      const isRunning = status?.status === 'running';
                      const isLoading = loading.get(workflow.endpoint) || false;

                      return (
                        <Grid.Col key={workflow.endpoint} span={{ base: 12, md: 6 }}>
                          <Card shadow="sm" withBorder h="100%" p="lg" radius="md">
                            <LoadingOverlay visible={isLoading} />
                            <Stack gap="md" h="100%">
                              <Group justify="space-between">
                                <Group>
                                  <ThemeIcon color={workflow.color} size="lg" variant="light">
                                    {workflow.icon}
                                  </ThemeIcon>
                                  <div>
                                    <Title order={3}>{workflow.title}</Title>
                                    <Text c="dimmed" size="xs">
                                      {workflow.estimatedTime} • {workflow.difficulty}
                                    </Text>
                                  </div>
                                </Group>
                                {status && (
                                  <Badge
                                    color={
                                      status.status === 'completed'
                                        ? 'green'
                                        : status.status === 'failed'
                                          ? 'red'
                                          : status.status === 'cancelled'
                                            ? 'orange'
                                            : 'blue'
                                    }
                                    variant={isRunning ? 'dot' : 'filled'}
                                  >
                                    {status.status}
                                  </Badge>
                                )}
                              </Group>

                              <Text c="dimmed" size="sm">
                                {workflow.description}
                              </Text>

                              {/* Tags */}
                              <Group gap="xs">
                                {workflow.tags.map((tag) => (
                                  <Badge key={tag} size="xs" variant="outline">
                                    {tag}
                                  </Badge>
                                ))}
                              </Group>

                              <Stack gap="xs">
                                {workflow.features.slice(0, 3).map((feature) => (
                                  <Group key={feature} gap="xs">
                                    <ThemeIcon color="teal" size="xs" variant="light">
                                      <IconCheck size={12} />
                                    </ThemeIcon>
                                    <Text size="xs">{feature}</Text>
                                  </Group>
                                ))}
                                {workflow.features.length > 3 && (
                                  <Text c="dimmed" size="xs">
                                    +{workflow.features.length - 3} more features
                                  </Text>
                                )}
                              </Stack>

                              {status && isRunning && status.totalSteps > 0 && (
                                <div>
                                  <Group justify="space-between" mb="xs">
                                    <Text c="dimmed" size="xs">
                                      Progress: {status.completedSteps} of {status.totalSteps} steps
                                    </Text>
                                    <Text c="dimmed" size="xs">
                                      {Math.round(status.progress)}%
                                    </Text>
                                  </Group>
                                  <Progress
                                    color={workflow.color}
                                    animated
                                    size="sm"
                                    striped
                                    value={status.progress}
                                  />
                                </div>
                              )}

                              <div style={{ marginTop: 'auto' }}>
                                <Stack gap="xs">
                                  <Group justify="space-between">
                                    <Text fw={500} size="sm">
                                      Payload
                                    </Text>
                                    <CopyButton value={payloadsMap.get(workflow.id) || ''}>
                                      {({ copied, copy }) => (
                                        <Tooltip label={copied ? 'Copied!' : 'Copy payload'}>
                                          <ActionIcon
                                            color={copied ? 'teal' : 'gray'}
                                            onClick={copy}
                                            size="sm"
                                            variant="subtle"
                                          >
                                            <IconCopy size={16} />
                                          </ActionIcon>
                                        </Tooltip>
                                      )}
                                    </CopyButton>
                                  </Group>
                                  <JsonInput
                                    validationError="Invalid JSON"
                                    autosize
                                    formatOnBlur
                                    maxRows={8}
                                    minRows={4}
                                    onChange={(value) => payloadsMap.set(workflow.id, value)}
                                    styles={{
                                      input: {
                                        fontFamily: 'monospace',
                                        fontSize: '12px',
                                      },
                                    }}
                                    value={payloadsMap.get(workflow.id) || ''}
                                  />
                                </Stack>
                              </div>

                              <Group justify="space-between">
                                <Badge color={workflow.color} size="sm" variant="light">
                                  {workflow.endpoint}
                                </Badge>
                                <Button
                                  leftSection={<IconPlayerPlay size={14} />}
                                  loading={isLoading}
                                  onClick={() => {
                                    try {
                                      const payload = JSON.parse(
                                        payloadsMap.get(workflow.id) || '{}',
                                      );
                                      triggerWorkflowWithExample(workflow, payload);
                                    } catch {
                                      // Invalid JSON - validation error will show
                                    }
                                  }}
                                  disabled={isRunning}
                                  size="xs"
                                >
                                  Run
                                </Button>
                              </Group>

                              {status && (
                                <Alert
                                  color={
                                    status.status === 'completed'
                                      ? 'green'
                                      : status.status === 'failed'
                                        ? 'red'
                                        : status.status === 'cancelled'
                                          ? 'orange'
                                          : 'blue'
                                  }
                                  p="xs"
                                >
                                  <Stack gap="xs">
                                    <Group justify="space-between">
                                      <Text size="xs">
                                        ID: <Code>{status.workflowRunId}</Code>
                                      </Text>
                                      <Anchor
                                        href={`/api/client/logs?workflowRunId=${status.workflowRunId}`}
                                        size="xs"
                                        target="_blank"
                                      >
                                        View logs
                                      </Anchor>
                                    </Group>
                                    {workflow.id === 'image-processing' &&
                                      status.status === 'completed' && (
                                        <Anchor
                                          href={`/api/workflows/image-processing/viewer?id=${status.workflowRunId}`}
                                          style={{ textAlign: 'center' }}
                                          size="sm"
                                          target="_blank"
                                        >
                                          🖼️ View Processed Images
                                        </Anchor>
                                      )}
                                  </Stack>
                                </Alert>
                              )}
                            </Stack>
                          </Card>
                        </Grid.Col>
                      );
                    })}
                  </Grid>
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="api">
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card shadow="sm" withBorder p="lg" radius="md">
                    <Title order={3} mb="md">
                      <Group>
                        <IconApi size={20} />
                        <span>Workflow Management API</span>
                      </Group>
                    </Title>
                    <List size="sm" spacing="xs">
                      <List.Item>
                        <Code>/api/client/trigger</Code> - Start any workflow
                      </List.Item>
                      <List.Item>
                        <Code>/api/client/logs</Code> - View execution history
                      </List.Item>
                      <List.Item>
                        <Code>/api/client/cancel</Code> - Cancel running workflows
                      </List.Item>
                      <List.Item>
                        <Code>/api/client/notify</Code> - Send events to waiting workflows
                      </List.Item>
                      <List.Item>
                        <Code>/api/client/waiters</Code> - List workflows waiting for events
                      </List.Item>
                      <List.Item>
                        <Code>/api/health</Code> - Health check endpoint
                      </List.Item>
                    </List>
                  </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card shadow="sm" withBorder p="lg" radius="md">
                    <Title order={3} mb="md">
                      <Group>
                        <IconTerminal size={20} />
                        <span>API Examples</span>
                      </Group>
                    </Title>
                    <Stack gap="sm">
                      <div>
                        <Text fw={500} mb={4} size="sm">
                          Trigger a workflow:
                        </Text>
                        <Code block>
                          {`curl -X POST /api/client/trigger \\
  -H "Content-Type: application/json" \\
  -d '{"url": "http://localhost:3400/api/workflows/basic", "body": {...}}'`}
                        </Code>
                      </div>
                      <div>
                        <Text fw={500} mb={4} size="sm">
                          Check logs:
                        </Text>
                        <Code block>curl /api/client/logs?workflowRunId=wfr_xxx</Code>
                      </div>
                    </Stack>
                  </Card>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>
          </Tabs>

          {/* Active Workflows Section */}
          {Object.keys(optimisticWorkflows).length > 0 && (
            <Card shadow="sm" withBorder mt="xl" radius="md">
              <Title order={3} mb="md">
                Workflow History
              </Title>
              <Stack gap="sm">
                {Object.entries(optimisticWorkflows).map(([endpoint, workflow]) => (
                  <Group
                    key={endpoint}
                    style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
                    justify="space-between"
                    p="sm"
                  >
                    <div>
                      <Text fw={500}>{endpoint.split('/').pop()}</Text>
                      <Text c="dimmed" size="xs">
                        ID: {workflow.workflowRunId}
                      </Text>
                    </div>
                    <Group gap="sm">
                      {workflow.totalSteps > 0 && (
                        <Text c="dimmed" size="xs">
                          {workflow.completedSteps}/{workflow.totalSteps} steps
                        </Text>
                      )}
                      <Badge
                        color={
                          workflow.status === 'completed'
                            ? 'green'
                            : workflow.status === 'failed'
                              ? 'red'
                              : workflow.status === 'cancelled'
                                ? 'orange'
                                : 'blue'
                        }
                        variant={workflow.status === 'running' ? 'dot' : 'filled'}
                      >
                        {workflow.status}
                      </Badge>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </Card>
          )}
        </Stack>
      </Container>

      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition mounted={scroll.y > 100} transition="slide-up">
          {(transitionStyles) => (
            <Button
              leftSection={<IconArrowUp size={16} />}
              onClick={() => scrollTo({ y: 0 })}
              style={transitionStyles}
            >
              Scroll to top
            </Button>
          )}
        </Transition>
      </Affix>
    </>
  );
}
