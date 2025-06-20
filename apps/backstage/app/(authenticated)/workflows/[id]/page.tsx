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
  LoadingOverlay,
  Progress,
  RingProgress,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Timeline,
  Title,
} from '@mantine/core';
import { useDisclosure, useInterval } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconCode,
  IconHistory,
  IconInfoCircle,
  IconPlay,
  IconRefresh,
  IconSettings,
  IconX,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Types & Constants
type Status = 'running' | 'completed' | 'failed' | 'queued';
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface WorkflowDetails {
  category: string;
  createdAt: string;
  description: string;
  enabled: boolean;
  id: string;
  name: string;
  tags: string[];
  updatedAt: string;
  version: string;
}

interface WorkflowExecution {
  id: string;
  status: Status;
  startTime: string;
  endTime?: string;
  duration?: number;
  progress?: number;
  logs: { timestamp: string; level: LogLevel; message: string }[];
}

interface WorkflowStats {
  totalRuns: number;
  successRate: number;
  averageDuration: number;
  lastRun?: string;
  currentlyRunning: number;
}

const COLORS = {
  status: { running: 'blue', completed: 'green', failed: 'red', queued: 'yellow' },
  log: { info: 'blue', warn: 'yellow', error: 'red', debug: 'gray' },
  category: {
    ai: 'blue',
    analytics: 'indigo',
    catalog: 'violet',
    commerce: 'purple',
    compliance: 'red',
    compute: 'pink',
    content: 'grape',
    data: 'orange',
    ecommerce: 'teal',
    finance: 'green',
    integration: 'cyan',
    inventory: 'yellow',
    marketing: 'lime',
    media: 'blue',
    merchant: 'indigo',
    ml: 'violet',
    monitoring: 'purple',
    pricing: 'pink',
    search: 'grape',
    security: 'red',
    user: 'orange',
  },
} as const;

// Utilities
const formatDuration = (s: number) =>
  s < 60
    ? `${s}s`
    : s < 3600
      ? `${(s / 60) | 0}m ${s % 60}s`
      : `${(s / 3600) | 0}h ${((s % 3600) / 60) | 0}m`;
const getColor = (type: keyof typeof COLORS, key: string) =>
  COLORS[type][key as keyof (typeof COLORS)[typeof type]] || 'gray';

// Mock data
const createMockData = () => {
  const statuses: Status[] = ['completed', 'completed', 'failed', 'running', 'completed'];
  const now = Date.now();

  return {
    executions: Array.from({ length: 10 }, (_, i) => {
      const status = statuses[i % 5];
      const isRunning = status === 'running';
      return {
        id: `exec-${i + 1}`,
        status,
        startTime: new Date(now - (i + 1) * 3600000).toISOString(),
        endTime: isRunning ? undefined : new Date(now - (i + 1) * 3600000 + 120000).toISOString(),
        duration: isRunning ? undefined : Math.floor(Math.random() * 300) + 30,
        progress: isRunning ? Math.floor(Math.random() * 80) + 10 : 100,
        logs: [
          {
            timestamp: new Date().toISOString(),
            level: 'info' as LogLevel,
            message: 'Workflow execution started',
          },
          {
            timestamp: new Date().toISOString(),
            level: 'info' as LogLevel,
            message: 'Processing data...',
          },
          {
            timestamp: new Date().toISOString(),
            level: status === 'failed' ? ('error' as LogLevel) : ('info' as LogLevel),
            message:
              status === 'failed'
                ? 'Execution failed with error'
                : 'Execution completed successfully',
          },
        ],
      };
    }),
    stats: {
      totalRuns: 1247,
      successRate: 94.2,
      averageDuration: 145,
      lastRun: new Date(now - 3600000).toISOString(),
      currentlyRunning: 2,
    },
  };
};

// Custom hook for workflow data
const useWorkflowData = (workflowId: string) => {
  const [state, setState] = useState({
    workflow: null as WorkflowDetails | null,
    executions: [] as WorkflowExecution[],
    stats: null as WorkflowStats | null,
    loading: true,
    error: null as string | null,
  });

  const fetchData = async (type?: 'executions' | 'stats') => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const mockData = createMockData();

    if (type === 'executions') {
      setState((prev) => ({ ...prev, executions: mockData.executions }));
    } else if (type === 'stats') {
      setState((prev) => ({ ...prev, stats: mockData.stats }));
    } else {
      setState((prev) => ({ ...prev, executions: mockData.executions, stats: mockData.stats }));
    }
  };

  useEffect(() => {
    const loadWorkflow = async () => {
      if (!workflowId) return;
      try {
        const response = await fetch('/api/workflows/registry');
        const data = await response.json();
        const found = data.workflows.find((w: WorkflowDetails) => w.id === workflowId);

        if (found) {
          setState((prev) => ({ ...prev, workflow: found, loading: false }));
          await fetchData();
        } else {
          setState((prev) => ({ ...prev, error: 'Workflow not found', loading: false }));
        }
      } catch {
        setState((prev) => ({ ...prev, error: 'Failed to load workflow', loading: false }));
      }
    };
    loadWorkflow();
  }, [workflowId]);

  return { ...state, refetchExecutions: () => fetchData('executions') };
};

export default function WorkflowDetailPage() {
  const { id: workflowId } = useParams();
  const { workflow, executions, stats, loading, error, refetchExecutions } = useWorkflowData(
    workflowId as string,
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [triggering, { open: startTriggering, close: stopTriggering }] = useDisclosure(false);

  // Auto-refresh executions when viewing history
  const interval = useInterval(
    () => workflow && activeTab === 'history' && refetchExecutions(),
    5000,
  );

  // Auto-refresh management
  useEffect(() => {
    if (activeTab === 'history' && workflow) {
      interval.start();
      return interval.stop;
    }
    interval.stop();
  }, [activeTab, workflow]);

  // Trigger workflow handler
  const handleTriggerWorkflow = async () => {
    startTriggering();
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      notifications.show({
        title: 'Workflow Triggered',
        message: `${workflow?.name} has been started successfully`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      await refetchExecutions();
    } catch {
      notifications.show({
        title: 'Trigger Failed',
        message: 'Failed to trigger workflow. Please try again.',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      stopTriggering();
    }
  };

  if (loading) {
    return (
      <Container py="xl" size="xl">
        <LoadingOverlay visible />
        <Text>Loading workflow details...</Text>
      </Container>
    );
  }

  if (error || !workflow) {
    return (
      <Container py="xl" size="xl">
        <Stack gap="md">
          <Text c="red" size="lg">
            {error || 'Workflow not found'}
          </Text>
          <Button
            component={Link}
            href="/workflows"
            leftSection={<IconArrowLeft size={16} />}
            variant="light"
          >
            Back to Workflows
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <Button
              component={Link}
              href="/workflows"
              leftSection={<IconArrowLeft size={16} />}
              variant="subtle"
              size="sm"
            >
              Back to Workflows
            </Button>
          </Group>
          <Group>
            <ActionIcon variant="light" onClick={() => window.location.reload()} title="Refresh">
              <IconRefresh size={16} />
            </ActionIcon>
            <Button
              leftSection={<IconPlay size={16} />}
              onClick={handleTriggerWorkflow}
              disabled={!workflow.enabled}
              loading={triggering}
            >
              Trigger Workflow
            </Button>
          </Group>
        </Group>

        {/* Workflow Header Card */}
        <Card shadow="sm" withBorder padding="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Title order={1}>{workflow.name}</Title>
                <Text c="dimmed" size="lg" mt="xs">
                  {workflow.description}
                </Text>
              </div>
              <Group>
                <Badge color={workflow.enabled ? 'green' : 'gray'} variant="light" size="lg">
                  {workflow.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
                {stats?.currentlyRunning > 0 && (
                  <Badge color="blue" variant="filled">
                    {stats.currentlyRunning} Running
                  </Badge>
                )}
              </Group>
            </Group>

            <Group>
              <Badge color={getColor('category', workflow.category)} variant="light">
                {workflow.category}
              </Badge>
              <Text size="sm" c="dimmed">
                Version: {workflow.version}
              </Text>
              <Text size="sm" c="dimmed">
                ID: {workflow.id}
              </Text>
            </Group>

            {workflow.tags.length > 0 && (
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  Tags:
                </Text>
                {workflow.tags.map((tag) => (
                  <Badge key={tag} size="sm" variant="outline">
                    {tag}
                  </Badge>
                ))}
              </Group>
            )}
          </Stack>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconInfoCircle size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
              Execution History
            </Tabs.Tab>
            <Tabs.Tab value="logs" leftSection={<IconCode size={16} />}>
              Live Logs
            </Tabs.Tab>
            <Tabs.Tab value="config" leftSection={<IconSettings size={16} />}>
              Configuration
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="lg">
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Card shadow="sm" withBorder padding="lg">
                  <Stack gap="md">
                    <Title order={3}>Performance Metrics</Title>
                    {stats && (
                      <Grid>
                        <Grid.Col span={6}>
                          <RingProgress
                            size={120}
                            thickness={12}
                            sections={[
                              { value: stats.successRate, color: 'green' },
                              { value: 100 - stats.successRate, color: 'red' },
                            ]}
                            label={
                              <Text ta="center" fw={700} size="lg">
                                {stats.successRate}%
                              </Text>
                            }
                          />
                          <Text ta="center" size="sm" c="dimmed" mt="xs">
                            Success Rate
                          </Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <Stack gap="sm">
                            <div>
                              <Text fw={500}>Total Runs</Text>
                              <Text size="xl" fw={700}>
                                {stats.totalRuns.toLocaleString()}
                              </Text>
                            </div>
                            <div>
                              <Text fw={500}>Avg Duration</Text>
                              <Text size="lg">{formatDuration(stats.averageDuration)}</Text>
                            </div>
                            <div>
                              <Text fw={500}>Last Run</Text>
                              <Text size="sm" c="dimmed">
                                {stats.lastRun ? new Date(stats.lastRun).toLocaleString() : 'Never'}
                              </Text>
                            </div>
                          </Stack>
                        </Grid.Col>
                      </Grid>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card shadow="sm" withBorder padding="lg">
                  <Stack gap="md">
                    <Title order={3}>Quick Actions</Title>
                    <Button
                      fullWidth
                      leftSection={<IconPlay size={16} />}
                      onClick={handleTriggerWorkflow}
                      disabled={!workflow.enabled}
                      loading={triggering}
                    >
                      Trigger Now
                    </Button>
                    <Button variant="light" fullWidth leftSection={<IconSettings size={16} />}>
                      Edit Configuration
                    </Button>
                    <Button variant="light" fullWidth leftSection={<IconClock size={16} />}>
                      Schedule Run
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="lg">
            <Card shadow="sm" withBorder padding="lg">
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3}>Recent Executions</Title>
                  <Badge variant="light" color="blue">
                    Auto-refreshing every 5s
                  </Badge>
                </Group>

                <Timeline active={-1}>
                  {executions.map((execution) => (
                    <Timeline.Item
                      key={execution.id}
                      bullet={
                        execution.status === 'running' ? (
                          <IconClock size={12} />
                        ) : execution.status === 'completed' ? (
                          <IconCheck size={12} />
                        ) : execution.status === 'failed' ? (
                          <IconX size={12} />
                        ) : (
                          <IconClock size={12} />
                        )
                      }
                      color={getColor('status', execution.status)}
                      title={
                        <Group>
                          <Text fw={500}>Execution {execution.id}</Text>
                          <Badge size="sm" color={getColor('status', execution.status)}>
                            {execution.status}
                          </Badge>
                          {execution.status === 'running' && execution.progress && (
                            <Progress value={execution.progress} size="sm" style={{ width: 100 }} />
                          )}
                        </Group>
                      }
                    >
                      <Text size="sm" c="dimmed">
                        Started: {new Date(execution.startTime).toLocaleString()}
                      </Text>
                      {execution.duration && (
                        <Text size="sm" c="dimmed">
                          Duration: {formatDuration(execution.duration)}
                        </Text>
                      )}
                      {execution.status === 'failed' && (
                        <Alert color="red" size="sm" mt="xs">
                          <Text size="sm">Execution failed - check logs for details</Text>
                        </Alert>
                      )}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="logs" pt="lg">
            <Card shadow="sm" withBorder padding="lg">
              <Stack gap="md">
                <Title order={3}>Live Execution Logs</Title>
                <ScrollArea h={400} type="scroll">
                  <Stack gap="xs">
                    {executions
                      .filter((e) => e.status === 'running')
                      .flatMap((e) => e.logs)
                      .map((log, index) => (
                        <Group key={index} gap="xs" align="flex-start">
                          <Badge size="xs" color={getColor('log', log.level)} variant="light">
                            {log.level.toUpperCase()}
                          </Badge>
                          <Text size="xs" c="dimmed" style={{ minWidth: 150 }}>
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </Text>
                          <Text size="sm" style={{ flex: 1 }}>
                            {log.message}
                          </Text>
                        </Group>
                      ))}
                    {executions.filter((e) => e.status === 'running').length === 0 && (
                      <Text ta="center" c="dimmed" py="xl">
                        No active executions - trigger a workflow to see live logs
                      </Text>
                    )}
                  </Stack>
                </ScrollArea>
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="config" pt="lg">
            <Card shadow="sm" withBorder padding="lg">
              <Stack gap="md">
                <Title order={3}>Workflow Configuration</Title>
                <Code block>
                  {JSON.stringify(
                    {
                      id: workflow.id,
                      name: workflow.name,
                      category: workflow.category,
                      enabled: workflow.enabled,
                      version: workflow.version,
                      tags: workflow.tags,
                      schedule: '0 */6 * * *', // Every 6 hours
                      retryPolicy: {
                        maxRetries: 3,
                        backoffMultiplier: 2,
                      },
                      timeout: '30m',
                      resources: {
                        cpu: '500m',
                        memory: '1Gi',
                      },
                    },
                    null,
                    2,
                  )}
                </Code>
                <Group>
                  <Button variant="light">Edit Configuration</Button>
                  <Button variant="light">Export Config</Button>
                </Group>
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>

        {/* Metadata Footer */}
        <Card shadow="sm" withBorder padding="lg">
          <Group justify="space-between">
            <Group>
              <div>
                <Text size="sm" fw={500}>
                  Created
                </Text>
                <Text size="sm" c="dimmed">
                  {new Date(workflow.createdAt).toLocaleString()}
                </Text>
              </div>
              <div>
                <Text size="sm" fw={500}>
                  Last Updated
                </Text>
                <Text size="sm" c="dimmed">
                  {new Date(workflow.updatedAt).toLocaleString()}
                </Text>
              </div>
            </Group>
            {activeTab === 'history' && (
              <Badge variant="dot" color="green">
                Live Updates Active
              </Badge>
            )}
          </Group>
        </Card>
      </Stack>
    </Container>
  );
}
