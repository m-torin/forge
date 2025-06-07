'use client';

import { type WorkflowDefinition } from '@/types';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconCheck,
  IconClock,
  IconEye,
  IconPlayerPlay as IconPlay,
  IconRefresh,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [stats, setStats] = useState({
    activeExecutions: 0,
    categories: [] as string[],
    successRate: 0,
    totalExecutions: 0,
    totalWorkflows: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workflowsResponse, statsResponse] = await Promise.all([
        fetch('/api/workflows'),
        fetch('/api/stats'),
      ]);

      const workflowsData = await workflowsResponse.json();
      const statsData = await statsResponse.json();

      if (workflowsData.success && statsData.success) {
        setWorkflows(workflowsData.data.workflows);
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId,
          input: {}, // Empty input for demo
          options: {},
        }),
      });

      const result = await response.json();
      console.log('Workflow executed:', result);
      // Optionally refresh stats
      loadData();
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      ai: 'purple',
      email: 'green',
      general: 'gray',
      payments: 'blue',
    };
    return colors[category as keyof typeof colors] || 'gray';
  };

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1} mb="xs" size="h1">
            Workflows Dashboard
          </Title>
          <Text c="dimmed" size="lg">
            High-performance workflow execution with Next.js 15 + React 19
          </Text>
        </div>

        {/* Stats Overview */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Total Workflows
                  </Text>
                  <Text fw={700} size="xl">
                    {stats.totalWorkflows}
                  </Text>
                </div>
                <IconPlay color="var(--mantine-color-blue-6)" size={24} />
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Total Executions
                  </Text>
                  <Text fw={700} size="xl">
                    {stats.totalExecutions}
                  </Text>
                </div>
                <IconClock color="var(--mantine-color-orange-6)" size={24} />
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Active Now
                  </Text>
                  <Text fw={700} size="xl">
                    {stats.activeExecutions}
                  </Text>
                </div>
                <IconRefresh color="var(--mantine-color-green-6)" size={24} />
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    Success Rate
                  </Text>
                  <Text fw={700} size="xl">
                    {stats.successRate.toFixed(1)}%
                  </Text>
                </div>
                <IconCheck color="var(--mantine-color-teal-6)" size={24} />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Quick Actions */}
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between" mb="md">
            <Title order={3}>Quick Actions</Title>
            <Button
              leftSection={<IconRefresh size={16} />}
              loading={loading}
              onClick={loadData}
              variant="light"
            >
              Refresh
            </Button>
          </Group>

          <Group>
            <Button href="/workflows" component={Link} leftSection={<IconPlay size={16} />}>
              View All Workflows
            </Button>
            <Button
              href={'/executions' as any}
              component={Link}
              leftSection={<IconEye size={16} />}
              variant="light"
            >
              View Executions
            </Button>
            <Button
              href={'/monitor' as any}
              component={Link}
              leftSection={<IconClock size={16} />}
              variant="outline"
            >
              Real-time Monitor
            </Button>
          </Group>
        </Card>

        {/* Workflows Grid */}
        <div>
          <Group justify="space-between" mb="lg">
            <Title order={3}>Available Workflows</Title>
            <Text c="dimmed" size="sm">
              {workflows.length} workflows loaded
            </Text>
          </Group>

          {loading ? (
            <Card withBorder padding="lg" radius="md">
              <Text c="dimmed" ta="center">
                Loading workflows...
              </Text>
            </Card>
          ) : workflows.length === 0 ? (
            <Card withBorder padding="lg" radius="md">
              <Text c="dimmed" ta="center">
                No workflows found. Create some workflows in the /workflows directory.
              </Text>
            </Card>
          ) : (
            <Grid>
              {workflows.map((workflow) => (
                <Grid.Col key={workflow.id} span={{ base: 12, lg: 4, md: 6 }}>
                  <Card withBorder h="100%" padding="lg" radius="md">
                    <Stack h="100%" justify="space-between">
                      <div>
                        <Group justify="space-between" mb="xs">
                          <Badge
                            color={getCategoryColor(workflow.category || 'general')}
                            variant="light"
                          >
                            {workflow.category || 'general'}
                          </Badge>
                          <Text c="dimmed" size="xs">
                            v{workflow.version}
                          </Text>
                        </Group>

                        <Title order={4} mb="xs">
                          {workflow.name}
                        </Title>

                        <Text c="dimmed" lineClamp={3} mb="sm" size="sm">
                          {workflow.description}
                        </Text>

                        {workflow.tags && workflow.tags.length > 0 && (
                          <Group gap="xs" mb="sm">
                            {workflow.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} size="xs" variant="outline">
                                {tag}
                              </Badge>
                            ))}
                            {workflow.tags.length > 3 && (
                              <Badge c="dimmed" size="xs" variant="outline">
                                +{workflow.tags.length - 3}
                              </Badge>
                            )}
                          </Group>
                        )}
                      </div>

                      <Group justify="space-between">
                        <Button
                          leftSection={<IconPlay size={14} />}
                          onClick={() => executeWorkflow(workflow.id)}
                          size="sm"
                          variant="light"
                        >
                          Execute
                        </Button>
                        <ActionIcon
                          href={`/workflows/${workflow.id}` as any}
                          component={Link}
                          size="sm"
                          variant="subtle"
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          )}
        </div>
      </Stack>
    </Container>
  );
}
