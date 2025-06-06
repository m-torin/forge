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
  Select,
} from '@mantine/core'
import {
  IconBrain,
  IconPlayerPlay,
  IconAlertCircle,
  IconCode,
} from '@tabler/icons-react'
import { useState } from 'react'

export default function VercelAISDKWorkflowPage() {
  const [prompt, setPrompt] = useState(
    'Explain quantum computing in simple terms',
  )
  const [model, setModel] = useState('gpt-3.5-turbo')
  const [maxTokens, setMaxTokens] = useState('100')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const triggerWorkflow = async () => {
    setLoading(true)
    setResult(null)

    const payload = {
      prompt,
      model,
      maxTokens: parseInt(maxTokens) || 100,
      timestamp: Date.now(),
    }

    try {
      const response = await fetch('/-call-qstash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route: 'vercel-ai-sdk',
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
            <IconBrain size={32} color="var(--mantine-color-pink-6)" />
            <div>
              <Title order={1}>Vercel AI SDK Workflow</Title>
              <Badge variant="light" color="pink">
                AI-powered processing
              </Badge>
            </div>
          </Group>
          <Text c="dimmed">
            This workflow demonstrates AI-powered processing using the Vercel AI
            SDK. It can generate text responses using various language models.
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
              <Code>/vercel-ai-sdk</Code>
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
                {'{"prompt": string, "model": string, "maxTokens": number}'}
              </Code>
            </Group>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={3} mb="md">
            Test Workflow
          </Title>
          <Stack gap="md">
            <Textarea
              label="Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Enter your AI prompt here"
            />

            <Select
              label="Model"
              value={model}
              onChange={(value) => setModel(value || 'gpt-3.5-turbo')}
              data={[
                { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                { value: 'gpt-4', label: 'GPT-4' },
                { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
              ]}
            />

            <TextInput
              label="Max Tokens"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              placeholder="Maximum tokens to generate"
            />

            <Button
              onClick={triggerWorkflow}
              loading={loading}
              leftSection={<IconPlayerPlay size={16} />}
              color="pink"
            >
              {loading ? 'Triggering...' : 'Trigger AI Workflow'}
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
            This workflow uses the Vercel AI SDK to generate responses using
            various language models with configurable parameters.
          </Text>
          <Code block>{`// Example workflow implementation
export async function aiWorkflow(payload: { prompt: string, model: string, maxTokens: number }) {
  const { generateText } = await import('ai')
  const { openai } = await import('@ai-sdk/openai')
  
  try {
    const result = await generateText({
      model: openai(payload.model),
      prompt: payload.prompt,
      maxTokens: payload.maxTokens,
    })
    
    return {
      success: true,
      text: result.text,
      usage: result.usage,
      model: payload.model
    }
  } catch (error) {
    throw new Error(\`AI generation failed: \${error.message}\`)
  }
}`}</Code>
        </Card>
      </Stack>
    </Container>
  )
}
