'use client'

import { useState, useMemo } from 'react'
import { Card, Title, Text, Badge, Group, Stack, Alert, ScrollArea } from '@mantine/core'
import { IconClock, IconCheck, IconX, IconPlayerPlay, IconWifi, IconWifiOff } from '@tabler/icons-react'
import { useWorkflows } from '../contexts/WorkflowsContext'
import { useWorkflowMetrics, useExecutionHistory } from '@repo/orchestration-new'
import { WorkflowFilters, type WorkflowFilterState } from './WorkflowFilters'

export function WorkflowMonitor() {
  const { workflowRuns, sseConnected, config, orchestrationProvider } = useWorkflows()
  const [filters, setFilters] = useState<WorkflowFilterState>({
    search: '',
    status: '',
    timeRange: '',
    workflowType: ''
  })

  // Use orchestration hooks if provider is available
  const orchestrationMetrics = orchestrationProvider ? useWorkflowMetrics('all', {
    provider: orchestrationProvider,
    refreshInterval: 5000
  }) : null

  const orchestrationHistory = orchestrationProvider ? useExecutionHistory('all', {
    provider: orchestrationProvider,
    refreshInterval: 5000,
    pagination: { limit: 50, offset: 0 }
  }) : null

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
    if (!run.steps || run.steps.length === 0) return 0
    
    const allSteps = run.steps.flatMap((group: any) => group.steps || [])
    if (allSteps.length === 0) return 0
    
    const completedSteps = allSteps.filter((step: any) => 
      step.status === 'completed' || step.state === 'STEP_SUCCESS'
    ).length
    
    return Math.round((completedSteps / allSteps.length) * 100)
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
              const progress = calculateProgress(run)
              const workflowName = getWorkflowName(run.workflowUrl)
              
              return (
                <Card key={run.workflowRunId} padding="sm" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Group gap="sm">
                      <Badge
                        color={getStatusColor(run.workflowState)}
                        variant="light"
                        leftSection={getStatusIcon(run.workflowState)}
                      >
                        {run.workflowState.replace('RUN_', '')}
                      </Badge>
                      <Text fw={500} size="sm">{workflowName}</Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {formatTimestamp(run.workflowRunCreatedAt)}
                    </Text>
                  </Group>

                  <Stack gap="xs">
                    <Text size="xs" c="dimmed">
                      ID: {run.workflowRunId}
                    </Text>
                    
                    {run.workflowState === 'RUN_STARTED' && progress > 0 && (
                      <div>
                        <Group justify="space-between" mb={4}>
                          <Text size="xs">Progress</Text>
                          <Text size="xs">{progress}%</Text>
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
                              backgroundColor: 'var(--mantine-color-blue-6)',
                              borderRadius: 2,
                              transition: 'width 0.3s ease'
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