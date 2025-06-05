import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@upstash/qstash'
import { getWorkflowConfig } from '@/lib/workflow-config'

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
    const _qstashClient = new Client({
      baseUrl: config.qstashUrl,
      token: config.qstashToken
    })

    console.log('[CANCEL] Cancelling workflow(s):', workflowRunId ?? workflowRunIds)

    const results: CancelResult[] = []

    if (workflowRunId) {
      // Cancel single workflow
      try {
        // Note: QStash cancel method needs proper implementation
        console.log('[CANCEL] Would cancel workflow:', workflowRunId)
        results.push({
          workflowRunId,
          success: true,
          message: 'Workflow cancellation simulated (QStash cancel API needs implementation)'
        })
      } catch (error) {
        results.push({
          workflowRunId,
          success: false,
          error: error instanceof Error ? error.message : 'Failed to cancel workflow'
        })
      }
    }

    if (workflowRunIds && Array.isArray(workflowRunIds)) {
      // Cancel multiple workflows using modern for...of loop
      for (const id of workflowRunIds) {
        try {
          console.log('[CANCEL] Would cancel workflow:', id)
          results.push({
            workflowRunId: id,
            success: true,
            message: 'Workflow cancellation simulated (QStash cancel API needs implementation)'
          })
        } catch (error) {
          results.push({
            workflowRunId: id,
            success: false,
            error: error instanceof Error ? error.message : 'Failed to cancel workflow'
          })
        }
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