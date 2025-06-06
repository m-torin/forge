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
  TextInput,
} from '@mantine/core'
import {
  IconSettings,
  IconPlayerPlay,
  IconAlertCircle,
  IconCode,
} from '@tabler/icons-react'
import { useState } from 'react'

export default function AuthWorkflowPage() {
  const [username, setUsername] = useState('john_doe')
  const [email, setEmail] = useState('john@example.com')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const triggerWorkflow = async () => {
    setLoading(true)
    setResult(null)

    const payload = {
      username,
      email,
      timestamp: Date.now(),
    }

    try {
      const response = await fetch('/-call-qstash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route: 'auth',
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
            <IconSettings size={32} color="var(--mantine-color-violet-6)" />
            <div>
              <Title order={1}>Basic Workflow</Title>
              <Badge variant="light" color="violet">
                Simple two-step workflow
              </Badge>
            </div>
          </Group>
          <Text c="dimmed">
            This is a simple two-step workflow example that demonstrates basic
            workflow execution with user authentication and processing.
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
              <Code>/auth</Code>
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
              <Code>
                {'{"username": string, "email": string, "timestamp": number}'}
              </Code>
            </Group>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} mb="md">
            Test Workflow
          </Title>
          <Stack gap="md">
            <TextInput
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />

            <TextInput
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />

            <Button
              onClick={triggerWorkflow}
              loading={loading}
              leftSection={<IconPlayerPlay size={16} />}
              color="violet"
            >
              {loading ? 'Triggering...' : 'Trigger Basic Workflow'}
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
            This workflow demonstrates a simple two-step process: authentication
            validation and user data processing.
          </Text>
          <Code block>{`// Example workflow implementation
export async function basicWorkflow(payload: { username: string, email: string, timestamp: number }) {
  // Step 1: Validate user credentials
  const isValid = await validateUser(payload.username, payload.email)
  
  if (!isValid) {
    throw new Error('Invalid user credentials')
  }
  
  // Step 2: Process user data
  const result = await processUserData({
    ...payload,
    validatedAt: new Date().toISOString()
  })
  
  return result
}`}</Code>
        </Card>
      </Stack>
    </Container>
  )
}
