'use client'

import { useState, useCallback } from 'react'
import { Button, Textarea, Stack, Alert, Text, Badge, Group } from '@mantine/core'
import { IconCode, IconPlayerPlay } from '@tabler/icons-react'
import { useWorkflows } from '../contexts/WorkflowsContext'
import { useWorkflow } from '@repo/orchestration-new'
import type { WorkflowInfo } from '../lib/workflows'

interface WorkflowTriggerProps {
  readonly workflow: WorkflowInfo
  readonly defaultPayload: unknown
}

interface WorkflowResponse {
  readonly success: boolean
  readonly workflowRunId?: string
  readonly environment?: string
  readonly mode?: string
  readonly workflowUrl?: string
  readonly error?: string
  readonly message?: string
}

export function WorkflowTrigger({ workflow, defaultPayload }: WorkflowTriggerProps) {
  const [payload, setPayload] = useState(() => JSON.stringify(defaultPayload, null, 2))
  const [response, setResponse] = useState<WorkflowResponse | null>(null)
  const { executeWorkflow, isExecuting, orchestrationProvider } = useWorkflows()

  // Use orchestration hook if provider is available
  const orchestrationWorkflow = orchestrationProvider ? useWorkflow(workflow.slug, {
    provider: orchestrationProvider,
    autoRefresh: true,
    pollInterval: 2000
  }) : null

  const handleTrigger = useCallback(async () => {
    try {
      setResponse(null)
      const parsedPayload = JSON.parse(payload)
      const result = await executeWorkflow(workflow.slug, parsedPayload)
      setResponse(result as WorkflowResponse)
    } catch (error) {
      console.error('Failed to trigger workflow:', error)
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [payload, executeWorkflow, workflow.slug])

  const handlePayloadChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPayload(event.target.value)
  }, [])

  return (
    <Stack gap="md">
      {/* System Status */}
      <Group gap="xs">
        <Badge 
          variant="light" 
          color={orchestrationProvider ? 'violet' : 'blue'}
        >
          {orchestrationProvider ? 'Orchestration System' : 'Legacy System'}
        </Badge>
        {orchestrationWorkflow?.execution && (
          <Badge 
            variant="outline" 
            color={
              orchestrationWorkflow.execution.status === 'completed' ? 'green' :
              orchestrationWorkflow.execution.status === 'failed' ? 'red' :
              orchestrationWorkflow.execution.status === 'running' ? 'blue' : 'gray'
            }
          >
            {orchestrationWorkflow.execution.status}
          </Badge>
        )}
      </Group>

      <Textarea
        label="Request Payload"
        description="JSON payload to send to the workflow"
        placeholder="Enter JSON payload..."
        value={payload}
        onChange={handlePayloadChange}
        rows={8}
        required
        leftSection={<IconCode size={16} />}
      />

      <Button
        onClick={handleTrigger}
        loading={isExecuting}
        size="md"
        leftSection={<IconPlayerPlay size={16} />}
        fullWidth
      >
        {isExecuting ? 'Executing Workflow...' : 'Execute Workflow'}
      </Button>

      {/* Response Display */}
      {response && (
        <Alert
          color={response.success ? 'green' : 'red'}
          title={response.success ? 'Workflow Triggered Successfully' : 'Workflow Failed'}
        >
          {response.success ? (
            <Stack gap="xs">
              <Text size="sm"><strong>Workflow Run ID:</strong> {response.workflowRunId}</Text>
              <Text size="sm"><strong>Environment:</strong> {response.environment} ({response.mode})</Text>
              <Text size="sm"><strong>Workflow URL:</strong> {response.workflowUrl}</Text>
              <Text size="sm" c="dimmed">
                {response.mode === 'local'
                  ? 'Check the QStash CLI console for execution logs'
                  : 'Check the Upstash Console for execution logs'}
              </Text>
            </Stack>
          ) : (
            <Text size="sm">{response.error ?? response.message}</Text>
          )}
        </Alert>
      )}
    </Stack>
  )
}