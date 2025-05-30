'use client';

import { useWorkflow, type Waiter, type WorkflowRun } from '@/contexts/workflow-context';
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
  CopyButton,
  Divider,
  Group,
  JsonInput,
  LoadingOverlay,
  Modal,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Timeline,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure, useSet } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconBell,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconCopy,
  IconExternalLink,
  IconPlayerStop,
  IconSearch,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';

export default function MonitoringPage() {
  const {
    cancelWorkflow,
    filteredRuns,
    filters,
    loading,
    notifyWorkflow,
    setFilters,
    sseConnected,
    waiters,
  } = useWorkflow();
  const expandedRuns = useSet<string>();
  const [selectedWaiter, setSelectedWaiter] = useState<Waiter | null>(null);
  const [notifyPayload, setNotifyPayload] = useState('{}');
  const [notifyModalOpened, { close: closeNotifyModal, open: openNotifyModal }] =
    useDisclosure(false);

  const handleNotifyWorkflow = async () => {
    if (!selectedWaiter) return;

    try {
      await notifyWorkflow(selectedWaiter.eventId, JSON.parse(notifyPayload));
      closeNotifyModal();
    } catch (error) {
      notifications.show({
        color: 'red',
        message: error instanceof Error ? error.message : 'Invalid JSON payload',
        title: 'Failed to send event',
      });
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
    <>
      <Container py="xl" size="xl">
        <Stack gap="xl">
          <div>
            <Title order={1} mb="md">
              Monitoring
            </Title>
            <Text c="dimmed" size="lg">
              Monitor running workflows, view execution logs, and manage workflow events
            </Text>
          </div>

          <Paper withBorder p="md">
            <Group justify="space-between" mb="md">
              <Group>
                <TextInput
                  leftSection={<IconSearch size={16} />}
                  onChange={(e) => setFilters({ workflowUrl: e.currentTarget.value })}
                  placeholder="Filter by workflow URL"
                  value={filters.workflowUrl}
                />
                <TextInput
                  leftSection={<IconSearch size={16} />}
                  onChange={(e) => setFilters({ runId: e.currentTarget.value })}
                  placeholder="Filter by run ID"
                  value={filters.runId}
                />
              </Group>
              <Badge color={sseConnected ? 'green' : 'red'} size="sm" variant="dot">
                {sseConnected ? 'Live Updates' : 'Disconnected'}
              </Badge>
            </Group>

            {waiters.length > 0 && (
              <Alert color="blue" icon={<IconBell />} mb="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Workflows waiting for events</Text>
                    <Text c="dimmed" size="sm">
                      {waiters.length} workflow{waiters.length > 1 ? 's are' : ' is'} waiting for
                      external events
                    </Text>
                  </div>
                  <Button
                    leftSection={<IconSend size={14} />}
                    onClick={() => {
                      const waiter = waiters[0];
                      setSelectedWaiter(waiter);
                      // Set default payload based on workflow type
                      if (waiter.stepName === 'pipeline-approval') {
                        setNotifyPayload('{\n  "approved": true,\n  "approver": "admin-user"\n}');
                      } else {
                        setNotifyPayload('{\n  "approved": true,\n  "userId": "user-123"\n}');
                      }
                      openNotifyModal();
                    }}
                    size="xs"
                  >
                    Send Event
                  </Button>
                </Group>
              </Alert>
            )}

            <Stack gap="sm">
              {filteredRuns.length === 0 ? (
                <Text c="dimmed" py="xl" ta="center">
                  No workflow runs found
                </Text>
              ) : (
                filteredRuns.map((run: WorkflowRun) => {
                  const isExpanded = expandedRuns.has(run.workflowRunId);

                  return (
                    <Card key={run.workflowRunId} shadow="sm" withBorder p="sm" radius="md">
                      <LoadingOverlay visible={loading.get(run.workflowRunId) || false} />

                      <Group justify="space-between" mb={isExpanded ? 'md' : 0}>
                        <Group>
                          <ActionIcon
                            onClick={() => toggleRunExpanded(run.workflowRunId)}
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
                                      <ActionIcon onClick={copy} size="xs" variant="subtle">
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
                                onClick={() => cancelWorkflow(run.workflowRunId)}
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

                        <Timeline lineWidth={2} bulletSize={20}>
                          {run.steps.flatMap((stepGroup: any, groupIndex: number) =>
                            stepGroup.steps.map((step: any, stepIndex: number) => {
                              // Create a more unique key using workflowRunId and step info
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
                                  {step.messageId && (
                                    <Code mt="xs">Message ID: {step.messageId}</Code>
                                  )}
                                </Timeline.Item>
                              );
                            }),
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
          </Paper>

          {waiters.length > 0 && (
            <Paper withBorder p="md">
              <Title order={3} mb="md">
                Workflows Waiting for Events
              </Title>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Event ID</Table.Th>
                    <Table.Th>Workflow Run ID</Table.Th>
                    <Table.Th>Step Name</Table.Th>
                    <Table.Th>Timeout</Table.Th>
                    <Table.Th>Waiting Since</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {waiters.map((waiter: Waiter) => (
                    <Table.Tr key={`${waiter.workflowRunId}-${waiter.eventId}`}>
                      <Table.Td>
                        <Code>{waiter.eventId}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Code>{waiter.workflowRunId}</Code>
                      </Table.Td>
                      <Table.Td>{waiter.stepName}</Table.Td>
                      <Table.Td>{waiter.timeout}s</Table.Td>
                      <Table.Td>
                        {waiter.createdAt
                          ? new Date(Number(waiter.createdAt)).toLocaleString()
                          : 'N/A'}
                      </Table.Td>
                      <Table.Td>
                        <Button
                          leftSection={<IconSend size={12} />}
                          onClick={() => {
                            setSelectedWaiter(waiter);
                            // Set default payload based on workflow type
                            if (waiter.stepName === 'pipeline-approval') {
                              setNotifyPayload(
                                '{\n  "approved": true,\n  "approver": "admin-user"\n}',
                              );
                            } else if (waiter.stepName === 'approval-wait') {
                              setNotifyPayload('{\n  "approved": true,\n  "userId": "user-123"\n}');
                            } else {
                              setNotifyPayload('{\n  "eventData": "your data here"\n}');
                            }
                            openNotifyModal();
                          }}
                          size="xs"
                          variant="light"
                        >
                          Send Event
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          )}
        </Stack>
      </Container>

      <Modal
        onClose={closeNotifyModal}
        opened={notifyModalOpened}
        size="lg"
        title={`Send Event: ${selectedWaiter?.eventId}`}
      >
        <Stack>
          <Alert color="blue" icon={<IconBell />}>
            <Text size="sm">
              This will notify all workflows waiting for event ID:{' '}
              <Code>{selectedWaiter?.eventId}</Code>
            </Text>
          </Alert>

          <JsonInput
            validationError="Invalid JSON format"
            description="The data to send with the event notification"
            formatOnBlur
            minRows={8}
            onChange={setNotifyPayload}
            placeholder="Enter JSON data"
            label="Event Data"
            value={notifyPayload}
          />

          <Code block>
            {`// Example usage in your workflow:
const { eventData, timeout } = await context.waitForEvent(
  "${selectedWaiter?.stepName || 'waiting-for-event'}",
  "${selectedWaiter?.eventId || 'event-id'}",
  { timeout: ${selectedWaiter?.timeout || '3600'} }
);

if (!timeout) {
  // Process eventData
  console.log('Received:', eventData);
}`}
          </Code>

          <Group justify="flex-end">
            <Button onClick={closeNotifyModal} variant="light">
              Cancel
            </Button>
            <Button leftSection={<IconSend size={16} />} onClick={handleNotifyWorkflow}>
              Send Event
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
