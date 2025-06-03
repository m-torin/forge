'use client';

import { useWorkflow } from '@/contexts/workflow-context';
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Code,
  Collapse,
  Container,
  Divider,
  Group,
  JsonInput,
  LoadingOverlay,
  Paper,
  Progress,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Timeline,
  Title,
  Tooltip,
} from '@mantine/core';
import { CopyButton } from '@mantine/core';
import { useSet } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconCopy,
  IconExternalLink,
  IconHistory,
  IconPlayerPlay,
  IconPlayerStop,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { useFlag } from '@repo/analytics';
import {
  useAnalytics,
  useObservability,
  usePerformanceTimer,
  useUIAnalytics,
  useWorkflowAnalytics,
} from '@repo/observability';

// Simple workflow options
const WORKFLOW_OPTIONS = [
  { label: 'Basic Workflow', value: 'basic' },
  { label: 'Product Classification', value: 'product-classification' },
  { label: 'Image Processing', value: 'image-processing' },
  { label: 'Import External Media', value: 'import-external-media' },
  { label: 'Kitchen Sink Demo', value: 'kitchen-sink' },
];

const DEFAULT_PAYLOADS: Record<string, any> = {
  basic: {
    name: 'Test Task',
    taskId: `task-${Date.now()}`,
  },
  'image-processing': {
    imageUrl: 'https://example.com/image.jpg',
    options: {
      outputFormat: 'webp',
      quality: 85,
    },
  },
  'import-external-media': {
    destination: {
      type: 'local',
      path: '/uploads/imported-media',
    },
    notifications: {
      onFailure: ['admin@example.com'],
      onSuccess: ['admin@example.com'],
    },
    processing: {
      autoResize: true,
      extractMetadata: true,
      generateThumbnails: true,
      optimizeForWeb: true,
      virusScan: true,
    },
    sources: [
      {
        type: 'url',
        url: 'https://example.com/media-assets',
        filters: {
          fileTypes: ['jpg', 'png', 'mp4', 'pdf'],
          sizeLimit: 50,
        },
      },
    ],
    userId: 'demo-user-123',
  },
  'kitchen-sink': {
    name: 'Demo Task',
    options: {
      mode: 'full',
    },
    taskId: `task-${Date.now()}`,
  },
  'product-classification': {
    options: {
      classificationMethod: 'hybrid',
    },
    product: {
      id: `prod-${Date.now()}`,
      description: 'Test product for classification',
      title: 'Sample Product',
    },
  },
};

export default function WorkersPage() {
  const {
    cancelWorkflow,
    filteredRuns,
    filters,
    loading,
    optimisticWorkflows,
    setFilters,
    sseConnected,
    triggerWorkflowWithExample,
  } = useWorkflow();

  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('basic');
  const [payload, setPayload] = useState<string>(JSON.stringify(DEFAULT_PAYLOADS.basic, null, 2));
  const [isTriggering, setIsTriggering] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const expandedRuns = useSet<string>();

  // Observability and analytics hooks
  const { trackPage } = useAnalytics();
  const { trackWorkflowError, trackWorkflowStart, trackWorkflowView } =
    useWorkflowAnalytics('workers-dashboard');
  const { trackClick, trackSubmit } = useUIAnalytics();
  const { trackError, trackEvent } = useObservability();
  const { time } = usePerformanceTimer();

  // Feature flags
  const workflowsEnabled = useFlag('workflows.monitoring');

  const runningWorkflows = Object.values(optimisticWorkflows).filter(
    (w: any) => w.status === 'running',
  );

  useEffect(() => {
    // Track page view and dashboard access
    trackPage('workers_dashboard');
    trackWorkflowView({
      activeWorkflows: runningWorkflows.length,
      sseConnected,
      totalRuns: filteredRuns.length,
    });
    trackEvent({
      action: 'view',
      category: 'workflow',
      label: 'workers_dashboard',
      metadata: { sseConnected, workflowsEnabled },
    });
  }, [
    trackPage,
    trackWorkflowView,
    trackEvent,
    sseConnected,
    workflowsEnabled,
    filteredRuns.length,
    runningWorkflows.length,
  ]);

  const handleWorkflowChange = (value: string | null) => {
    if (value) {
      setSelectedWorkflow(value);
      setPayload(JSON.stringify(DEFAULT_PAYLOADS[value] || {}, null, 2));

      // Track workflow selection
      trackClick('workflow_selector', {
        previousWorkflow: selectedWorkflow,
        selectedWorkflow: value,
      });
      trackEvent({
        action: 'select',
        category: 'workflow',
        label: value,
        metadata: { context: 'trigger_form' },
      });
    }
  };

  const handleTriggerWorkflow = async () => {
    const workflowId = `${selectedWorkflow}-${Date.now()}`;

    try {
      setIsTriggering(true);

      // Track workflow start
      trackWorkflowStart(workflowId, {
        payloadSize: payload.length,
        workflowType: selectedWorkflow,
      });
      trackSubmit('workflow_trigger_form', { workflowType: selectedWorkflow });

      // Time the workflow trigger operation
      await time(
        'trigger_workflow',
        async () => {
          const parsedPayload = JSON.parse(payload);
          await triggerWorkflowWithExample(
            {
              id: selectedWorkflow,
              color: 'blue',
              description: '',
              difficulty: '',
              endpoint: `/api/workflows/${selectedWorkflow}`,
              estimatedTime: '',
              features: [],
              tags: [],
              title: selectedWorkflow,
            },
            parsedPayload,
          );
        },
        { workflowType: selectedWorkflow },
      );
    } catch (error) {
      console.error('Failed to trigger workflow:', error);

      // Track errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      trackWorkflowError(workflowId, errorMessage, { workflowType: selectedWorkflow });
      trackError(error instanceof Error ? error : new Error(errorMessage), {
        component: 'WorkflowTrigger',
        metadata: { payloadSize: payload.length, workflowId },
        workflow: selectedWorkflow,
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const toggleRunExpanded = (runId: string) => {
    const isExpanding = !expandedRuns.has(runId);

    if (expandedRuns.has(runId)) {
      expandedRuns.delete(runId);
    } else {
      expandedRuns.add(runId);
    }

    // Track UI interaction
    trackClick('workflow_run_toggle', {
      action: isExpanding ? 'expand' : 'collapse',
      runId,
    });
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'RUN_SUCCESS':
        return <IconCircleCheck color="green" size={16} />;
      case 'RUN_FAILED':
        return <IconCircleX color="red" size={16} />;
      case 'RUN_CANCELED':
        return <IconAlertCircle color="orange" size={16} />;
      default:
        return <IconClock color="blue" size={16} />;
    }
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'RUN_SUCCESS':
        return 'green';
      case 'RUN_FAILED':
        return 'red';
      case 'RUN_CANCELED':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const formatDuration = (start: number, end?: number) => {
    if (!end) return 'Running...';
    const duration = end - start;
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}m`;
  };

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <div>
          <Group align="center" justify="space-between" mb="md">
            <Title order={1}>Workflow Dashboard</Title>
            <Badge color={sseConnected ? 'green' : 'red'} variant="dot">
              {sseConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </Group>
          <Text c="dimmed">Trigger workflows and monitor their execution in real-time</Text>
        </div>

        <Tabs defaultValue="trigger" variant="outline">
          <Tabs.List>
            <Tabs.Tab
              leftSection={<IconPlayerPlay size={16} />}
              rightSection={
                runningWorkflows.length > 0 && (
                  <Badge color="blue" circle size="xs" variant="filled">
                    {runningWorkflows.length}
                  </Badge>
                )
              }
              value="trigger"
            >
              Trigger
            </Tabs.Tab>
            <Tabs.Tab
              leftSection={<IconHistory size={16} />}
              rightSection={
                filteredRuns.length > 0 && (
                  <Badge circle size="xs" variant="filled">
                    {filteredRuns.length}
                  </Badge>
                )
              }
              value="monitor"
            >
              Monitor
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel pt="md" value="trigger">
            <Stack gap="lg">
              {/* Workflow Trigger Card */}
              <Card shadow="sm" withBorder padding="lg">
                <LoadingOverlay visible={isTriggering} />
                <Stack gap="md">
                  <Select
                    onChange={handleWorkflowChange}
                    placeholder="Choose a workflow to trigger"
                    data={WORKFLOW_OPTIONS}
                    label="Select Workflow"
                    size="md"
                    value={selectedWorkflow}
                  />

                  <JsonInput
                    validationError="Invalid JSON"
                    description="Edit the JSON payload for this workflow"
                    formatOnBlur
                    maxRows={20}
                    minRows={10}
                    onChange={setPayload}
                    placeholder="Enter JSON payload"
                    styles={{
                      input: {
                        fontFamily: 'monospace',
                        fontSize: '12px',
                      },
                    }}
                    label="Payload"
                    value={payload}
                  />

                  {selectedWorkflow === 'import-external-media' && (
                    <Textarea
                      autosize
                      description="Paste URLs, markdown content, or batch import configuration here"
                      maxRows={25}
                      minRows={15}
                      onChange={(e) => setMarkdownContent(e.currentTarget.value)}
                      placeholder={`Paste your content here:

Examples:
- URLs (one per line):
https://example.com/image1.jpg
https://example.com/image2.png

- Markdown content with images:
# My Document
![Image](https://example.com/image.jpg)

- Batch configuration:
source1: https://cdn.example.com/media/
source2: ftp://media.company.com/assets/
filter: jpg,png,mp4
size_limit: 100MB`}
                      styles={{
                        input: {
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          lineHeight: '1.5',
                        },
                      }}
                      label="Markdown Content / Import Sources"
                      value={markdownContent}
                    />
                  )}

                  <Button
                    fullWidth
                    leftSection={<IconPlayerPlay size={16} />}
                    loading={isTriggering}
                    onClick={handleTriggerWorkflow}
                    disabled={!selectedWorkflow || isTriggering}
                    size="md"
                  >
                    Trigger Workflow
                  </Button>
                </Stack>
              </Card>

              {/* Active Workflows */}
              {runningWorkflows.length > 0 && (
                <Alert color="blue" title="Active Workflows">
                  <Stack gap="sm">
                    {runningWorkflows.map((workflow: any) => (
                      <Paper key={workflow.workflowRunId} withBorder p="sm">
                        <Group justify="space-between">
                          <div>
                            <Text fw={500} size="sm">
                              {workflow.endpoint.split('/').pop()}
                            </Text>
                            <Code>{workflow.workflowRunId}</Code>
                          </div>
                          <Group gap="xs">
                            {workflow.totalSteps > 0 && (
                              <Progress
                                animated
                                size="xl"
                                striped
                                value={workflow.progress}
                                w={100}
                              />
                            )}
                            <Anchor
                              href={`/api/client/logs?workflowRunId=${workflow.workflowRunId}`}
                              size="xs"
                              target="_blank"
                            >
                              Logs
                            </Anchor>
                          </Group>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </Alert>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="monitor">
            <Stack gap="md">
              {/* Search Filters */}
              <Paper withBorder p="sm">
                <Group>
                  <TextInput
                    leftSection={<IconSearch size={16} />}
                    onChange={(e) => setFilters({ workflowUrl: e.currentTarget.value })}
                    placeholder="Filter by workflow URL"
                    style={{ flex: 1 }}
                    value={filters.workflowUrl}
                  />
                  <TextInput
                    leftSection={<IconSearch size={16} />}
                    onChange={(e) => setFilters({ runId: e.currentTarget.value })}
                    placeholder="Filter by run ID"
                    style={{ flex: 1 }}
                    value={filters.runId}
                  />
                </Group>
              </Paper>

              {/* Workflow Runs */}
              <Stack gap="sm">
                {filteredRuns.length === 0 ? (
                  <Text c="dimmed" py="xl" ta="center">
                    No workflow runs found
                  </Text>
                ) : (
                  filteredRuns.map((run: any) => {
                    const isExpanded = expandedRuns.has(run.workflowRunId);

                    return (
                      <Card key={run.workflowRunId} shadow="sm" withBorder p="sm" radius="md">
                        <LoadingOverlay visible={loading.get(run.workflowRunId) || false} />

                        <Group
                          onClick={() => toggleRunExpanded(run.workflowRunId)}
                          style={{ cursor: 'pointer' }}
                          justify="space-between"
                          mb={isExpanded ? 'md' : 0}
                        >
                          <Group>
                            <ActionIcon
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRunExpanded(run.workflowRunId);
                              }}
                              size="sm"
                              variant="subtle"
                            >
                              {isExpanded ? (
                                <IconChevronDown size={16} />
                              ) : (
                                <IconChevronRight size={16} />
                              )}
                            </ActionIcon>

                            <Group gap="xs">
                              {getStatusIcon(run.workflowState)}
                              <div>
                                <Text fw={500} size="sm">
                                  {run.workflowUrl.split('/').pop()}
                                </Text>
                                <Group gap="xs">
                                  <Code>{run.workflowRunId}</Code>
                                  <CopyButton value={run.workflowRunId}>
                                    {({ copied, copy }) => (
                                      <Tooltip label={copied ? 'Copied!' : 'Copy ID'}>
                                        <ActionIcon
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            copy();
                                          }}
                                          size="xs"
                                          variant="subtle"
                                        >
                                          <IconCopy size={12} />
                                        </ActionIcon>
                                      </Tooltip>
                                    )}
                                  </CopyButton>
                                </Group>
                              </div>
                            </Group>
                          </Group>

                          <Group>
                            <Badge color={getStatusColor(run.workflowState)} variant="light">
                              {run.workflowState.replace('RUN_', '')}
                            </Badge>
                            <Text c="dimmed" size="xs">
                              {formatDuration(run.workflowRunCreatedAt, run.workflowRunCompletedAt)}
                            </Text>
                            {run.workflowState === 'RUN_STARTED' && (
                              <Tooltip label="Cancel workflow">
                                <ActionIcon
                                  color="red"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelWorkflow(run.workflowRunId);
                                  }}
                                  size="sm"
                                  variant="subtle"
                                >
                                  <IconPlayerStop size={16} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </Group>
                        </Group>

                        <Collapse in={isExpanded}>
                          <Divider mb="md" />

                          <Timeline lineWidth={2} active={-1} bulletSize={20}>
                            {run.steps?.flatMap(
                              (stepGroup: any, groupIndex: number) =>
                                stepGroup.steps?.map((step: any, stepIndex: number) => {
                                  const uniqueKey = `${run.workflowRunId}-${groupIndex}-${stepIndex}-${step.stepName}`;
                                  return (
                                    <Timeline.Item
                                      key={uniqueKey}
                                      bullet={
                                        step.status === 'completed' ? (
                                          <ThemeIcon color="green" radius="xl" size={20}>
                                            <IconCheck size={12} />
                                          </ThemeIcon>
                                        ) : step.status === 'failed' ? (
                                          <ThemeIcon color="red" radius="xl" size={20}>
                                            <IconX size={12} />
                                          </ThemeIcon>
                                        ) : (
                                          <ThemeIcon color="blue" radius="xl" size={20}>
                                            <IconClock size={12} />
                                          </ThemeIcon>
                                        )
                                      }
                                      title={step.stepName}
                                    >
                                      <Text c="dimmed" size="xs">
                                        {step.startedAt
                                          ? new Date(Number(step.startedAt)).toLocaleString()
                                          : 'N/A'}
                                      </Text>
                                      {step.error && (
                                        <Alert color="red" mt="xs" p="xs">
                                          <Text size="xs">{step.error}</Text>
                                        </Alert>
                                      )}
                                    </Timeline.Item>
                                  );
                                }) || [],
                            )}
                          </Timeline>

                          <Group justify="flex-end" mt="md">
                            <Anchor
                              href={`https://console.upstash.com/qstash?tab=workflows&workflowRunId=${run.workflowRunId}`}
                              size="sm"
                              target="_blank"
                            >
                              View in QStash Console
                              <IconExternalLink style={{ marginLeft: 4 }} size={14} />
                            </Anchor>
                          </Group>
                        </Collapse>
                      </Card>
                    );
                  })
                )}
              </Stack>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
