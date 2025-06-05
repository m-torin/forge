import { NextRequest, NextResponse } from 'next/server'
import { 
  createWorkflowEngine, 
  UpstashWorkflowProvider 
} from '@repo/orchestration-new'
import { getWorkflowConfig, getOrchestrationConfig } from '@/lib/workflow-config'

interface CancelRequest {
  workflowRunId?: string
  workflowRunIds?: string[]
}

interface CancelResult {
  workflowRunId: string
  success: boolean
  message?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const { workflowRunId, workflowRunIds }: CancelRequest = await request.json()
    
    if (!workflowRunId && !workflowRunIds) {
      return NextResponse.json({
        success: false,
        error: 'Missing workflowRunId or workflowRunIds'
      }, { status: 400 })
    }

    const config = getWorkflowConfig()
    
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

    console.log('[CANCEL] Cancelling workflow(s):', workflowRunId ?? workflowRunIds)

    const results: CancelResult[] = []
    const executionIds = workflowRunId ? [workflowRunId] : (workflowRunIds || [])

    // Cancel workflows using orchestration engine
    for (const executionId of executionIds) {
      try {
        // Get execution to check if it exists
        const execution = await engine.getExecution(executionId)
        if (!execution) {
          results.push({
            workflowRunId: executionId,
            success: false,
            error: 'Execution not found'
          })
          continue
        }

        // Use provider's cancelExecution method if available
        if (provider.cancelExecution) {
          await provider.cancelExecution(executionId)
          results.push({
            workflowRunId: executionId,
            success: true,
            message: 'Workflow cancelled successfully'
          })
        } else {
          results.push({
            workflowRunId: executionId,
            success: false,
            error: 'Cancel operation not supported by provider'
          })
        }
      } catch (error) {
        results.push({
          workflowRunId: executionId,
          success: false,
          error: error instanceof Error ? error.message : 'Failed to cancel workflow'
        })
      }
    }

    const allSuccessful = results.every(r => r.success)
    const successCount = results.filter(r => r.success).length

    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful 
        ? `Successfully cancelled ${successCount} workflow(s)`
        : `Cancelled ${successCount}/${results.length} workflow(s)`,
      results,
      timestamp: Date.now()
    }, { 
      status: allSuccessful ? 200 : 207 // 207 = Multi-Status
    })
  } catch (error) {
    console.error('[CANCEL] Workflow cancellation failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Workflow cancellation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}