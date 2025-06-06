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
} from '@mantine/core'
import {
  IconRoute,
  IconPlayerPlay,
  IconAlertCircle,
  IconCode,
} from '@tabler/icons-react'
import { useState } from 'react'

export default function PathWorkflowPage() {
  const [payload, setPayload] = useState(
    '{"path": "/api/users", "method": "GET"}',
  )
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const triggerWorkflow = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/-call-qstash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route: 'path',
          payload: JSON.parse(payload),
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
            <IconRoute size={32} color="var(--mantine-color-blue-6)" />
            <div>
              <Title order={1}>Path Workflow</Title>
              <Badge variant="light" color="blue">
                Route-based processing
              </Badge>
            </div>
          </Group>
          <Text c="dimmed">
            This workflow demonstrates path-based routing and processing. It can
            handle different API endpoints and HTTP methods.
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
              <Code>/path</Code>
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
              <Code>{'{"path": string, "method": string}'}</Code>
            </Group>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} mb="md">
            Test Workflow
          </Title>
          <Stack gap="md">
            <Textarea
              label="Payload (JSON)"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={4}
              placeholder="Enter your JSON payload here"
            />

            <Button
              onClick={triggerWorkflow}
              loading={loading}
              leftSection={<IconPlayerPlay size={16} />}
              color="blue"
            >
              {loading ? 'Triggering...' : 'Trigger Workflow'}
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
            This workflow processes path-based requests and can route to
            different handlers based on the provided path and method.
          </Text>
          <Code block>{`// Example workflow implementation
export async function pathWorkflow(payload: { path: string, method: string }) {
  // Process the path and method
  const result = await handleRoute(payload.path, payload.method)
  return result
}`}</Code>
        </Card>
      </Stack>
    </Container>
  )
}
