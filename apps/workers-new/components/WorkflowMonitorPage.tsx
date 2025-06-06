'use client'

import { useMemo } from 'react'
import { 
  Card, Title, Text, Badge, Group, Stack, Code, Alert, Timeline, ThemeIcon, 
  Progress, Paper, ActionIcon, Button, Collapse
} from '@mantine/core'
import { 
  IconCode, IconRocket, IconInfoCircle, IconCheck, IconX, IconClock, 
  IconAlertCircle, IconPlayerPlay, IconChevronDown, IconExternalLink,
  IconEye, IconEyeOff, IconTrash
} from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { WorkflowTrigger } from './WorkflowTrigger'
import { useWorkflows } from '../contexts/WorkflowsContext'
import type { WorkflowInfo } from '../lib/workflows'

interface WorkflowMonitorPageProps {
  workflow: WorkflowInfo
  samplePayload: any
}

export function WorkflowMonitorPage({ workflow, samplePayload }: WorkflowMonitorPageProps) {
  const { workflowRuns, sseConnected, cancelWorkflow } = useWorkflows()
  const [showDetails, { toggle: toggleDetails }] = useDisclosure(false)

  // Filter runs for this specific workflow
  const filteredRuns = useMemo(() => {
    return workflowRuns.filter(run => 
      run.workflowUrl.includes(`/${workflow.slug}`)
    ).slice(0, 10) // Show last 10 runs
  }, [workflowRuns, workflow.slug])

  // Get running workflows for this type
  const runningWorkflows = useMemo(() => {
    return filteredRuns.filter(run => run.workflowState === 'RUN_STARTED')
  }, [filteredRuns])

  const getStatusIcon = (state: string, size = 16) => {
    switch (state) {
      case 'RUN_SUCCESS':
        return <IconCheck color="green" size={size} />
      case 'RUN_FAILED':
        return <IconX color="red" size={size} />
      case 'RUN_CANCELED':
        return <IconAlertCircle color="orange" size={size} />
      case 'RUN_STARTED':
        return <IconPlayerPlay color="blue" size={size} />
      default:
        return <IconClock color="gray" size={size} />
    }
  }

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'RUN_SUCCESS': return 'green'
      case 'RUN_FAILED': return 'red'
      case 'RUN_CANCELED': return 'orange'
      case 'RUN_STARTED': return 'blue'
      default: return 'gray'
    }
  }

  const calculateProgress = (run: any) => {
    if (!run.steps || run.steps.length === 0) return 0
    
    const allSteps = run.steps.flatMap((group: any) => group.steps || [])
    if (allSteps.length === 0) return 0
    
    const completedSteps = allSteps.filter((step: any) => 
      step.status === 'completed' || step.state === 'STEP_SUCCESS'
    ).length
    
    return Math.round((completedSteps / allSteps.length) * 100)
  }

  return (
    <Stack gap="xl">
      {/* Workflow Header */}
      <div>
        <Group mb="md">
          <Badge variant="light" color={workflow.color} size="lg">
            {workflow.slug}
          </Badge>
          {sseConnected && (
            <Badge color="green" variant="light" size="sm">
              Live Monitoring
            </Badge>
          )}
        </Group>
        <Title order={1} mb="sm">{workflow.name}</Title>
        <Text size="lg" c="dimmed">{workflow.description}</Text>
      </div>

      {/* Running Workflows Alert */}
      {runningWorkflows.length > 0 && (
        <Alert color="blue" title={`Active ${workflow.name} Workflows`}>
          <Stack gap="sm">
            {runningWorkflows.map((run) => {
              const progress = calculateProgress(run)
              return (
                <Paper key={run.workflowRunId} withBorder p="sm">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500} size="sm">{workflow.name}</Text>
                      <Code>{run.workflowRunId}</Code>
                    </div>
                    <Group gap="xs">
                      {progress > 0 && (
                        <Progress
                          animated
                          size="xl"
                          striped
                          value={progress}
                          w={100}
                          color="blue"
                        />
                      )}
                      <Text size="xs" c="dimmed">{progress}%</Text>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => cancelWorkflow(run.workflowRunId)}
                        title="Cancel workflow"
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Paper>
              )
            })}
          </Stack>
        </Alert>
      )}

      {/* Workflow Information */}
      <Alert icon={<IconInfoCircle size={16} />} title="Workflow Information" variant="light">
        <Stack gap="xs">
          <Text size="sm"><strong>Endpoint:</strong> <Code>/{workflow.slug}</Code></Text>
          <Text size="sm"><strong>Method:</strong> <Code>POST</Code></Text>
          <Text size="sm"><strong>Content-Type:</strong> <Code>application/json</Code></Text>
          <Text size="sm"><strong>Total Runs:</strong> {filteredRuns.length}</Text>
          <Text size="sm"><strong>Running:</strong> {runningWorkflows.length}</Text>
        </Stack>
      </Alert>

      <Group align="flex-start" gap="xl">
        {/* Trigger Section */}
        <div style={{ flex: 1 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">
              <IconRocket size={20} style={{ marginRight: 8 }} />
              Trigger Workflow
            </Title>
            <WorkflowTrigger workflow={workflow} defaultPayload={samplePayload} />
          </Card>
        </div>

        {/* Documentation Section */}
        <div style={{ flex: 1 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">
              <IconCode size={20} style={{ marginRight: 8 }} />
              Sample Usage
            </Title>
            
            <Stack gap="md">
              <div>
                <Text size="sm" fw={500} mb="xs">cURL Example:</Text>
                <Code block>
{`curl -X POST http://localhost:3001/${workflow.slug} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(samplePayload, null, 2)}'`}
                </Code>
              </div>

              <div>
                <Text size="sm" fw={500} mb="xs">Expected Payload:</Text>
                <Code block>
                  {JSON.stringify(samplePayload, null, 2)}
                </Code>
              </div>
            </Stack>
          </Card>
        </div>
      </Group>

      {/* Workflow Execution History */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>Execution History</Title>
          <Group gap="sm">
            <Badge variant="light" color={sseConnected ? 'green' : 'red'}>
              {sseConnected ? 'Live' : 'Offline'}
            </Badge>
            <Button
              variant="subtle"
              size="sm"
              leftSection={showDetails ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              onClick={toggleDetails}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </Group>
        </Group>

        {filteredRuns.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" py="xl">
            {sseConnected ? `No ${workflow.name} workflow runs found` : 'Waiting for connection...'}
          </Text>
        ) : (
          <Stack gap="md">
            {filteredRuns.map((run) => (
              <Card key={run.workflowRunId} withBorder p="sm">
                <Group justify="space-between" mb="xs">
                  <Group gap="sm">
                    {getStatusIcon(run.workflowState)}
                    <div>
                      <Text fw={500} size="sm">
                        {run.workflowState.replace('RUN_', '')}
                      </Text>
                      <Code>{run.workflowRunId}</Code>
                    </div>
                  </Group>
                  <Group gap="xs">
                    <Badge size="xs" color={getStatusColor(run.workflowState)} variant="light">
                      {run.workflowState.replace('RUN_', '')}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {new Date(run.workflowRunCreatedAt * 1000).toLocaleString()}
                    </Text>
                    {run.workflowState === 'RUN_STARTED' && (
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="xs"
                        onClick={() => cancelWorkflow(run.workflowRunId)}
                        title="Cancel workflow"
                      >
                        <IconTrash size={12} />
                      </ActionIcon>
                    )}
                  </Group>
                </Group>

                {/* Progress Bar for Running Workflows */}
                {run.workflowState === 'RUN_STARTED' && (
                  <Progress 
                    value={calculateProgress(run)} 
                    size="sm" 
                    color="blue" 
                    animated 
                    striped 
                    mb="sm"
                  />
                )}

                {/* Detailed Step Timeline */}
                <Collapse in={showDetails}>
                  {run.steps && run.steps.length > 0 && (
                    <Timeline lineWidth={2} active={-1} bulletSize={16} mt="md">
                      {run.steps.flatMap((stepGroup: any, groupIndex: number) => {
                        const innerSteps = stepGroup.steps || []
                        
                        return innerSteps.map((step: any, stepIndex: number) => {
                          const isCompleted = step.status === 'completed' || 
                                            step.state === 'STEP_SUCCESS' || 
                                            step.completedAt
                          const isFailed = step.status === 'failed' || 
                                          step.state === 'STEP_FAILED'
                          const isRetrying = step.state === 'STEP_RETRY'
                          
                          return (
                            <Timeline.Item
                              key={`${run.workflowRunId}-${groupIndex}-${stepIndex}`}
                              bullet={
                                <ThemeIcon 
                                  color={isCompleted ? 'green' : isFailed ? 'red' : isRetrying ? 'orange' : 'blue'} 
                                  radius="xl" 
                                  size={16}
                                >
                                  {isCompleted ? <IconCheck size={10} /> : 
                                   isFailed ? <IconX size={10} /> : 
                                   isRetrying ? <IconAlertCircle size={10} /> : 
                                   <IconClock size={10} />}
                                </ThemeIcon>
                              }
                              title={step.stepName || `Step ${stepIndex + 1}`}
                            >
                              <Stack gap="xs">
                                <Text size="xs" c="dimmed">
                                  Status: {step.state || step.status || 'Processing'}
                                </Text>
                                {step.createdAt && (
                                  <Text size="xs" c="dimmed">
                                    Started: {new Date(step.createdAt).toLocaleTimeString()}
                                  </Text>
                                )}
                                {step.completedAt && (
                                  <Text size="xs" c="dimmed">
                                    Completed: {new Date(step.completedAt).toLocaleTimeString()}
                                  </Text>
                                )}
                              </Stack>
                            </Timeline.Item>
                          )
                        })
                      })}
                    </Timeline>
                  )}
                </Collapse>
              </Card>
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  )
}