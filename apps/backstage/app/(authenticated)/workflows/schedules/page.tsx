'use client';

import {
  ActionIcon,
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
  Select,
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
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconEdit,
  IconHistory,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';

interface Schedule {
  createdAt: string;
  cron: string;
  enabled: boolean;
  id: string;
  lastRun?: string;
  name: string;
  nextRun: string;
  payload: any;
  stats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    avgDuration: number;
  };
  timezone: string;
  workflowId: string;
}

interface ScheduleRun {
  completedAt?: string;
  duration?: number;
  error?: string;
  id: string;
  scheduleId: string;
  startedAt: string;
  status: 'success' | 'failed' | 'running';
}

const COMMON_SCHEDULES = [
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Daily at 9 AM', value: '0 9 * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Weekly on Monday', value: '0 0 * * 1' },
  { label: 'Monthly on 1st', value: '0 0 1 * *' },
  { label: 'Custom expression', value: 'custom' },
];

const TIMEZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'Eastern Time', value: 'America/New_York' },
  { label: 'Central Time', value: 'America/Chicago' },
  { label: 'Mountain Time', value: 'America/Denver' },
  { label: 'Pacific Time', value: 'America/Los_Angeles' },
  { label: 'London', value: 'Europe/London' },
  { label: 'Paris', value: 'Europe/Paris' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
];

const AVAILABLE_WORKFLOWS = [
  { label: 'Kitchen Sink Demo', value: 'kitchen-sink' },
  { label: 'Product Classification', value: 'product-classification' },
  { label: 'Chart PDPs Sync', value: 'chart-pdps' },
  { label: 'Sitemap Generation', value: 'sitemap-generation' },
  { label: 'Data Export', value: 'data-export' },
];

export default function ScheduleManagementPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: 'sched-1',
      name: 'Daily Product Classification',
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      cron: '0 9 * * *',
      enabled: true,
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      nextRun: new Date(Date.now() + 43200000).toISOString(),
      payload: { batchSize: 100, method: 'hybrid' },
      stats: {
        avgDuration: 12500,
        failedRuns: 1,
        successfulRuns: 6,
        totalRuns: 7,
      },
      timezone: 'America/New_York',
      workflowId: 'product-classification',
    },
    {
      id: 'sched-2',
      name: 'Weekly Sitemap Update',
      createdAt: new Date(Date.now() - 2592000000).toISOString(),
      cron: '0 0 * * 1',
      enabled: true,
      lastRun: new Date(Date.now() - 172800000).toISOString(),
      nextRun: new Date(Date.now() + 345600000).toISOString(),
      payload: { includeBlog: true, includeProducts: true },
      stats: {
        avgDuration: 45000,
        failedRuns: 0,
        successfulRuns: 4,
        totalRuns: 4,
      },
      timezone: 'UTC',
      workflowId: 'sitemap-generation',
    },
  ]);

  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [recentRuns, _setRecentRuns] = useState<ScheduleRun[]>([
    {
      id: 'run-1',
      completedAt: new Date(Date.now() - 85800000).toISOString(),
      duration: 600000,
      scheduleId: 'sched-1',
      startedAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'success',
    },
    {
      id: 'run-2',
      completedAt: new Date(Date.now() - 172200000).toISOString(),
      duration: 600000,
      error: 'Rate limit exceeded',
      scheduleId: 'sched-1',
      startedAt: new Date(Date.now() - 172800000).toISOString(),
      status: 'failed',
    },
  ]);

  const [opened, { close, open }] = useDisclosure(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    customCron: '',
    payload: '{}',
    scheduleType: '0 0 * * *',
    timezone: 'UTC',
    workflowId: '',
  });

  const handleCreateSchedule = () => {
    setEditMode(false);
    setFormData({
      name: '',
      customCron: '',
      payload: '{}',
      scheduleType: '0 0 * * *',
      timezone: 'UTC',
      workflowId: '',
    });
    open();
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditMode(true);
    setSelectedSchedule(schedule);
    setFormData({
      name: schedule.name,
      customCron: schedule.cron,
      payload: JSON.stringify(schedule.payload, null, 2),
      scheduleType: COMMON_SCHEDULES.find((s) => s.value === schedule.cron)?.value || 'custom',
      timezone: schedule.timezone,
      workflowId: schedule.workflowId,
    });
    open();
  };

  const handleSaveSchedule = () => {
    const cron = formData.scheduleType === 'custom' ? formData.customCron : formData.scheduleType;

    if (editMode && selectedSchedule) {
      setSchedules(
        schedules.map((s) =>
          s.id === selectedSchedule.id
            ? {
                ...s,
                name: formData.name,
                cron,
                payload: JSON.parse(formData.payload),
                timezone: formData.timezone,
                workflowId: formData.workflowId,
              }
            : s,
        ),
      );
      notifications.show({
        color: 'green',
        message: 'Schedule has been updated successfully',
        title: 'Schedule Updated',
      });
    } else {
      const newSchedule: Schedule = {
        id: `sched-${Date.now()}`,
        name: formData.name,
        createdAt: new Date().toISOString(),
        cron,
        enabled: true,
        nextRun: new Date(Date.now() + 3600000).toISOString(), // Mock next run
        payload: JSON.parse(formData.payload),
        stats: {
          avgDuration: 0,
          failedRuns: 0,
          successfulRuns: 0,
          totalRuns: 0,
        },
        timezone: formData.timezone,
        workflowId: formData.workflowId,
      };
      setSchedules([newSchedule, ...schedules]);
      notifications.show({
        color: 'green',
        message: 'New schedule has been created successfully',
        title: 'Schedule Created',
      });
    }

    close();
  };

  const toggleSchedule = (scheduleId: string) => {
    setSchedules(schedules.map((s) => (s.id === scheduleId ? { ...s, enabled: !s.enabled } : s)));
  };

  const deleteSchedule = (scheduleId: string) => {
    setSchedules(schedules.filter((s) => s.id !== scheduleId));
    notifications.show({
      color: 'red',
      message: 'Schedule has been removed',
      title: 'Schedule Deleted',
    });
  };

  const runScheduleNow = (scheduleId: string) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (schedule) {
      notifications.show({
        color: 'blue',
        message: `Running ${schedule.name} workflow...`,
        title: 'Workflow Triggered',
      });
    }
  };

  const formatNextRun = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      return `in ${Math.floor(hours / 24)} days`;
    } else if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    } else {
      return `in ${minutes}m`;
    }
  };

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <div>
          <Group align="center" justify="space-between">
            <div>
              <Title order={1}>Schedule Management</Title>
              <Text c="dimmed" mt="md" size="lg">
                Create and manage scheduled workflow executions
              </Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={handleCreateSchedule}>
              Create Schedule
            </Button>
          </Group>
        </div>

        {/* Schedule Stats */}
        <Grid>
          <Grid.Col span={3}>
            <Paper withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Active Schedules
                  </Text>
                  <Text fw={700} size="xl">
                    {schedules.filter((s) => s.enabled).length}
                  </Text>
                </div>
                <ThemeIcon color="green" size="xl" variant="light">
                  <IconCalendarEvent size={28} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Total Schedules
                  </Text>
                  <Text fw={700} size="xl">
                    {schedules.length}
                  </Text>
                </div>
                <ThemeIcon size="xl" variant="light">
                  <IconClock size={28} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Runs Today
                  </Text>
                  <Text fw={700} size="xl">
                    12
                  </Text>
                </div>
                <ThemeIcon color="blue" size="xl" variant="light">
                  <IconPlayerPlay size={28} />
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
                  <Text c="green" fw={700} size="xl">
                    94%
                  </Text>
                </div>
                <ThemeIcon color="green" size="xl" variant="light">
                  <IconCheck size={28} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        <Tabs defaultValue="schedules">
          <Tabs.List>
            <Tabs.Tab leftSection={<IconCalendarEvent size={16} />} value="schedules">
              Schedules
            </Tabs.Tab>
            <Tabs.Tab leftSection={<IconHistory size={16} />} value="history">
              Execution History
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel pt="md" value="schedules">
            <Stack gap="md">
              {schedules.map((schedule) => (
                <Card key={schedule.id} shadow="sm" withBorder p="lg">
                  <Group justify="space-between" mb="md">
                    <Group>
                      <Switch
                        onChange={() => toggleSchedule(schedule.id)}
                        checked={schedule.enabled}
                        size="md"
                      />
                      <div>
                        <Group gap="xs">
                          <Text fw={500} size="lg">
                            {schedule.name}
                          </Text>
                          <Badge variant="light">
                            {
                              AVAILABLE_WORKFLOWS.find((w) => w.value === schedule.workflowId)
                                ?.label
                            }
                          </Badge>
                        </Group>
                        <Group gap="xs" mt={4}>
                          <Code>{schedule.cron}</Code>
                          <Text c="dimmed" size="sm">
                            • {schedule.timezone}
                          </Text>
                        </Group>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Tooltip label="Run now">
                        <ActionIcon
                          color="blue"
                          onClick={() => runScheduleNow(schedule.id)}
                          variant="light"
                        >
                          <IconPlayerPlay size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Edit">
                        <ActionIcon onClick={() => handleEditSchedule(schedule)} variant="light">
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <ActionIcon
                          color="red"
                          onClick={() => deleteSchedule(schedule.id)}
                          variant="light"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>

                  <Grid>
                    <Grid.Col span={3}>
                      <Text c="dimmed" size="sm">
                        Next Run
                      </Text>
                      <Text fw={500}>{formatNextRun(schedule.nextRun)}</Text>
                      <Text c="dimmed" size="xs">
                        {new Date(schedule.nextRun).toLocaleString()}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Text c="dimmed" size="sm">
                        Last Run
                      </Text>
                      <Text fw={500}>
                        {schedule.lastRun ? new Date(schedule.lastRun).toLocaleString() : 'Never'}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Text c="dimmed" size="sm">
                        Total Runs
                      </Text>
                      <Text fw={500}>{schedule.stats.totalRuns}</Text>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Text c="dimmed" size="sm">
                        Success Rate
                      </Text>
                      <Text c="green" fw={500}>
                        {schedule.stats.totalRuns > 0
                          ? `${Math.round((schedule.stats.successfulRuns / schedule.stats.totalRuns) * 100)}%`
                          : 'N/A'}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Text c="dimmed" size="sm">
                        Avg Duration
                      </Text>
                      <Text fw={500}>
                        {schedule.stats.avgDuration > 0
                          ? `${(schedule.stats.avgDuration / 1000).toFixed(1)}s`
                          : 'N/A'}
                      </Text>
                    </Grid.Col>
                  </Grid>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="history">
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Schedule</Table.Th>
                  <Table.Th>Started</Table.Th>
                  <Table.Th>Duration</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Error</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentRuns.map((run) => {
                  const schedule = schedules.find((s) => s.id === run.scheduleId);
                  return (
                    <Table.Tr key={run.id}>
                      <Table.Td>{schedule?.name || 'Unknown'}</Table.Td>
                      <Table.Td>{new Date(run.startedAt).toLocaleString()}</Table.Td>
                      <Table.Td>
                        {run.duration ? `${(run.duration / 1000).toFixed(1)}s` : 'Running...'}
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            run.status === 'success'
                              ? 'green'
                              : run.status === 'failed'
                                ? 'red'
                                : 'blue'
                          }
                        >
                          {run.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {run.error && (
                          <Text c="red" size="sm">
                            {run.error}
                          </Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Create/Edit Schedule Modal */}
      <Modal
        onClose={close}
        opened={opened}
        size="lg"
        title={editMode ? 'Edit Schedule' : 'Create Schedule'}
      >
        <Stack gap="md">
          <TextInput
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Daily Product Sync"
            label="Schedule Name"
            required
            value={formData.name}
          />

          <Select
            onChange={(value) => setFormData({ ...formData, workflowId: value || '' })}
            placeholder="Select workflow to schedule"
            data={AVAILABLE_WORKFLOWS}
            label="Workflow"
            required
            value={formData.workflowId}
          />

          <Select
            onChange={(value) => setFormData({ ...formData, scheduleType: value || '' })}
            data={COMMON_SCHEDULES}
            label="Schedule"
            value={formData.scheduleType}
          />

          {formData.scheduleType === 'custom' && (
            <TextInput
              description="Use standard cron syntax"
              onChange={(e) => setFormData({ ...formData, customCron: e.target.value })}
              placeholder="e.g., 0 */4 * * *"
              label="Custom Cron Expression"
              required
              value={formData.customCron}
            />
          )}

          <Select
            onChange={(value) => setFormData({ ...formData, timezone: value || 'UTC' })}
            data={TIMEZONES}
            label="Timezone"
            value={formData.timezone}
          />

          <JsonInput
            validationError="Invalid JSON"
            formatOnBlur
            minRows={4}
            onChange={(value) => setFormData({ ...formData, payload: value })}
            placeholder="Enter JSON payload"
            label="Workflow Payload"
            value={formData.payload}
          />

          <Group justify="flex-end">
            <Button onClick={close} variant="light">
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule}>
              {editMode ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
