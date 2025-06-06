'use client'

import { Container, Stack, Title, Text, Card, Button, Textarea, Alert, Group, Badge, Code, NumberInput } from '@mantine/core'
import { IconClockPlay, IconPlayerPlay, IconAlertCircle, IconCode } from '@tabler/icons-react'
import { useState } from 'react'

export default function SleepWithoutAwaitWorkflowPage() {
  const [duration, setDuration] = useState(3)
  const [message, setMessage] = useState('Non-blocking sleep workflow')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const triggerWorkflow = async () => {
    setLoading(true)
    setResult(null)
    
    const payload = {
      duration: duration * 1000, // Convert to milliseconds
      message,
      nonBlocking: true
    }
    
    try {
      const response = await fetch('/-call-qstash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route: 'sleepWithoutAwait',
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
            <IconClockPlay size={32} color="var(--mantine-color-yellow-6)" />
            <div>
              <Title order={1}>Sleep Without Await Workflow</Title>
              <Badge variant="light" color="yellow">Non-blocking execution</Badge>
            </div>
          </Group>
          <Text c="dimmed">
            This workflow demonstrates non-blocking sleep functionality, allowing the workflow to initiate sleep operations without blocking execution flow.
          </Text>
        </div>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} mb="md">Workflow Details</Title>
          <Stack gap="sm">
            <Group>
              <Text fw={500} size="sm">Endpoint:</Text>
              <Code>/sleepWithoutAwait</Code>
            </Group>
            <Group>
              <Text fw={500} size="sm">Method:</Text>
              <Code>POST</Code>
            </Group>
            <Group>
              <Text fw={500} size="sm">Expected Payload:</Text>
              <Code>{'{"duration": number, "message": string, "nonBlocking": boolean}'}</Code>
            </Group>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} mb="md">Test Workflow</Title>
          <Stack gap="md">
            <NumberInput
              label="Sleep Duration (seconds)"
              value={duration}
              onChange={(value) => setDuration(Number(value) || 3)}
              min={1}
              max={30}
              placeholder="Duration in seconds"
            />
            
            <Textarea
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Enter a message"
            />
            
            <Button
              onClick={triggerWorkflow}
              loading={loading}
              leftSection={<IconPlayerPlay size={16} />}
              color="yellow"
            >
              {loading ? 'Triggering...' : 'Trigger Non-Blocking Sleep'}
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
            This workflow demonstrates non-blocking sleep patterns where operations can be scheduled without waiting for completion.
          </Text>
          <Code block>{`// Example workflow implementation
export async function sleepWithoutAwaitWorkflow(payload: { duration: number, message: string, nonBlocking: boolean }) {
  console.log('Starting non-blocking sleep workflow:', payload.message)
  
  // Schedule sleep without waiting
  const sleepPromise = scheduleNonBlockingSleep(payload.duration)
  
  // Continue with other operations immediately
  const immediateResult = await processImmediateOperations(payload.message)
  
  // Optionally check sleep status later
  if (!payload.nonBlocking) {
    await sleepPromise
  }
  
  return { 
    completed: true, 
    message: payload.message,
    sleepScheduled: true,
    immediateResult 
  }
}`}</Code>
        </Card>
      </Stack>
    </Container>
  )
}