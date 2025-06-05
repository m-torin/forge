import { Client as WorkflowClient } from '@upstash/workflow'
import { NextRequest, NextResponse } from 'next/server'
import { getWorkflowConfig } from '@/lib/workflow-config'

interface TriggerRequest {
  route: string
  payload: unknown
}

export async function POST(request: NextRequest) {
  try {
    const { route, payload }: TriggerRequest = await request.json()

    // Get configuration based on environment mode
    const config = getWorkflowConfig()
    
    console.log(`[WORKFLOW-TRIGGER] Mode: ${config.mode.toUpperCase()}`)
    console.log(`[WORKFLOW-TRIGGER] Route: ${route}`)
    console.log(`[WORKFLOW-TRIGGER] Payload:`, payload)
    console.log(`[WORKFLOW-TRIGGER] Config:`, {
      mode: config.mode,
      qstashUrl: config.qstashUrl,
      workflowUrl: config.workflowUrl,
      hasToken: !!config.qstashToken,
      hasSigningKeys: !!config.signingKeys?.current,
    })

    // Create client with mode-specific configuration
    const client = new WorkflowClient({
      baseUrl: config.qstashUrl,
      token: config.qstashToken,
    })

    const workflowUrl = `${config.workflowUrl}/${route}`
    console.log(`[WORKFLOW-TRIGGER] Triggering workflow at: ${workflowUrl}`)

    // Prepare headers with modern object spread
    const headers = {
      'Content-Type': 'application/json',
      ...(config.mode === 'local' && { 'Local-Development': 'true' }),
    }

    const { workflowRunId } = await client.trigger({
      url: workflowUrl,
      body: payload,
      headers,
    })

    console.log(`[WORKFLOW-TRIGGER] Workflow triggered successfully: ${workflowRunId}`)

    return NextResponse.json({ 
      success: true,
      workflowRunId,
      mode: config.mode,
      message: `${config.mode === 'local' ? 'Local' : 'Cloud'} workflow triggered successfully`,
      workflowUrl,
      environment: config.mode === 'local' ? 'QStash CLI' : 'Upstash Cloud'
    })
  } catch (error) {
    console.error('[WORKFLOW-TRIGGER] Error triggering workflow:', error)
    
    return NextResponse.json({ 
      success: false,
      error: `Workflow trigger failed: ${error}`,
      message: error instanceof Error ? error.message : 'Unknown error',
      mode: process.env.WORKFLOW_MODE || 'local'
    }, { status: 500 })
  }
}