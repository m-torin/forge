'use client';

import { useWorkflow } from '@/contexts/workflow-context';
import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  ThemeIcon,
  ActionIcon,
} from '@mantine/core';
import {
  IconChevronRight,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconAlertCircle,
  IconStack2,
  IconSettings,
  IconPhoto,
  IconRobot,
  IconUpload,
} from '@tabler/icons-react';
import Link from 'next/link';

// Static workflow data matching your existing definitions
const workflows = [
  {
    slug: 'basic',
    label: 'Basic Workflow',
    description: 'Essential workflow pattern with validation and batch processing',
    icon: IconStack2,
    color: 'blue',
  },
  {
    slug: 'kitchen-sink',
    label: 'Kitchen Sink',
    description: 'Comprehensive feature demonstration',
    icon: IconSettings,
    color: 'grape',
  },
  {
    slug: 'image-processing',
    label: 'Image Processing',
    description: 'Image processing and optimization',
    icon: IconPhoto,
    color: 'teal',
  },
  {
    slug: 'product-classification',
    label: 'Product Classification',
    description: 'AI-powered product classification',
    icon: IconRobot,
    color: 'orange',
  },
  {
    slug: 'import-external-media',
    label: 'Import Media',
    description: 'Import and process external media',
    icon: IconUpload,
    color: 'cyan',
  },
];

export default function WorkersPage() {
  const { filteredRuns, optimisticWorkflows, triggerWorkflow } = useWorkflow();

  // Calculate stats
  const totalRuns = filteredRuns.length;
  const runningCount = Object.values(optimisticWorkflows).filter(w => w.status === 'running').length;
  const successCount = filteredRuns.filter(r => r.workflowState === 'RUN_SUCCESS').length;
  const failedCount = filteredRuns.filter(r => r.workflowState === 'RUN_FAILED').length;

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
          <Group justify="space-between" align="start" mb="md">
            <div>
              <Title order={1}>Workflow Dashboard</Title>
              <Text c="dimmed">Monitor and manage your background workflows</Text>
            </div>
            <Stack gap="xs">
              <Text size="sm" c="dimmed" mb="xs">Pure Upstash Workflow Tests (No Orchestration Package)</Text>
              
              <Group gap="xs">
                <Button
                  size="sm"
                  variant="filled"
                  color="blue"
                  onClick={() => triggerWorkflow('/api/workflows/no-steps', {})}
                >
                  No Steps
                </Button>
                <Button
                  size="sm"
                  variant="filled"
                  color="green"
                  onClick={() => triggerWorkflow('/api/workflows/pure-test', {})}
                >
                  Pure Test
                </Button>
                <Button
                  size="sm"
                  variant="filled"
                  color="violet"
                  onClick={() => triggerWorkflow('/api/workflows/manual-config', {})}
                >
                  Manual Config
                </Button>
              </Group>
              
              <Text size="sm" c="dimmed" mb="xs">Original Tests (With Orchestration Package)</Text>
              
              <Group gap="xs">
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => triggerWorkflow('/api/workflows/basic', { test: true })}
                >
                  Basic Workflow
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  color="orange"
                  onClick={() => triggerWorkflow('/api/workflows/test-simple', { test: true })}
                >
                  Test Simple
                </Button>
              </Group>
              
              <Text size="sm" c="dimmed" mb="xs">Debug Tests</Text>
              
              <Group gap="xs">
                <Button
                  size="sm"
                  variant="light"
                  color="gray"
                  onClick={async () => {
                    const res = await fetch('/api/test-plain', { method: 'POST', body: JSON.stringify({ test: true }) });
                    const data = await res.json();
                    console.log('Plain API Test:', data);
                  }}
                >
                  Plain API
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  color="red"
                  onClick={async () => {
                    const res = await fetch('/api/test-qstash', { method: 'POST' });
                    const data = await res.json();
                    console.log('QStash Publish Test:', data);
                  }}
                >
                  Test Publish
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  color="green"
                  onClick={async () => {
                    const res = await fetch('/api/test-qstash');
                    const data = await res.json();
                    console.log('QStash Connection Test:', data);
                  }}
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
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Total Runs
            </Text>
            <Text size="xl" fw={700}>
              {totalRuns}
            </Text>
          </Card>

          <Card withBorder padding="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Running
            </Text>
            <Text size="xl" fw={700} c="blue">
              {runningCount}
            </Text>
          </Card>

          <Card withBorder padding="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Successful
            </Text>
            <Text size="xl" fw={700} c="green">
              {successCount}
            </Text>
          </Card>

          <Card withBorder padding="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Failed
            </Text>
            <Text size="xl" fw={700} c="red">
              {failedCount}
            </Text>
          </Card>
        </SimpleGrid>

        <Grid>
          {/* Available Workflows */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card shadow="sm" withBorder padding="lg">
              <Title order={3} mb="md">Available Workflows</Title>
              <Stack gap="sm">
                {workflows.map((workflow) => (
                  <Card key={workflow.slug} withBorder p="md" component={Link} href={`/workflows/${workflow.slug}`} style={{ textDecoration: 'none' }}>
                    <Group justify="space-between">
                      <Group>
                        <ThemeIcon color={workflow.color} variant="light" size="lg">
                          <workflow.icon size={20} />
                        </ThemeIcon>
                        <div>
                          <Text fw={500} size="sm">{workflow.label}</Text>
                          <Text c="dimmed" size="xs">{workflow.description}</Text>
                        </div>
                      </Group>
                      <ActionIcon variant="subtle" color="gray">
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
              <Title order={3} mb="md">Recent Activity</Title>
              {recentRuns.length === 0 ? (
                <Text c="dimmed" size="sm" ta="center" py="xl">
                  No recent activity
                </Text>
              ) : (
                <Stack gap="sm">
                  {recentRuns.map((run) => (
                    <Group key={run.workflowRunId} justify="space-between">
                      <Group gap="xs">
                        {getStatusIcon(run.workflowState)}
                        <div>
                          <Text size="xs" fw={500}>
                            {run.workflowUrl.split('/').pop()}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {new Date(run.workflowRunCreatedAt).toLocaleTimeString()}
                          </Text>
                        </div>
                      </Group>
                      <Badge size="xs" color={getStatusColor(run.workflowState)} variant="light">
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