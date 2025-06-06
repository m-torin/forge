'use client'

import { Container, Stack, Title, Text, Group, SimpleGrid, Card, Grid, Badge, ActionIcon, ThemeIcon, Button } from '@mantine/core'
import { 
  IconChevronRight, IconClock, IconCircleCheck, IconCircleX, IconAlertCircle,
  IconServer, IconCode, IconBrain, IconStack2,
  IconDeviceDesktop, IconCloud, IconPlayerPlay, IconSettings
} from '@tabler/icons-react'
import Link from 'next/link'
import { useWorkflows } from '../contexts/WorkflowsContext'
import { WorkflowMonitor } from '../components/WorkflowMonitor'
import { ComprehensiveDemo } from '../components/ComprehensiveDemo'

// Workflow definitions matching our actual endpoints
const workflows = [
  {
    slug: 'sleep',
    label: 'Sleep Workflow',
    description: 'Basic workflow with sleep and step execution',
    icon: IconClock,
    color: 'blue',
  },
  {
    slug: 'northStarSimple',
    label: 'North Star Simple', 
    description: 'Invoice processing with retry logic',
    icon: IconCircleCheck,
    color: 'green',
  },
  {
    slug: 'path',
    label: 'Path Workflow',
    description: 'URL path processing workflow',
    icon: IconCode,
    color: 'teal',
  },
  {
    slug: 'auth',
    label: 'Basic Workflow',
    description: 'Simple two-step workflow example',
    icon: IconSettings,
    color: 'orange',
  },
  {
    slug: 'northStar',
    label: 'North Star Advanced',
    description: 'Advanced invoice processing workflow',
    icon: IconStack2,
    color: 'violet',
  },
  {
    slug: 'sleepWithoutAwait',
    label: 'Sleep Without Await',
    description: 'Non-blocking sleep workflow',
    icon: IconPlayerPlay,
    color: 'cyan',
  },
  {
    slug: 'vercel-ai-sdk',
    label: 'Vercel AI SDK',
    description: 'AI-powered workflow processing',
    icon: IconBrain,
    color: 'pink',
  },
  {
    slug: 'serve-many',
    label: 'Serve Many',
    description: 'Multiple workflow management',
    icon: IconServer,
    color: 'gray',
  },
]

export default function DashboardPage() {
  const { 
    workflowRuns, sseConnected, config, loadingStates,
    quickTestSleep, quickTestInvoice,
    testPlainAPI, testQStashConnection, testQStashPublish
  } = useWorkflows()

  // Calculate stats from real-time data
  const totalRuns = workflowRuns.length
  const runningCount = workflowRuns.filter(run => run.workflowState === 'RUN_STARTED').length
  const successCount = workflowRuns.filter(run => run.workflowState === 'RUN_SUCCESS').length
  const failedCount = workflowRuns.filter(run => run.workflowState === 'RUN_FAILED').length

  // Recent runs (last 5)
  const recentRuns = workflowRuns.slice(0, 5)

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'RUN_SUCCESS':
        return <IconCircleCheck color="green" size={16} />
      case 'RUN_FAILED':
        return <IconCircleX color="red" size={16} />
      case 'RUN_CANCELED':
        return <IconAlertCircle color="orange" size={16} />
      default:
        return <IconClock color="blue" size={16} />
    }
  }

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'RUN_SUCCESS':
        return 'green'
      case 'RUN_FAILED':
        return 'red'
      case 'RUN_CANCELED':
        return 'orange'
      default:
        return 'blue'
    }
  }


  return (
    <Stack gap="xl">
      {/* Comprehensive Demo - Re-enabled after fixing critical issues */}
      <ComprehensiveDemo />
      
      <Container py="xl" size="xl">
        <Stack gap="xl">
          {/* Header */}
        <div>
          <Group justify="space-between" align="start" mb="md">
            <div>
              <Title order={1}>Workflow Dashboard</Title>
              <Text c="dimmed">Monitor and manage your Upstash workflows in real-time</Text>
            </div>
            <Stack gap="xs">
              <Text size="sm" c="dimmed" mb="xs">Quick Workflow Tests</Text>
              
              <Group gap="xs">
                <Button
                  size="sm"
                  variant="filled"
                  color="blue"
                  loading={loadingStates.sleepTest}
                  onClick={quickTestSleep}
                >
                  Sleep Test
                </Button>
                <Button
                  size="sm"
                  variant="filled"
                  color="green"
                  loading={loadingStates.invoiceTest}
                  onClick={quickTestInvoice}
                >
                  Invoice Test
                </Button>
              </Group>
              
              <Text size="sm" c="dimmed" mb="xs">Debug Tests</Text>
              
              <Group gap="xs">
                <Button
                  size="sm"
                  variant="light"
                  color="gray"
                  loading={loadingStates.plainAPI}
                  onClick={() => testPlainAPI({ test: 'debug', timestamp: Date.now() })}
                >
                  Plain API
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  color="orange"
                  loading={loadingStates.qstashConnect}
                  onClick={testQStashConnection}
                >
                  QStash Connect
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  color="red"
                  loading={loadingStates.qstashPublish}
                  onClick={() => testQStashPublish({ debug: true, timestamp: Date.now() })}
                >
                  QStash Publish
                </Button>
              </Group>
              
              <Text size="sm" c="dimmed" mb="xs">Environment</Text>
              
              <Group gap="xs">
                {config && (
                  <Badge 
                    variant="light" 
                    color={config.mode === 'local' ? 'blue' : 'orange'}
                    leftSection={config.mode === 'local' ? <IconDeviceDesktop size={12} /> : <IconCloud size={12} />}
                  >
                    {config.environment}
                  </Badge>
                )}
                <Badge 
                  color={sseConnected ? 'green' : 'red'} 
                  variant="light"
                  size="sm"
                >
                  {sseConnected ? 'Live Monitoring' : 'Monitoring Offline'}
                </Badge>
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
                  <Card 
                    key={workflow.slug} 
                    withBorder 
                    p="md" 
                    component={Link} 
                    href={`/workflows/${workflow.slug}`} 
                    style={{ textDecoration: 'none' }}
                  >
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
                  {sseConnected ? 'No recent workflow runs' : 'Waiting for connection...'}
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
                            {new Date(run.workflowRunCreatedAt * 1000).toLocaleTimeString()}
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

          {/* Live Monitoring (Full Width) */}
          <WorkflowMonitor />
        </Stack>
      </Container>
    </Stack>
  )
}