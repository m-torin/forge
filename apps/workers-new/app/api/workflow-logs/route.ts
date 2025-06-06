import { NextRequest, NextResponse } from 'next/server'
import { 
  createWorkflowEngine, 
  UpstashWorkflowProvider 
} from '@repo/orchestration/server'
import { getWorkflowConfig, getOrchestrationConfig } from '@/lib/workflow-config'
import { localExecutionStore } from '@/lib/local-execution-store'

interface WorkflowRun {
  workflowRunId: string
  workflowState: 'RUN_STARTED' | 'RUN_SUCCESS' | 'RUN_FAILED' | 'RUN_CANCELED'
  workflowUrl: string
  workflowRunCreatedAt: number
  workflowRunCompletedAt?: number
  steps: unknown[]
}

function mapExecutionStatusToRunState(status: string): WorkflowRun['workflowState'] {
  switch (status) {
    case 'pending':
    case 'running':
      return 'RUN_STARTED'
    case 'completed':
      return 'RUN_SUCCESS'
    case 'failed':
      return 'RUN_FAILED'
    case 'cancelled':
      return 'RUN_CANCELED'
    default:
      return 'RUN_STARTED'
  }
}

export async function GET(_request: NextRequest) {
  try {
    const config = getWorkflowConfig()
    
    console.log('[WORKFLOW-LOGS] Fetching logs with config:', {
      mode: config.mode,
      qstashUrl: config.qstashUrl,
      hasToken: !!config.qstashToken
    })

    // Create orchestration provider
    const orchestrationConfig = getOrchestrationConfig()
    const provider = new UpstashWorkflowProvider(orchestrationConfig)

    // Create workflow engine
    const engine = createWorkflowEngine({
      providers: [{
        name: 'upstash-workflow',
        type: 'upstash-workflow',
        config: orchestrationConfig
      }],
      defaultProvider: 'upstash-workflow'
    })

    await engine.initialize()

    console.log('[WORKFLOW-LOGS] Retrieved orchestration status')

    // Get execution status from orchestration engine
    const status = engine.getStatus()
    
    // Query orchestration provider for actual workflow executions
    let workflowRuns: WorkflowRun[] = []
    
    try {
      // List all workflow executions from the orchestration provider
      const executions = await provider.listWorkflowExecutions({
        limit: 100, // Get recent executions
        offset: 0
      })
      
      console.log(`[WORKFLOW-LOGS] Found ${executions.length} workflow executions`)
      
      // Transform WorkflowExecution objects to WorkflowRun format
      workflowRuns = executions.map(execution => ({
        workflowRunId: execution.id,
        workflowState: mapExecutionStatusToRunState(execution.status),
        workflowUrl: `${config.workflowUrl}/${execution.workflowId}`,
        workflowRunCreatedAt: execution.startedAt.getTime(),
        workflowRunCompletedAt: execution.completedAt?.getTime(),
        steps: execution.steps || []
      }))
    } catch (error) {
      console.log('[WORKFLOW-LOGS] No Redis configured for execution history:', error instanceof Error ? error.message : 'Unknown error')
      
      // For local development without Redis, use local execution store
      if (config.mode === 'local') {
        console.log('[WORKFLOW-LOGS] Using local execution store for workflow history')
        try {
          workflowRuns = localExecutionStore.transformToWorkflowRuns(config.workflowUrl)
          console.log(`[WORKFLOW-LOGS] Found ${workflowRuns.length} local executions`)
        } catch (localError) {
          console.log('[WORKFLOW-LOGS] Error accessing local store:', localError instanceof Error ? localError.message : 'Unknown error')
        }
      }
    }

    return NextResponse.json({
      success: true,
      runs: workflowRuns,
      totalRuns: workflowRuns.length,
      config: {
        mode: config.mode,
        environment: config.mode === 'local' ? 'QStash CLI' : 'Upstash Cloud'
      },
      orchestrationStatus: status
    })

  } catch (error) {
    console.error('[WORKFLOW-LOGS] Error fetching logs:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch workflow logs',
      message: error instanceof Error ? error.message : 'Unknown error',
      runs: [],
      totalRuns: 0
    }, { status: 500 })
  }
}