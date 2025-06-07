'use client'

import {
  Container,
  Stack,
  Title,
  Text,
  Group,
  SimpleGrid,
  Card,
  Button,
  Select,
  Textarea,
  Anchor,
  Image,
  Badge,
  Alert,
  Code,
  JsonInput,
} from '@mantine/core'
import {
  IconExternalLink,
  IconFileText,
  IconBrandGithub,
  IconCheck,
  IconX,
  IconAlertCircle,
} from '@tabler/icons-react'
import { FormEvent, Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocalQStashClientFlag } from '../lib/client-flags'
import { getExamplePayload, type WorkflowName } from '../lib/workflow-schemas'

const routes = [
  'path',
  'sleep',
  'sleepWithoutAwait',
  'northStarSimple',
  'northStar',
  'auth',
  'vercel-ai-sdk',
  'serve-many',
]

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Page />
    </Suspense>
  )
}

const Page = () => {
  const searchParams = useSearchParams()
  const useLocalQStash = useLocalQStashClientFlag()
  const search = searchParams.get('function')
  const [route, setRoute] = useState(search ?? 'path')
  const [requestBody, setRequestBody] = useState(
    getExamplePayload(route as WorkflowName),
  )
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Update example payload when route changes
  const handleRouteChange = (newRoute: string) => {
    setRoute(newRoute)
    setRequestBody(getExamplePayload(newRoute as WorkflowName))
    setResult(null)
    setError(null)
  }

  // form submit handler
  const handleSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError(null)

    const url = `/-call-qstash`

    try {
      // Validate JSON before sending
      let payload
      try {
        payload = JSON.parse(requestBody)
      } catch (jsonError) {
        throw new Error('Invalid JSON format in request body')
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          route,
          payload,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP ${response.status}`)
      }

      setResult(responseData)
      console.log('Workflow triggered successfully:', responseData)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <Image
            src="/upstash-logo.svg"
            alt="Upstash Logo"
            width={60}
            height={60}
            style={{ margin: '0 auto 2rem' }}
          />

          <Title order={1} size="h1" mb="md">
            Get Started with Upstash Workflow
          </Title>
          <Text size="lg" c="dimmed" maw={600} mx="auto">
            This is a simple example to demonstrate Upstash Workflow with
            Next.js. Start a workflow by selecting a route and providing a
            request body.
          </Text>

          <Group justify="center" mt="xl">
            <Anchor
              href="https://upstash.com/docs/qstash/workflow/quickstarts/vercel-nextjs"
              target="_blank"
              underline="never"
            >
              <Button leftSection={<IconFileText size={16} />} variant="light">
                Documentation
              </Button>
            </Anchor>
            <Anchor
              href="https://github.com/upstash/workflow-js/tree/main/examples/nextjs"
              target="_blank"
              underline="never"
            >
              <Button
                leftSection={<IconBrandGithub size={16} />}
                variant="light"
              >
                Repository
              </Button>
            </Anchor>
          </Group>
        </div>

        {/* QStash Mode Information */}
        <Card shadow="sm" padding="lg" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>QStash Configuration</Title>
            <Badge variant="light" color={useLocalQStash ? 'orange' : 'blue'}>
              {useLocalQStash ? 'Local Mode' : 'Production Mode'}
            </Badge>
          </Group>
          <Text c="dimmed" size="sm">
            {useLocalQStash
              ? 'Using local QStash CLI server for development. Workflows will be executed locally without external dependencies.'
              : 'Using production QStash service. Workflows will be executed in the cloud with full QStash features.'}
          </Text>
          {useLocalQStash && (
            <Text c="dimmed" size="sm" mt="xs">
              Make sure you have the QStash CLI running locally:{' '}
              <code>npx @upstash/qstash-cli dev</code>
            </Text>
          )}
        </Card>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          {/* Step 1 */}
          <Card shadow="sm" padding="lg" withBorder>
            <Stack gap="md">
              <Group>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'var(--mantine-color-blue-1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--mantine-color-blue-6)',
                  }}
                >
                  1
                </div>
                <Title order={3}>Local Development</Title>
              </Group>

              <Text c="dimmed" size="sm">
                Upstash Workflow requires a publicly accessible API endpoint to
                function.
              </Text>
              <Text
                c="dimmed"
                size="sm"
                style={{ textDecoration: 'underline' }}
              >
                If you are not working on local server, skip this step.
              </Text>

              <Anchor
                href="https://upstash.com/docs/qstash/workflow/howto/local-development"
                target="_blank"
                underline="never"
              >
                <Button
                  leftSection={<IconExternalLink size={16} />}
                  variant="outline"
                  size="sm"
                >
                  ngrok setup
                </Button>
              </Anchor>
            </Stack>
          </Card>

          {/* Step 2 */}
          <Card shadow="sm" padding="lg" withBorder>
            <Stack gap="md">
              <Group>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'var(--mantine-color-green-1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--mantine-color-green-6)',
                  }}
                >
                  2
                </div>
                <Title order={3}>Send Request</Title>
              </Group>

              <Text c="dimmed" size="sm">
                Each example has its own payload structure. Navigate to the
                corresponding route file in your left sidebar to see details.
              </Text>

              <form onSubmit={handleSend}>
                <Stack gap="sm">
                  <Select
                    label="Route"
                    value={route}
                    onChange={(value) => handleRouteChange(value || 'path')}
                    data={routes.map((r) => ({ value: r, label: r }))}
                    size="sm"
                  />

                  <Textarea
                    label="Request Body (JSON)"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={4}
                    size="sm"
                    placeholder="Enter valid JSON payload"
                    description={`Example payload for ${route} workflow`}
                  />

                  <Button
                    type="submit"
                    loading={loading}
                    color="green"
                    size="sm"
                    disabled={!requestBody.trim()}
                  >
                    {loading ? 'Triggering Workflow...' : 'Trigger Workflow'}
                  </Button>

                  {/* Success Result */}
                  {result && (
                    <Alert
                      icon={<IconCheck size={16} />}
                      color="green"
                      title="Workflow Triggered Successfully"
                      mt="sm"
                    >
                      <Stack gap="xs">
                        <Text size="sm">
                          <strong>Workflow ID:</strong>{' '}
                          <Code>{result.workflowRunId}</Code>
                        </Text>
                        <Text size="sm">
                          <strong>Route:</strong> {result.route}
                        </Text>
                        <Text size="sm">
                          <strong>Status:</strong> {result.status}
                        </Text>
                        <Text size="sm">
                          <strong>Triggered at:</strong> {result.timestamp}
                        </Text>
                      </Stack>
                    </Alert>
                  )}

                  {/* Error Display */}
                  {error && (
                    <Alert
                      icon={<IconX size={16} />}
                      color="red"
                      title="Workflow Trigger Failed"
                      mt="sm"
                    >
                      <Stack gap="xs">
                        <Text size="sm">{error}</Text>
                        {error.includes('QStash CLI') && (
                          <Text size="sm" c="dimmed">
                            💡 Run <Code>pnpm qstash:dev</Code> in a separate
                            terminal
                          </Text>
                        )}
                      </Stack>
                    </Alert>
                  )}
                </Stack>
              </form>
            </Stack>
          </Card>

          {/* Step 3 */}
          <Card shadow="sm" padding="lg" withBorder>
            <Stack gap="md">
              <Group>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'var(--mantine-color-orange-1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--mantine-color-orange-6)',
                  }}
                >
                  3
                </div>
                <Title order={3}>View Logs</Title>
              </Group>

              <Text c="dimmed" size="sm">
                After running a workflow, navigate to the Upstash Console to see
                the related logs.
              </Text>

              <Anchor
                href="https://console.upstash.com/qstash?tab=workflow"
                target="_blank"
                underline="never"
              >
                <Button
                  leftSection={<IconExternalLink size={16} />}
                  variant="outline"
                  size="sm"
                >
                  Upstash Console
                </Button>
              </Anchor>

              <Image
                src="/ss.png"
                alt="Upstash Console Screenshot"
                style={{
                  border: '1px solid var(--mantine-color-gray-3)',
                  borderRadius: 8,
                }}
              />
            </Stack>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  )
}
