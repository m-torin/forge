import { Client as WorkflowClient } from '@upstash/workflow'
import { NextRequest } from 'next/server'
import { getQStashConfig } from '../../lib/qstash-config'
import {
  validateWorkflowPayload,
  type WorkflowName,
} from '../../lib/workflow-schemas'

// Initialize client lazily to respect feature flags
let client: WorkflowClient | null = null

async function getClient(): Promise<WorkflowClient> {
  if (!client) {
    const config = await getQStashConfig()
    console.log('QStash Config:', {
      mode: config.mode,
      url: config.url,
      hasToken: !!config.token,
      hasSigningKeys: !!(config.currentSigningKey && config.nextSigningKey),
    })

    client = new WorkflowClient({
      baseUrl: config.url,
      token: config.token,
    })
  }
  return client
}

export const POST = async (request: NextRequest) => {
  let requestData

  try {
    requestData = await request.json()
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Invalid JSON in request body',
        details: 'Please ensure your request body contains valid JSON',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { route, payload } = requestData as {
    route: string
    payload: unknown
  }

  // Validate route parameter
  if (!route || typeof route !== 'string') {
    return new Response(
      JSON.stringify({
        error: 'Invalid route parameter',
        details: 'Route must be a non-empty string',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Validate workflow payload
  const validation = validateWorkflowPayload(route as WorkflowName, payload)
  if (!validation.success) {
    return new Response(
      JSON.stringify({
        error: 'Invalid payload',
        details: validation.error,
        route,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  console.log('Route:', route)
  console.log('Validated Payload:', validation.data)

  try {
    const baseUrl =
      process.env.UPSTASH_WORKFLOW_URL ??
      request.url.replace('/-call-qstash', '')

    const workflowClient = await getClient()
    const { workflowRunId } = await workflowClient.trigger({
      url: `${baseUrl}/${route}`,
      body: validation.data, // Use validated payload
      headers: {
        'Content-Type': 'application/json',
        'X-Workflow-Route': route,
        'X-Request-ID': crypto.randomUUID(),
      },
    })

    return new Response(
      JSON.stringify({
        workflowRunId,
        route,
        status: 'triggered',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('QStash Error Details:', error)
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace',
    )

    // Provide more specific error messages
    let errorMessage = 'Unknown error occurred'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        errorMessage =
          'Could not connect to QStash server. Make sure QStash CLI is running locally (pnpm qstash:dev)'
        statusCode = 503 // Service Unavailable
      } else if (
        error.message.includes('401') ||
        error.message.includes('403')
      ) {
        errorMessage =
          'Authentication failed. Check your QStash token configuration'
        statusCode = 401
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. QStash server might be overloaded'
        statusCode = 504 // Gateway Timeout
      } else {
        errorMessage = error.message
      }
    }

    return new Response(
      JSON.stringify({
        error: `Workflow trigger failed: ${errorMessage}`,
        route,
        timestamp: new Date().toISOString(),
        troubleshooting: {
          local: 'Ensure QStash CLI is running: pnpm qstash:dev',
          production: 'Check environment variables and Upstash Console',
          docs: 'https://upstash.com/docs/qstash/workflow',
        },
      }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
