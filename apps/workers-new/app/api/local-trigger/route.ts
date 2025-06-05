import { NextRequest, NextResponse } from 'next/server'
import { 
  createWorkflowEngine, 
  UpstashWorkflowProvider,
  type WorkflowDefinition 
} from '@repo/orchestration-new'
import { getWorkflowConfig, getOrchestrationConfig } from '@/lib/workflow-config'

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

    // Create orchestration provider
    const orchestrationConfig = getOrchestrationConfig()
    const provider = new UpstashWorkflowProvider(orchestrationConfig)

    // Create workflow engine with the provider
    const engine = createWorkflowEngine({
      providers: [{
        name: 'upstash-workflow',
        type: 'upstash-workflow',
        config: orchestrationConfig
      }],
      defaultProvider: 'upstash-workflow'
    })

    await engine.initialize()

    // Create a simple workflow definition for the route
    const workflowDefinition: WorkflowDefinition = {
      id: route,
      name: route,
      description: `Workflow for ${route}`,
      version: '1.0.0',
      steps: [
        {
          id: 'execute',
          name: 'Execute Workflow',
          action: 'http',
          input: {
            url: `${config.workflowUrl}/${route}`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(config.mode === 'local' && { 'Local-Development': 'true' }),
            },
            body: payload
          }
        }
      ]
    }

    console.log(`[WORKFLOW-TRIGGER] Triggering workflow: ${route}`)

    const executionId = await engine.executeWorkflow(workflowDefinition, payload as Record<string, any>)

    console.log(`[WORKFLOW-TRIGGER] Workflow triggered successfully: ${executionId}`)

    return NextResponse.json({ 
      success: true,
      workflowRunId: executionId,
      executionId,
      mode: config.mode,
      message: `${config.mode === 'local' ? 'Local' : 'Cloud'} workflow triggered successfully`,
      workflowUrl: `${config.workflowUrl}/${route}`,
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