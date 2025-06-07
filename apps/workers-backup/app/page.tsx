'use client';

import { AppShellLayout } from '@/components/app-shell-layout';
import { useWorkflow } from '@/contexts/workflow-context';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconPhoto,
  IconRobot,
  IconSettings,
  IconStack2,
  IconUpload,
} from '@tabler/icons-react';
import Link from 'next/link';

// Static workflow data matching your existing definitions
const workflows = [
  {
    color: 'blue',
    description: 'Essential workflow pattern with validation and batch processing',
    icon: IconStack2,
    label: 'Basic Workflow',
    slug: 'basic',
  },
  {
    color: 'grape',
    description: 'Comprehensive feature demonstration',
    icon: IconSettings,
    label: 'Kitchen Sink',
    slug: 'kitchen-sink',
  },
  {
    color: 'teal',
    description: 'Image processing and optimization',
    icon: IconPhoto,
    label: 'Image Processing',
    slug: 'image-processing',
  },
  {
    color: 'orange',
    description: 'AI-powered product classification',
    icon: IconRobot,
    label: 'Product Classification',
    slug: 'product-classification',
  },
  {
    color: 'cyan',
    description: 'Import and process external media',
    icon: IconUpload,
    label: 'Import Media',
    slug: 'import-external-media',
  },
];

function WorkersPage() {
  const { filteredRuns, optimisticWorkflows, triggerWorkflow } = useWorkflow();

  // Calculate stats
  const totalRuns = filteredRuns.length;
  const runningCount = Object.values(optimisticWorkflows).filter(
    (w) => w.status === 'running',
  ).length;
  const successCount = filteredRuns.filter((r) => r.workflowState === 'RUN_SUCCESS').length;
  const failedCount = filteredRuns.filter((r) => r.workflowState === 'RUN_FAILED').length;

  // Recent runs (last 5)
  const recentRuns = filteredRuns.slice(0, 5);

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

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Group align="start" justify="space-between" mb="md">
            <div>
              <Title order={1}>Workflow Dashboard</Title>
              <Text c="dimmed">Monitor and manage your background workflows</Text>
            </div>
            <Stack gap="xs">
              <Text c="dimmed" mb="xs" size="sm">
                Pure Upstash Workflow Tests (No Orchestration Package)
              </Text>

              <Group gap="xs">
                <Button
                  color="blue"
                  onClick={() => triggerWorkflow('/api/workflows/no-steps', {})}
                  size="sm"
                  variant="filled"
                >
                  No Steps
                </Button>
                <Button
                  color="green"
                  onClick={() => triggerWorkflow('/api/workflows/pure-test', {})}
                  size="sm"
                  variant="filled"
                >
                  Pure Test
                </Button>
                <Button
                  color="violet"
                  onClick={() => triggerWorkflow('/api/workflows/manual-config', {})}
                  size="sm"
                  variant="filled"
                >
                  Manual Config
                </Button>
              </Group>

              <Text c="dimmed" mb="xs" size="sm">
                Original Tests (With Orchestration Package)
              </Text>

              <Group gap="xs">
                <Button
                  onClick={() => triggerWorkflow('/api/workflows/basic', { test: true })}
                  size="sm"
                  variant="light"
                >
                  Basic Workflow
                </Button>
                <Button
                  color="orange"
                  onClick={() => triggerWorkflow('/api/workflows/test-simple', { test: true })}
                  size="sm"
                  variant="light"
                >
                  Test Simple
                </Button>
              </Group>

              <Text c="dimmed" mb="xs" size="sm">
                Debug Tests
              </Text>

              <Group gap="xs">
                <Button
                  color="gray"
                  onClick={async () => {
                    const res = await fetch('/api/test-plain', {
                      body: JSON.stringify({ test: true }),
                      method: 'POST',
                    });
                    const data = await res.json();
                    console.log('Plain API Test:', data);
                  }}
                  size="sm"
                  variant="light"
                >
                  Plain API
                </Button>
                <Button
                  color="red"
                  onClick={async () => {
                    const res = await fetch('/api/test-qstash', { method: 'POST' });
                    const data = await res.json();
                    console.log('QStash Publish Test:', data);
                  }}
                  size="sm"
                  variant="light"
                >
                  Test Publish
                </Button>
                <Button
                  color="green"
                  onClick={async () => {
                    const res = await fetch('/api/test-qstash');
                    const data = await res.json();
                    console.log('QStash Connection Test:', data);
                  }}
                  size="sm"
                  variant="light"
                >
                  Test QStash
                </Button>
              </Group>
            </Stack>
          </Group>
        </div>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <Card withBorder padding="md">
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              Total Runs
            </Text>
            <Text fw={700} size="xl">
              {totalRuns}
            </Text>
          </Card>

          <Card withBorder padding="md">
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              Running
            </Text>
            <Text c="blue" fw={700} size="xl">
              {runningCount}
            </Text>
          </Card>

          <Card withBorder padding="md">
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              Successful
            </Text>
            <Text c="green" fw={700} size="xl">
              {successCount}
            </Text>
          </Card>

          <Card withBorder padding="md">
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              Failed
            </Text>
            <Text c="red" fw={700} size="xl">
              {failedCount}
            </Text>
          </Card>
        </SimpleGrid>

        <Grid>
          {/* Available Workflows */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card shadow="sm" withBorder padding="lg">
              <Title order={3} mb="md">
                Available Workflows
              </Title>
              <Stack gap="sm">
                {workflows.map((workflow) => (
                  <Card
                    key={workflow.slug}
                    href={`/workflows/${workflow.slug}`}
                    component={Link}
                    withBorder
                    style={{ textDecoration: 'none' }}
                    p="md"
                  >
                    <Group justify="space-between">
                      <Group>
                        <ThemeIcon color={workflow.color} size="lg" variant="light">
                          <workflow.icon size={20} />
                        </ThemeIcon>
                        <div>
                          <Text fw={500} size="sm">
                            {workflow.label}
                          </Text>
                          <Text c="dimmed" size="xs">
                            {workflow.description}
                          </Text>
                        </div>
                      </Group>
                      <ActionIcon color="gray" variant="subtle">
                        <IconChevronRight size={16} />
                      </ActionIcon>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Recent Activity */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" withBorder padding="lg">
              <Title order={3} mb="md">
                Recent Activity
              </Title>
              {recentRuns.length === 0 ? (
                <Text c="dimmed" py="xl" size="sm" ta="center">
                  No recent activity
                </Text>
              ) : (
                <Stack gap="sm">
                  {recentRuns.map((run) => (
                    <Group key={run.workflowRunId} justify="space-between">
                      <Group gap="xs">
                        {getStatusIcon(run.workflowState)}
                        <div>
                          <Text fw={500} size="xs">
                            {run.workflowUrl.split('/').pop()}
                          </Text>
                          <Text c="dimmed" size="xs">
                            {new Date(run.workflowRunCreatedAt).toLocaleTimeString()}
                          </Text>
                        </div>
                      </Group>
                      <Badge color={getStatusColor(run.workflowState)} size="xs" variant="light">
                        {run.workflowState.replace('RUN_', '')}
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              )}
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}

export default function Page() {
  return (
    <AppShellLayout>
      <WorkersPage />
    </AppShellLayout>
  );
}
