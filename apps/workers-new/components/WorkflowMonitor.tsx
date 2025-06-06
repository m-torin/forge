'use client'

import { useState, useMemo } from 'react'
import { Card, Title, Text, Badge, Group, Stack, Alert, ScrollArea } from '@mantine/core'
import { IconClock, IconCheck, IconX, IconPlayerPlay, IconWifi, IconWifiOff } from '@tabler/icons-react'
import { useWorkflows } from '../contexts/WorkflowsContext'
// Remove hooks that are no longer available in the new orchestration package
import { WorkflowFilters, type WorkflowFilterState } from './WorkflowFilters'

// Add CSS keyframes for pulse animation
const pulseKeyframes = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`

// Inject the CSS if it doesn't exist
if (typeof document !== 'undefined' && !document.getElementById('pulse-animation')) {
  const style = document.createElement('style')
  style.id = 'pulse-animation'
  style.textContent = pulseKeyframes
  document.head.appendChild(style)
}

export function WorkflowMonitor() {
  const { workflowRuns, sseConnected, config, orchestrationProvider } = useWorkflows()
  const [filters, setFilters] = useState<WorkflowFilterState>({
    search: '',
    status: '',
    timeRange: '',
    workflowType: ''
  })

  // Note: The new orchestration package does not include hooks for metrics/history
  // These would need to be implemented using the WorkflowClient directly if needed

  // Apply filters to workflow runs
  const filteredRuns = useMemo(() => {
    let filtered = [...workflowRuns]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(run => 
        run.workflowRunId.toLowerCase().includes(searchLower) ||
        run.workflowUrl.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(run => run.workflowState === filters.status)
    }

    // Workflow type filter
    if (filters.workflowType) {
      filtered = filtered.filter(run => 
        run.workflowUrl.includes(`/${filters.workflowType}`)
      )
    }

    // Time range filter
    if (filters.timeRange) {
      const now = Date.now()
      const timeRangeMs = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }[filters.timeRange] || 0

      if (timeRangeMs > 0) {
        filtered = filtered.filter(run => 
          (now - run.workflowRunCreatedAt * 1000) <= timeRangeMs
        )
      }
    }

    return filtered
  }, [workflowRuns, filters])

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'RUN_STARTED':
        return 'blue'
      case 'RUN_SUCCESS':
        return 'green'
      case 'RUN_FAILED':
        return 'red'
      case 'RUN_CANCELED':
        return 'gray'
      default:
        return 'gray'
    }
  }

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'RUN_STARTED':
        return <IconPlayerPlay size={16} />
      case 'RUN_SUCCESS':
        return <IconCheck size={16} />
      case 'RUN_FAILED':
        return <IconX size={16} />
      case 'RUN_CANCELED':
        return <IconX size={16} />
      default:
        return <IconClock size={16} />
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString()
  }

  const getWorkflowName = (url: string) => {
    const segments = url.split('/')
    return segments[segments.length - 1] || 'Unknown'
  }

  const calculateProgress = (run: any) => {
    if (!run.steps || run.steps.length === 0) return { progress: 0, runningSteps: 0, allSteps: 0 }
    
    const allSteps = run.steps.flatMap((group: any) => group.steps || [])
    if (allSteps.length === 0) return { progress: 0, runningSteps: 0, allSteps: 0 }
    
    const completedSteps = allSteps.filter((step: any) => 
      step.status === 'completed' || step.state === 'STEP_SUCCESS'
    ).length
    
    const runningSteps = allSteps.filter((step: any) => 
      step.status === 'running' || step.state === 'STEP_RUNNING'
    ).length
    
    return { 
      progress: Math.round((completedSteps / allSteps.length) * 100),
      runningSteps,
      allSteps: allSteps.length
    }
  }

  return (
    <Stack gap="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>Live Workflow Monitoring</Title>
          <Group gap="xs">
            <Badge 
              color={sseConnected ? 'green' : 'red'} 
              variant="light"
              leftSection={sseConnected ? <IconWifi size={14} /> : <IconWifiOff size={14} />}
            >
              {sseConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            {orchestrationProvider && (
              <Badge variant="outline" color="violet">
                Orchestration
              </Badge>
            )}
            {config && (
              <Badge variant="outline" color="blue">
                {config.environment}
              </Badge>
            )}
          </Group>
        </Group>

        {!sseConnected && (
          <Alert color="yellow" mb="md" title="Connection Status">
            Real-time monitoring is disconnected. Workflow data may not be current.
          </Alert>
        )}

        {/* Filters */}
        <WorkflowFilters 
          onFilterChange={setFilters}
          workflowRuns={workflowRuns}
        />

        <ScrollArea h={400}>
          <Stack gap="sm">
            {filteredRuns.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                {workflowRuns.length === 0 
                  ? (sseConnected ? 'No workflow runs found' : 'Loading workflow data...')
                  : 'No workflows match the current filters'
                }
              </Text>
            ) : (
              filteredRuns.map((run) => {
              const { progress, runningSteps, allSteps } = calculateProgress(run)
              const workflowName = getWorkflowName(run.workflowUrl)
              
              return (
                <Card key={run.workflowRunId} padding="sm" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Group gap="sm">
                      <Badge
                        color={getStatusColor(run.workflowState)}
                        variant="light"
                        leftSection={getStatusIcon(run.workflowState)}
                        style={run.workflowState === 'RUN_STARTED' ? {
                          animation: 'pulse 2s infinite'
                        } : undefined}
                      >
                        {run.workflowState.replace('RUN_', '')}
                      </Badge>
                      <Text fw={500} size="sm">{workflowName}</Text>
                      {run.workflowState === 'RUN_STARTED' && (
                        <Badge size="xs" color="orange" variant="dot">
                          Running
                        </Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed">
                      {formatTimestamp(run.workflowRunCreatedAt)}
                    </Text>
                  </Group>

                  <Stack gap="xs">
                    <Text size="xs" c="dimmed">
                      ID: {run.workflowRunId}
                    </Text>
                    
                    {run.workflowState === 'RUN_STARTED' && (
                      <div>
                        <Group justify="space-between" mb={4}>
                          <Text size="xs">Progress</Text>
                          <Text size="xs">{progress}% {runningSteps > 0 && `(${runningSteps} running)`}</Text>
                        </Group>
                        <div 
                          style={{ 
                            width: '100%', 
                            height: 4, 
                            backgroundColor: 'var(--mantine-color-gray-3)',
                            borderRadius: 2 
                          }}
                        >
                          <div 
                            style={{ 
                              width: `${progress}%`, 
                              height: '100%', 
                              backgroundColor: runningSteps > 0 ? 'var(--mantine-color-orange-6)' : 'var(--mantine-color-blue-6)',
                              borderRadius: 2,
                              transition: 'width 0.3s ease, background-color 0.3s ease',
                              animation: runningSteps > 0 ? 'pulse 1.5s infinite' : undefined
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {run.workflowRunCompletedAt && (
                      <Text size="xs" c="dimmed">
                        Completed: {formatTimestamp(run.workflowRunCompletedAt)}
                      </Text>
                    )}
                  </Stack>
                </Card>
              )
            })
          )}
          </Stack>
        </ScrollArea>
      </Card>
    </Stack>
  )
}