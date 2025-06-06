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
  List,
  LoadingOverlay,
  Paper,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
  Title,
  Tooltip,
} from '@mantine/core';
import { useSet } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconExternalLink,
  IconPhoto,
  IconPlayerPlay,
  IconPlayerStop,
  IconRobot,
  IconSettings,
  IconStack2,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';

import type { WorkflowMetadata } from '@/workflows/types';

interface SerializableDefinition {
  defaultPayload?: any;
  metadata: WorkflowMetadata;
}

interface WorkflowPageProps {
  definition: SerializableDefinition;
  slug: string;
}

// Icon mapping based on workflow type
const iconMap: Record<string, any> = {
  basic: IconStack2,
  'chart-pdps': IconPhoto,
  'chart-sitemaps': IconSettings,
  'gen-copy': IconSettings,
  'image-processing': IconPhoto,
  'import-external-media': IconUpload,
  'kitchen-sink': IconSettings,
  'map-taxterm': IconSettings,
  'product-classification': IconRobot,
};

// Color mapping based on workflow type
const colorMap: Record<string, string> = {
  basic: 'blue',
  'chart-pdps': 'pink',
  'chart-sitemaps': 'indigo',
  'gen-copy': 'violet',
  'image-processing': 'teal',
  'import-external-media': 'cyan',
  'kitchen-sink': 'grape',
  'map-taxterm': 'lime',
  'product-classification': 'orange',
};

export default function WorkflowPage({ definition, slug }: WorkflowPageProps) {
  const {
    cancelWorkflow,
    filteredRuns,
    loading,
    optimisticWorkflows,
    sseConnected,
    triggerWorkflowWithExample,
  } = useWorkflow();

  const [payload, setPayload] = useState<string>(
    JSON.stringify(definition.defaultPayload || {}, null, 2),
  );
  const [isTriggering, setIsTriggering] = useState(false);
  const expandedRuns = useSet<string>();

  const metadata = definition.metadata;
  const IconComponent = iconMap[slug] || IconSettings;
  const workflowColor = metadata.color || colorMap[slug] || 'blue';

  // Filter runs for this specific workflow
  const workflowRuns = filteredRuns.filter((run) =>
    run.workflowUrl.includes(`/api/workflows/${slug}`),
  );

  // Get running workflows for this type
  const runningWorkflows = Object.entries(optimisticWorkflows)
    .filter(([endpoint]) => endpoint.includes(`/api/workflows/${slug}`))
    .filter(([_, w]: [string, any]) => w.status === 'running')
    .map(([endpoint, workflowData]: [string, any]) => ({
      ...workflowData,
      endpoint,
    }));

  const handleTriggerWorkflow = async () => {
    try {
      setIsTriggering(true);
      const parsedPayload = JSON.parse(payload);

      await triggerWorkflowWithExample(
        {
          id: metadata.id,
          color: workflowColor,
          description: metadata.description,
          difficulty: metadata.difficulty || 'Unknown',
          endpoint: `/api/workflows/${slug}`,
          estimatedTime: metadata.estimatedTime || 'Unknown',
          features: metadata.features || [],
          tags: metadata.tags || [],
          title: metadata.title,
        },
        parsedPayload,
      );
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
    } finally {
      setIsTriggering(false);
    }
  };

  const toggleRunExpanded = (runId: string) => {
    if (expandedRuns.has(runId)) {
      expandedRuns.delete(runId);
    } else {
      expandedRuns.add(runId);
    }
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
        {/* Header */}
        <div>
          <Group align="center" mb="md">
            <IconComponent size={32} />
            <div>
              <Title order={1}>{metadata.title}</Title>
              <Text c="dimmed">{metadata.description}</Text>
            </div>
          </Group>

          <Group gap="sm" mb="md">
            <Badge color={workflowColor} variant="light">
              {metadata.difficulty}
            </Badge>
            {metadata.estimatedTime && (
              <Badge color="green" variant="light">
                ~{metadata.estimatedTime}
              </Badge>
            )}
            {metadata.features?.slice(0, 3).map((feature) => (
              <Badge key={feature} color="gray" size="sm" variant="outline">
                {feature}
              </Badge>
            ))}
          </Group>
        </div>

        {/* Features List */}
        {metadata.features && metadata.features.length > 0 && (
          <Alert color={workflowColor} title="This workflow includes:">
            <List size="sm" spacing="xs">
              {metadata.features.map((feature, index) => (
                <List.Item key={index}>{feature}</List.Item>
              ))}
            </List>
          </Alert>
        )}

        {/* Trigger Section */}
        <Card shadow="sm" withBorder padding="lg">
          <LoadingOverlay visible={isTriggering} />
          <Stack gap="md">
            <Title order={3}>Trigger {metadata.title}</Title>

            <JsonInput
              validationError="Invalid JSON"
              description={`Customize the payload for ${metadata.title.toLowerCase()}`}
              formatOnBlur
              maxRows={15}
              minRows={8}
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

            <Button
              fullWidth
              color={workflowColor}
              leftSection={<IconPlayerPlay size={16} />}
              loading={isTriggering}
              onClick={handleTriggerWorkflow}
              disabled={isTriggering}
              size="md"
            >
              Trigger {metadata.title}
            </Button>
          </Stack>
        </Card>

        {/* Active Workflows */}
        {runningWorkflows.length > 0 && (
          <Alert color={workflowColor} title={`Active ${metadata.title}s`}>
            <Stack gap="sm">
              {runningWorkflows.map((workflowInstance: any, index: number) => (
                <Paper
                  key={workflowInstance.workflowRunId || `workflow-${index}`}
                  withBorder
                  p="sm"
                >
                  <Group justify="space-between">
                    <div>
                      <Text fw={500} size="sm">
                        {metadata.title}
                      </Text>
                      <Code>{workflowInstance.workflowRunId}</Code>
                    </div>
                    <Group gap="xs">
                      {workflowInstance.totalSteps > 0 && (
                        <Progress
                          color={workflowColor}
                          animated
                          size="xl"
                          striped
                          value={workflowInstance.progress}
                          w={100}
                        />
                      )}
                      <Anchor
                        href={`/api/client/logs?workflowRunId=${workflowInstance.workflowRunId}`}
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

        {/* Monitor Section */}
        <Card shadow="sm" withBorder padding="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Monitor {metadata.title}s</Title>
              <Group gap="xs">
                {!sseConnected && (
                  <Badge color="red" size="sm" variant="dot">
                    Disconnected
                  </Badge>
                )}
                <Button
                  leftSection={<IconAlertCircle size={14} />}
                  onClick={() => window.location.reload()}
                  size="xs"
                  variant="subtle"
                >
                  Refresh
                </Button>
              </Group>
            </Group>

            {!sseConnected && (
              <Alert color="yellow" icon={<IconAlertCircle />} mb="md">
                <Text size="sm">
                  SSE connection lost. Make sure the dev server is running with `pnpm dev`
                </Text>
              </Alert>
            )}

            {workflowRuns.length === 0 ? (
              <Stack gap="md" py="xl">
                <Text c="dimmed" ta="center">
                  No {metadata.title.toLowerCase()} runs found. Trigger one above to see it here.
                </Text>
                <Alert color="blue" icon={<IconAlertCircle />}>
                  <Text fw={500} size="sm">
                    Make sure QStash CLI is running:
                  </Text>
                  <Text c="dimmed" mt="xs" size="xs">
                    The development server should automatically start QStash CLI on port 8080. If
                    you're still having issues, check that both servers are running:
                  </Text>
                  <Code block mt="sm" size="xs">
                    pnpm dev # This runs both Next.js and QStash CLI
                  </Code>
                  <Group mt="xs">
                    <Button
                      href="/api/test-qstash"
                      component="a"
                      size="xs"
                      target="_blank"
                      variant="light"
                    >
                      Test QStash Connection
                    </Button>
                  </Group>
                </Alert>
              </Stack>
            ) : (
              <Stack gap="sm">
                {workflowRuns.map((run: any) => {
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
                                {metadata.title}
                              </Text>
                              <Code>{run.workflowRunId}</Code>
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

                        {/* Show workflow progress summary */}
                        <Group justify="space-between" mb="md">
                          <Text c="dimmed" size="sm">
                            Workflow Progress
                          </Text>
                          <Group gap="xs">
                            {run.steps.map((stepGroup: any, idx: number) => {
                              const hasSuccess = stepGroup.steps?.some(
                                (s: any) => s.state === 'STEP_SUCCESS',
                              );
                              const hasRetry = stepGroup.steps?.some(
                                (s: any) => s.state === 'STEP_RETRY',
                              );
                              const hasFailed = stepGroup.steps?.some(
                                (s: any) => s.state === 'STEP_FAILED',
                              );
                              const stepCount = stepGroup.steps?.length || 0;

                              return (
                                <Tooltip
                                  key={idx}
                                  label={`${stepCount} step(s) in ${stepGroup.type} group`}
                                >
                                  <Badge
                                    color={
                                      hasSuccess
                                        ? 'green'
                                        : hasRetry
                                          ? 'orange'
                                          : hasFailed
                                            ? 'red'
                                            : 'gray'
                                    }
                                    size="xs"
                                    variant="light"
                                  >
                                    {stepGroup.type || `Step ${idx + 1}`}
                                  </Badge>
                                </Tooltip>
                              );
                            })}
                          </Group>
                        </Group>

                        <Timeline lineWidth={2} active={-1} bulletSize={20}>
                          {run.steps && Array.isArray(run.steps) && run.steps.length > 0 ? (
                            // Check if we have actual step details
                            run.steps.some((sg) => sg.steps && sg.steps.length > 0) ? (
                              run.steps.flatMap((stepGroup: any, groupIndex: number) => {
                                // stepGroup has { steps: [...], type: 'single' | 'parallel' | 'batch' }
                                const innerSteps = stepGroup.steps || [];

                                return innerSteps.map((step: any, stepIndex: number) => {
                                  // For retry steps, they might only have messageId and state
                                  const stepName =
                                    step.stepName ||
                                    (step.state === 'STEP_RETRY'
                                      ? 'Retrying previous step'
                                      : 'Processing');
                                  const uniqueKey = `${run.workflowRunId}-${groupIndex}-${stepIndex}-${stepName}`;

                                  // Handle both old and new step formats
                                  const isCompleted =
                                    step.status === 'completed' ||
                                    step.state === 'STEP_SUCCESS' ||
                                    step.completedAt;
                                  const isFailed =
                                    step.status === 'failed' || step.state === 'STEP_FAILED';
                                  const isRetrying = step.state === 'STEP_RETRY';
                                  const isPending =
                                    step.state === 'STEP_PENDING' || (!step.state && !step.status);
                                  const isRunning =
                                    !isCompleted &&
                                    !isFailed &&
                                    !isRetrying &&
                                    !isPending &&
                                    (step.startedAt || step.createdAt);

                                  return (
                                    <Timeline.Item
                                      key={uniqueKey}
                                      bullet={
                                        isCompleted ? (
                                          <ThemeIcon color="green" radius="xl" size={20}>
                                            <IconCheck size={12} />
                                          </ThemeIcon>
                                        ) : isFailed ? (
                                          <ThemeIcon color="red" radius="xl" size={20}>
                                            <IconX size={12} />
                                          </ThemeIcon>
                                        ) : isRetrying ? (
                                          <ThemeIcon color="orange" radius="xl" size={20}>
                                            <IconAlertCircle size={12} />
                                          </ThemeIcon>
                                        ) : isRunning ? (
                                          <ThemeIcon color="blue" radius="xl" size={20}>
                                            <IconClock size={12} />
                                          </ThemeIcon>
                                        ) : (
                                          <ThemeIcon color="gray" radius="xl" size={20}>
                                            <IconClock size={12} />
                                          </ThemeIcon>
                                        )
                                      }
                                      title={
                                        <Group gap="xs">
                                          <Text fw={500}>{stepName}</Text>
                                          {stepGroup.type === 'parallel' && (
                                            <Badge size="xs" variant="light">
                                              Parallel
                                            </Badge>
                                          )}
                                          {stepGroup.type === 'batch' && (
                                            <Badge size="xs" variant="light">
                                              Batch
                                            </Badge>
                                          )}
                                          {stepGroup.type === 'next' && isRetrying && (
                                            <Badge color="orange" size="xs" variant="light">
                                              Next Step
                                            </Badge>
                                          )}
                                        </Group>
                                      }
                                    >
                                      <Stack gap={4}>
                                        {step.stepType && (
                                          <Text c="dimmed" size="xs">
                                            Type: {step.stepType || step.callType}
                                          </Text>
                                        )}
                                        <Text c="dimmed" size="xs">
                                          State: {step.state || step.status || 'Unknown'}
                                        </Text>
                                        {(step.startedAt || step.createdAt) && (
                                          <Text c="dimmed" size="xs">
                                            Started:{' '}
                                            {new Date(
                                              step.startedAt || step.createdAt,
                                            ).toLocaleString()}
                                          </Text>
                                        )}
                                        {step.completedAt && (
                                          <Text c="dimmed" size="xs">
                                            Completed: {new Date(step.completedAt).toLocaleString()}
                                          </Text>
                                        )}
                                        {step.completedAt && (step.startedAt || step.createdAt) && (
                                          <Text c="dimmed" size="xs">
                                            Duration:{' '}
                                            {formatDuration(
                                              step.startedAt || step.createdAt,
                                              step.completedAt,
                                            )}
                                          </Text>
                                        )}
                                        {step.messageId && (
                                          <Text c="dimmed" size="xs">
                                            Message: {step.messageId.substring(0, 20)}...
                                          </Text>
                                        )}
                                        {isRetrying && (
                                          <Alert
                                            color="orange"
                                            mt="xs"
                                            p="xs"
                                            title="Step Retrying"
                                          >
                                            <Stack gap="xs">
                                              <Text size="xs">
                                                This step is being retried. Common causes:
                                              </Text>
                                              <List size="xs" withPadding>
                                                <List.Item>
                                                  Network timeout or connection issue
                                                </List.Item>
                                                <List.Item>Step logic throwing an error</List.Item>
                                                <List.Item>Missing environment variables</List.Item>
                                                <List.Item>QStash message delivery retry</List.Item>
                                              </List>
                                              <Text c="dimmed" size="xs">
                                                Check the console logs and the "View Raw Logs" link
                                                for more details.
                                              </Text>
                                            </Stack>
                                          </Alert>
                                        )}
                                        {step.error && (
                                          <Alert color="red" mt="xs" p="xs">
                                            <Text size="xs">{step.error}</Text>
                                          </Alert>
                                        )}
                                        {step.out && (
                                          <details>
                                            <summary style={{ cursor: 'pointer' }}>
                                              <Text c="dimmed" size="xs">
                                                Step output
                                              </Text>
                                            </summary>
                                            <Code block mt="xs" size="xs">
                                              {typeof step.out === 'string'
                                                ? step.out
                                                : JSON.stringify(step.out, null, 2)}
                                            </Code>
                                          </details>
                                        )}
                                      </Stack>
                                    </Timeline.Item>
                                  );
                                });
                              })
                            ) : (
                              // Workflow is starting but no step details yet
                              <Timeline.Item
                                bullet={
                                  <ThemeIcon color="blue" radius="xl" size={20}>
                                    <IconClock size={12} />
                                  </ThemeIcon>
                                }
                                title="Initializing workflow..."
                              >
                                <Text c="dimmed" size="xs">
                                  The workflow has been triggered and is starting up. Step details
                                  will appear shortly.
                                </Text>
                              </Timeline.Item>
                            )
                          ) : (
                            <Text c="dimmed" py="md" size="sm" ta="center">
                              No workflow steps found. The workflow may not have started yet.
                            </Text>
                          )}
                        </Timeline>

                        <Group justify="flex-end" mt="md">
                          <Anchor
                            href={`/api/client/logs?workflowRunId=${run.workflowRunId}`}
                            size="sm"
                            target="_blank"
                          >
                            View Raw Logs
                            <IconExternalLink style={{ marginLeft: 4 }} size={14} />
                          </Anchor>
                          {process.env.NODE_ENV === 'development' && (
                            <Anchor
                              href="http://localhost:8080/workflows"
                              size="sm"
                              target="_blank"
                            >
                              QStash Local Dashboard
                              <IconExternalLink style={{ marginLeft: 4 }} size={14} />
                            </Anchor>
                          )}
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
                })}
              </Stack>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
