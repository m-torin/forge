import { notFound } from 'next/navigation'
import { Container } from '@mantine/core'
import { getWorkflows } from '../../../lib/workflows'
import { WorkflowMonitorPage } from '../../../components/WorkflowMonitorPage'

interface WorkflowPageProps {
  params: Promise<{ slug: string }>
}

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  const { slug } = await params
  const workflows = await getWorkflows()
  const workflow = workflows.find(w => w.slug === slug)

  if (!workflow) {
    notFound()
  }

  // Get workflow source code (simplified - in real app you might parse the actual file)
  const samplePayload = getSamplePayload(slug)

  return (
    <Container size="lg" py="xl">
      <WorkflowMonitorPage workflow={workflow} samplePayload={samplePayload} />
    </Container>
  )
}

// Helper function to get sample payloads for different workflows
function getSamplePayload(slug: string): any {
  const payloads: Record<string, any> = {
    sleep: { duration: 3, message: "Hello from sleep workflow" },
    sleepWithoutAwait: { duration: 2, data: "test" },
    northStarSimple: { date: Date.now(), email: "test@example.com", amount: 100 },
    northStar: { userId: "user_123", action: "process", metadata: { priority: "high" } },
    path: { path: "/api/test", method: "GET" },
    auth: { username: "testuser", action: "login" },
    'vercel-ai-sdk': { prompt: "Generate a workflow description", model: "gpt-3.5-turbo" },
    'serve-many': { workflows: ["workflow1", "workflow2"], parallel: true }
  }

  return payloads[slug] || { message: "Hello World", timestamp: Date.now() }
}