import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@upstash/qstash'
import { getWorkflowConfig } from '@/lib/workflow-config'

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
    
    // Create QStash client for querying logs
    const qstashClient = new Client({
      baseUrl: config.qstashUrl,
      token: config.qstashToken
    })

    console.log('[WORKFLOW-LOGS] Fetching logs with config:', {
      mode: config.mode,
      qstashUrl: config.qstashUrl,
      hasToken: !!config.qstashToken
    })

    // Fetch recent workflow runs
    const _logs = await qstashClient.logs()

    console.log('[WORKFLOW-LOGS] Retrieved logs response')

    // For now, return empty workflow runs - this API needs proper implementation
    const workflowRuns: WorkflowRun[] = []

    return NextResponse.json({
      success: true,
      runs: workflowRuns,
      totalRuns: workflowRuns.length,
      config: {
        mode: config.mode,
        environment: config.mode === 'local' ? 'QStash CLI' : 'Upstash Cloud'
      }
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