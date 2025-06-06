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
  TextInput,
} from '@mantine/core'
import {
  IconStarFilled,
  IconPlayerPlay,
  IconAlertCircle,
  IconCode,
} from '@tabler/icons-react'
import { useState } from 'react'

export default function NorthStarWorkflowPage() {
  const [email, setEmail] = useState('user@example.com')
  const [amount, setAmount] = useState(100)
  const [date, setDate] = useState(Date.now())
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const triggerWorkflow = async () => {
    setLoading(true)
    setResult(null)

    const payload = {
      email,
      amount,
      date,
    }

    try {
      const response = await fetch('/-call-qstash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route: 'northStar',
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
            <IconStarFilled size={32} color="var(--mantine-color-red-6)" />
            <div>
              <Title order={1}>North Star Advanced Workflow</Title>
              <Badge variant="light" color="red">
                Advanced processing
              </Badge>
            </div>
          </Group>
          <Text c="dimmed">
            This is an advanced workflow implementing the North Star pattern for
            complex business logic processing with error handling and retry
            mechanisms.
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
              <Code>/northStar</Code>
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
                {'{"email": string, "amount": number, "date": number}'}
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
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />

            <NumberInput
              label="Amount"
              value={amount}
              onChange={(value) => setAmount(Number(value) || 100)}
              min={1}
              placeholder="Enter amount"
            />

            <NumberInput
              label="Date (timestamp)"
              value={date}
              onChange={(value) => setDate(Number(value) || Date.now())}
              placeholder="Enter timestamp"
            />

            <Button
              onClick={triggerWorkflow}
              loading={loading}
              leftSection={<IconPlayerPlay size={16} />}
              color="red"
            >
              {loading ? 'Triggering...' : 'Trigger North Star Workflow'}
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
            This advanced workflow implements complex business logic with
            multiple steps, error handling, and retry mechanisms.
          </Text>
          <Code block>{`// Example workflow implementation
export async function northStarWorkflow(payload: { email: string, amount: number, date: number }) {
  try {
    // Step 1: Validate input
    await validateInput(payload)
    
    // Step 2: Process payment
    const paymentResult = await processPayment(payload.amount)
    
    // Step 3: Send notification
    await sendNotification(payload.email, paymentResult)
    
    // Step 4: Update records
    const record = await updateRecords(payload.date, paymentResult)
    
    return { success: true, record }
  } catch (error) {
    await handleError(error, payload)
    throw error
  }
}`}</Code>
        </Card>
      </Stack>
    </Container>
  )
}
