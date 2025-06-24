'use client';

import { useState, useEffect } from 'react';
import {
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Badge,
  Button,
  Timeline,
  LoadingOverlay,
  Alert,
  Accordion,
  Code,
  ActionIcon,
  Tooltip,
  Table,
  Progress,
} from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconRefresh,
  IconX,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconPlayerStop,
  IconEye,
} from '@tabler/icons-react';
import {
  getWorkflowStatusAction,
  listWorkflowsAction,
  cancelWorkflowAction,
} from '../workflows/customer-onboarding';
import type { WorkflowExecution, WorkflowStatus as Status } from '../workflows/customer-onboarding';

interface WorkflowStatusProps {
  workflowRunId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const STATUS_COLORS: Record<Status, string> = {
  pending: 'gray',
  running: 'blue',
  completed: 'green',
  failed: 'red',
  cancelled: 'orange',
};

const STATUS_ICONS: Record<Status, React.ReactNode> = {
  pending: <IconClock size={16} />,
  running: <IconClock size={16} />,
  completed: <IconCheck size={16} />,
  failed: <IconAlertTriangle size={16} />,
  cancelled: <IconPlayerStop size={16} />,
};

export function WorkflowStatus({
  workflowRunId,
  autoRefresh = true,
  refreshInterval = 5000,
}: WorkflowStatusProps) {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<string | null>(workflowRunId || null);

  // Auto-refresh interval
  const interval = useInterval(async () => {
    if (autoRefresh && (selectedExecution || !workflowRunId)) {
      await refreshData();
    }
  }, refreshInterval);

  useEffect(() => {
    refreshData();
    if (autoRefresh) {
      interval.start();
    }
    return interval.stop;
  }, [selectedExecution]);

  const refreshData = async () => {
    if (selectedExecution) {
      await fetchWorkflowStatus(selectedExecution);
    } else {
      await fetchWorkflowList();
    }
  };

  const fetchWorkflowStatus = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getWorkflowStatusAction(id);

      if (result.success && result.execution) {
        setExecution(result.execution);
      } else {
        setError(result.error || 'Failed to fetch workflow status');
        setExecution(null);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setExecution(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowList = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await listWorkflowsAction({ count: 10 });

      if (result.success && result.data) {
        setExecutions(result.data.workflows);
      } else {
        setError(result.error || 'Failed to fetch workflow list');
        setExecutions([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWorkflow = async (id: string) => {
    try {
      const result = await cancelWorkflowAction(id);

      if (result.success) {
        notifications.show({
          title: 'Workflow Cancelled',
          message: 'The workflow has been cancelled successfully',
          color: 'orange',
          icon: <IconPlayerStop size={16} />,
        });

        // Refresh data to show updated status
        await refreshData();
      } else {
        throw new Error(result.error || 'Failed to cancel workflow');
      }
    } catch (err: any) {
      notifications.show({
        title: 'Failed to Cancel Workflow',
        message: err.message || 'An unexpected error occurred',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const calculateProgress = (exec: WorkflowExecution) => {
    if (exec.status === 'completed') return 100;
    if (exec.status === 'failed' || exec.status === 'cancelled') return 100;

    const completedSteps = exec.steps.filter((step) => step.status === 'completed').length;
    const totalSteps = exec.steps.length;

    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  };

  if (!selectedExecution) {
    return (
      <Paper p="md" withBorder radius="md" pos="relative">
        <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 2 }} />

        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>Recent Workflows</Title>
            <ActionIcon variant="light" onClick={refreshData} disabled={loading}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>

          {error && (
            <Alert color="red" title="Error">
              {error}
            </Alert>
          )}

          {executions.length === 0 && !loading && !error && (
            <Alert color="blue" title="No Workflows">
              No workflows have been executed yet. Trigger your first workflow to see it here!
            </Alert>
          )}

          {executions.length > 0 && (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Progress</Table.Th>
                  <Table.Th>Started</Table.Th>
                  <Table.Th>Duration</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {executions.map((exec) => (
                  <Table.Tr key={exec.workflowRunId}>
                    <Table.Td>
                      <Code>{exec.workflowRunId}</Code>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={STATUS_COLORS[exec.status]}
                        variant="light"
                        leftSection={STATUS_ICONS[exec.status]}
                      >
                        {exec.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Progress
                          value={calculateProgress(exec)}
                          size="sm"
                          style={{ width: 60 }}
                          color={STATUS_COLORS[exec.status]}
                        />
                        <Text size="xs">
                          {exec.steps.filter((s) => s.status === 'completed').length}/
                          {exec.steps.length}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{exec.startedAt.toLocaleString()}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">
                        {exec.completedAt
                          ? formatDuration(exec.completedAt.getTime() - exec.startedAt.getTime())
                          : formatDuration(Date.now() - exec.startedAt.getTime())}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="View Details">
                          <ActionIcon
                            size="sm"
                            variant="light"
                            onClick={() => setSelectedExecution(exec.workflowRunId)}
                          >
                            <IconEye size={14} />
                          </ActionIcon>
                        </Tooltip>
                        {exec.status === 'running' && (
                          <Tooltip label="Cancel Workflow">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="red"
                              onClick={() => handleCancelWorkflow(exec.workflowRunId)}
                            >
                              <IconPlayerStop size={14} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder radius="md" pos="relative">
      <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 2 }} />

      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Workflow Details</Title>
          <Group gap="xs">
            <Button variant="light" size="xs" onClick={() => setSelectedExecution(null)}>
              Back to List
            </Button>
            <ActionIcon variant="light" onClick={refreshData} disabled={loading}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}

        {execution && (
          <Stack gap="md">
            <Group justify="space-between">
              <Stack gap={4}>
                <Group gap="xs">
                  <Text size="sm" fw={500}>
                    Status:
                  </Text>
                  <Badge
                    color={STATUS_COLORS[execution.status]}
                    variant="light"
                    leftSection={STATUS_ICONS[execution.status]}
                  >
                    {execution.status}
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed">
                  ID: {execution.workflowRunId}
                </Text>
              </Stack>

              {execution.status === 'running' && (
                <Button
                  variant="light"
                  color="red"
                  size="xs"
                  leftSection={<IconPlayerStop size={14} />}
                  onClick={() => handleCancelWorkflow(execution.workflowRunId)}
                >
                  Cancel
                </Button>
              )}
            </Group>

            <Group grow>
              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  Started
                </Text>
                <Text size="xs">{execution.startedAt.toLocaleString()}</Text>
              </Stack>

              {execution.completedAt && (
                <Stack gap={4}>
                  <Text size="sm" fw={500}>
                    Completed
                  </Text>
                  <Text size="xs">{execution.completedAt.toLocaleString()}</Text>
                </Stack>
              )}

              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  Duration
                </Text>
                <Text size="xs">
                  {execution.completedAt
                    ? formatDuration(
                        execution.completedAt.getTime() - execution.startedAt.getTime(),
                      )
                    : formatDuration(Date.now() - execution.startedAt.getTime())}
                </Text>
              </Stack>
            </Group>

            {execution.error && (
              <Alert color="red" title="Workflow Error">
                {execution.error}
              </Alert>
            )}

            <Title order={4}>Steps</Title>

            <Timeline active={execution.steps.findIndex((step) => step.status === 'running')}>
              {execution.steps.map((step) => (
                <Timeline.Item
                  key={step.id}
                  bullet={STATUS_ICONS[step.status]}
                  title={step.name}
                  color={STATUS_COLORS[step.status]}
                >
                  <Stack gap="xs">
                    <Group gap="xs">
                      <Text size="xs">Status:</Text>
                      <Badge size="xs" color={STATUS_COLORS[step.status]} variant="light">
                        {step.status}
                      </Badge>
                    </Group>

                    {step.startedAt && (
                      <Text size="xs" c="dimmed">
                        Started: {step.startedAt.toLocaleString()}
                      </Text>
                    )}

                    {step.completedAt && (
                      <Text size="xs" c="dimmed">
                        Completed: {step.completedAt.toLocaleString()}
                      </Text>
                    )}

                    {step.duration && (
                      <Text size="xs" c="dimmed">
                        Duration: {formatDuration(step.duration * 1000)}
                      </Text>
                    )}

                    {step.error && <Alert color="red">{step.error}</Alert>}

                    {step.output != null && (
                      <Accordion variant="contained">
                        <Accordion.Item value="output">
                          <Accordion.Control>View Output</Accordion.Control>
                          <Accordion.Panel>
                            <Code block>
                              {typeof step.output === 'string'
                                ? step.output
                                : JSON.stringify(step.output, null, 2)}
                            </Code>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    )}
                  </Stack>
                </Timeline.Item>
              ))}
            </Timeline>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
