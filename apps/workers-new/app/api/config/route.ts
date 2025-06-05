import { NextRequest, NextResponse } from 'next/server'
import { getWorkflowConfig } from '@/lib/workflow-config'

export async function GET(_request: NextRequest) {
  try {
    const config = getWorkflowConfig()
    
    // Return safe config info (no sensitive tokens)
    return NextResponse.json({
      mode: config.mode,
      environment: config.mode === 'local' ? 'QStash CLI' : 'Upstash Cloud',
      qstashUrl: config.qstashUrl,
      workflowUrl: config.workflowUrl,
      description: config.mode === 'local' 
        ? 'Using local QStash CLI for development'
        : 'Using Upstash cloud services',
    })
  } catch (error) {
    console.error('[CONFIG] Error getting configuration:', error)
    return NextResponse.json({
      error: 'Failed to get configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}