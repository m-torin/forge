import { NextRequest, NextResponse } from 'next/server'
import { 
  createWorkflowEngine, 
  UpstashWorkflowProvider 
} from '@repo/orchestration-new'
import { getWorkflowConfig, getOrchestrationConfig } from '@/lib/workflow-config'

interface WorkflowRun {
  workflowRunId: string
  workflowState: 'RUN_STARTED' | 'RUN_SUCCESS' | 'RUN_FAILED' | 'RUN_CANCELED'
  workflowUrl: string
  workflowRunCreatedAt: number
  workflowRunCompletedAt?: number
  steps: unknown[]
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
    
    // For now, transform orchestration status to legacy format
    // In a real implementation, we'd query the orchestration provider for executions
    const workflowRuns: WorkflowRun[] = []

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