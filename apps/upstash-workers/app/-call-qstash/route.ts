import { Client as WorkflowClient } from '@upstash/workflow'
import { NextRequest } from 'next/server'
import { getQStashConfig } from '../../lib/qstash-config'

// Initialize client lazily to respect feature flags
let client: WorkflowClient | null = null

async function getClient(): Promise<WorkflowClient> {
  if (!client) {
    const config = await getQStashConfig()
    console.log('QStash Config:', {
      mode: config.mode,
      url: config.url,
      hasToken: !!config.token,
      hasSigningKeys: !!(config.currentSigningKey && config.nextSigningKey)
    })
    
    client = new WorkflowClient({
      baseUrl: config.url,
      token: config.token,
    })
  }
  return client
}

export const POST = async (request: NextRequest) => {
  const { route, payload } = (await request.json()) as {
    route: string
    payload: unknown
  }

  console.log('Route:', route)
  console.log('Payload:', payload)

  try {
    const baseUrl =
      process.env.UPSTASH_WORKFLOW_URL ??
      request.url.replace('/-call-qstash', '')

    const workflowClient = await getClient()
    const { workflowRunId } = await workflowClient.trigger({
      url: `${baseUrl}/${route}`,
      body: payload,
      headers: {
        test: 'value',
      },
    })

    return new Response(JSON.stringify({ workflowRunId }), { status: 200 })
  } catch (error) {
    console.error('QStash Error Details:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return new Response(
      JSON.stringify({ 
        error: `Error when publishing to QStash: ${error}`,
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
      },
    )
  }
}
