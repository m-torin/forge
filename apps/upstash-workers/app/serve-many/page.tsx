'use client'

import { Container, Stack, Title, Text, Card, Button, Textarea, Alert, Group, Badge, Code, NumberInput, Select } from '@mantine/core'
import { IconServer, IconPlayerPlay, IconAlertCircle, IconCode } from '@tabler/icons-react'
import { useState } from 'react'

export default function ServeManyWorkflowPage() {
  const [batchSize, setBatchSize] = useState(5)
  const [workflowType, setWorkflowType] = useState('parallel')
  const [dataPayload, setDataPayload] = useState('[{"id": 1, "data": "item1"}, {"id": 2, "data": "item2"}]')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const triggerWorkflow = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const parsedData = JSON.parse(dataPayload)
      const payload = {
        batchSize,
        workflowType,
        items: parsedData,
        timestamp: Date.now()
      }
      
      const response = await fetch('/-call-qstash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route: 'serve-many',
          payload
        })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Group mb="md">
            <IconServer size={32} color="var(--mantine-color-teal-6)" />
            <div>
              <Title order={1}>Serve Many Workflow</Title>
              <Badge variant="light" color="teal">Multiple workflow management</Badge>
            </div>
          </Group>
          <Text c="dimmed">
            This workflow demonstrates how to manage and execute multiple workflows in parallel or sequence, handling batch processing efficiently.
          </Text>
        </div>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} mb="md">Workflow Details</Title>
          <Stack gap="sm">
            <Group>
              <Text fw={500} size="sm">Endpoint:</Text>
              <Code>/serve-many</Code>
            </Group>
            <Group>
              <Text fw={500} size="sm">Method:</Text>
              <Code>POST</Code>
            </Group>
            <Group>
              <Text fw={500} size="sm">Expected Payload:</Text>
              <Code>{'{"batchSize": number, "workflowType": string, "items": array}'}</Code>
            </Group>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} mb="md">Test Workflow</Title>
          <Stack gap="md">
            <NumberInput
              label="Batch Size"
              value={batchSize}
              onChange={(value) => setBatchSize(Number(value) || 5)}
              min={1}
              max={20}
              placeholder="Number of items per batch"
            />
            
            <Select
              label="Workflow Type"
              value={workflowType}
              onChange={(value) => setWorkflowType(value || 'parallel')}
              data={[
                { value: 'parallel', label: 'Parallel Execution' },
                { value: 'sequential', label: 'Sequential Execution' },
                { value: 'batched', label: 'Batched Processing' }
              ]}
            />
            
            <Textarea
              label="Data Items (JSON Array)"
              value={dataPayload}
              onChange={(e) => setDataPayload(e.target.value)}
              rows={4}
              placeholder="Enter JSON array of items to process"
            />
            
            <Button
              onClick={triggerWorkflow}
              loading={loading}
              leftSection={<IconPlayerPlay size={16} />}
              color="teal"
            >
              {loading ? 'Triggering...' : 'Trigger Serve Many Workflow'}
            </Button>
            
            {result && (
              <Alert
                icon={result.error ? <IconAlertCircle size={16} /> : <IconCode size={16} />}
                color={result.error ? 'red' : 'green'}
                title={result.error ? 'Error' : 'Success'}
              >
                <Code block>{JSON.stringify(result, null, 2)}</Code>
              </Alert>
            )}
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} mb="md">Implementation</Title>
          <Text c="dimmed" mb="md">
            This workflow handles multiple items with configurable execution patterns: parallel, sequential, or batched processing.
          </Text>
          <Code block>{`// Example workflow implementation
export async function serveManyWorkflow(payload: { batchSize: number, workflowType: string, items: any[] }) {
  const { batchSize, workflowType, items } = payload
  
  switch (workflowType) {
    case 'parallel':
      // Process all items in parallel
      const parallelResults = await Promise.all(
        items.map(item => processItem(item))
      )
      return { type: 'parallel', results: parallelResults }
      
    case 'sequential':
      // Process items one by one
      const sequentialResults = []
      for (const item of items) {
        const result = await processItem(item)
        sequentialResults.push(result)
      }
      return { type: 'sequential', results: sequentialResults }
      
    case 'batched':
      // Process in batches
      const batchResults = []
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        const batchResult = await Promise.all(
          batch.map(item => processItem(item))
        )
        batchResults.push(batchResult)
      }
      return { type: 'batched', results: batchResults.flat() }
      
    default:
      throw new Error(\`Unknown workflow type: \${workflowType}\`)
  }
}`}</Code>
        </Card>
      </Stack>
    </Container>
  )
}