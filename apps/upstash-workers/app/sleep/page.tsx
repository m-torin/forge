'use client'

import {
  Container,
  Stack,
  Title,
  Text,
  Card,
  Button,
  Textarea,
  Alert,
  Group,
  Badge,
  Code,
  NumberInput,
} from '@mantine/core'
import {
  IconClock,
  IconPlayerPlay,
  IconAlertCircle,
  IconCode,
} from '@tabler/icons-react'
import { useState } from 'react'

export default function SleepWorkflowPage() {
  const [duration, setDuration] = useState(5)
  const [message, setMessage] = useState('Hello from sleep workflow!')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const triggerWorkflow = async () => {
    setLoading(true)
    setResult(null)

    const payload = {
      duration: duration * 1000, // Convert to milliseconds
      message,
    }

    try {
      const response = await fetch('/-call-qstash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route: 'sleep',
          payload,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Group mb="md">
            <IconClock size={32} color="var(--mantine-color-green-6)" />
            <div>
              <Title order={1}>Sleep Workflow</Title>
              <Badge variant="light" color="green">
                Time-based processing
              </Badge>
            </div>
          </Group>
          <Text c="dimmed">
            This workflow demonstrates sleep functionality, allowing workflows
            to pause execution for a specified duration before continuing.
          </Text>
        </div>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} mb="md">
            Workflow Details
          </Title>
          <Stack gap="sm">
            <Group>
              <Text fw={500} size="sm">
                Endpoint:
              </Text>
              <Code>/sleep</Code>
            </Group>
            <Group>
              <Text fw={500} size="sm">
                Method:
              </Text>
              <Code>POST</Code>
            </Group>
            <Group>
              <Text fw={500} size="sm">
                Expected Payload:
              </Text>
              <Code>{'{"duration": number, "message": string}'}</Code>
            </Group>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} mb="md">
            Test Workflow
          </Title>
          <Stack gap="md">
            <NumberInput
              label="Sleep Duration (seconds)"
              value={duration}
              onChange={(value) => setDuration(Number(value) || 5)}
              min={1}
              max={60}
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
              color="green"
            >
              {loading ? 'Triggering...' : 'Trigger Sleep Workflow'}
            </Button>

            {result && (
              <Alert
                icon={
                  result.error ? (
                    <IconAlertCircle size={16} />
                  ) : (
                    <IconCode size={16} />
                  )
                }
                color={result.error ? 'red' : 'green'}
                title={result.error ? 'Error' : 'Success'}
              >
                <Code block>{JSON.stringify(result, null, 2)}</Code>
              </Alert>
            )}
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} mb="md">
            Implementation
          </Title>
          <Text c="dimmed" mb="md">
            This workflow demonstrates how to use sleep functionality in Upstash
            Workflows to create time-based delays.
          </Text>
          <Code block>{`// Example workflow implementation
export async function sleepWorkflow(payload: { duration: number, message: string }) {
  console.log('Starting sleep workflow:', payload.message)
  
  // Sleep for the specified duration
  await sleep(payload.duration)
  
  console.log('Workflow resumed after', payload.duration, 'ms')
  return { completed: true, message: payload.message }
}`}</Code>
        </Card>
      </Stack>
    </Container>
  )
}
