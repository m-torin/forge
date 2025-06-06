import { NextRequest, NextResponse } from 'next/server'
import { 
  createWorkflowEngine, 
  UpstashWorkflowProvider,
  type WorkflowDefinition 
} from '@repo/orchestration/server'
import { getWorkflowConfig, getOrchestrationConfig } from '@/lib/workflow-config'
import { localExecutionStore } from '@/lib/local-execution-store'

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

    // Generate execution ID upfront
    const executionId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create a simple workflow definition for the route with execution ID
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
            url: `${config.workflowUrl}/${route}?executionId=${executionId}`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Workflow-Execution-Id': executionId,
              ...(config.mode === 'local' && { 'Local-Development': 'true' }),
            },
            body: payload
          }
        }
      ]
    }

    console.log(`[WORKFLOW-TRIGGER] Triggering workflow: ${route} with execution ID: ${executionId}`)

    const execution = await engine.executeWorkflow(workflowDefinition, payload as Record<string, any>)

    console.log(`[WORKFLOW-TRIGGER] Workflow triggered successfully: ${execution.id}`)

    // Store execution in local store for development (when Redis is not available)
    if (config.mode === 'local') {
      localExecutionStore.addExecution({
        id: executionId, // Use our custom execution ID
        workflowId: route,
        status: 'running', // Real workflow is now running via QStash
        startedAt: new Date(),
        input: payload as Record<string, any>,
        steps: workflowDefinition.steps.map(step => ({
          stepId: step.id,
          status: 'pending' as const,
          attempts: 0,
          startedAt: undefined,
          output: undefined,
          error: undefined
        })),
        metadata: {
          trigger: {
            type: 'manual',
            payload: payload,
            timestamp: new Date()
          }
        }
      })
      
      console.log(`[WORKFLOW-TRIGGER] Real workflow ${executionId} triggered via QStash - will be updated by actual execution`)
    }

    return NextResponse.json({ 
      success: true,
      workflowRunId: executionId,
      executionId: executionId,
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