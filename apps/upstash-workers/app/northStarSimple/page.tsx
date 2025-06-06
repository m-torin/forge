'use client'

import { Container, Stack, Title, Text, Card, Button, Textarea, Alert, Group, Badge, Code, NumberInput, TextInput } from '@mantine/core'
import { IconStar, IconPlayerPlay, IconAlertCircle, IconCode } from '@tabler/icons-react'
import { useState } from 'react'

export default function NorthStarSimpleWorkflowPage() {
  const [email, setEmail] = useState('user@example.com')
  const [amount, setAmount] = useState(50)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const triggerWorkflow = async () => {
    setLoading(true)
    setResult(null)
    
    const payload = {
      email,
      amount,
      timestamp: Date.now()
    }
    
    try {
      const response = await fetch('/-call-qstash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route: 'northStarSimple',
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
            <IconStar size={32} color="var(--mantine-color-orange-6)" />
            <div>
              <Title order={1}>North Star Simple Workflow</Title>
              <Badge variant="light" color="orange">Simple pattern implementation</Badge>
            </div>
          </Group>
          <Text c="dimmed">
            This workflow demonstrates a simplified North Star pattern for basic business logic processing with streamlined error handling.
          </Text>
        </div>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} mb="md">Workflow Details</Title>
          <Stack gap="sm">
            <Group>
              <Text fw={500} size="sm">Endpoint:</Text>
              <Code>/northStarSimple</Code>
            </Group>
            <Group>
              <Text fw={500} size="sm">Method:</Text>
              <Code>POST</Code>
            </Group>
            <Group>
              <Text fw={500} size="sm">Expected Payload:</Text>
              <Code>{'{"email": string, "amount": number, "timestamp": number}'}</Code>
            </Group>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} mb="md">Test Workflow</Title>
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
              onChange={(value) => setAmount(Number(value) || 50)}
              min={1}
              placeholder="Enter amount"
            />
            
            <Button
              onClick={triggerWorkflow}
              loading={loading}
              leftSection={<IconPlayerPlay size={16} />}
              color="orange"
            >
              {loading ? 'Triggering...' : 'Trigger Simple North Star'}
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
            This simplified workflow implements basic business logic with minimal steps and straightforward error handling.
          </Text>
          <Code block>{`// Example workflow implementation
export async function northStarSimpleWorkflow(payload: { email: string, amount: number, timestamp: number }) {
  // Step 1: Basic validation
  if (!payload.email || payload.amount <= 0) {
    throw new Error('Invalid input parameters')
  }
  
  // Step 2: Simple processing
  const result = await processSimpleTransaction({
    email: payload.email,
    amount: payload.amount,
    processedAt: new Date(payload.timestamp).toISOString()
  })
  
  return { success: true, transaction: result }
}`}</Code>
        </Card>
      </Stack>
    </Container>
  )
}