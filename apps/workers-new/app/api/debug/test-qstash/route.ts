import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@upstash/qstash'
import { getWorkflowConfig } from '@/lib/workflow-config'

export async function GET(_request: NextRequest) {
  try {
    const config = getWorkflowConfig()
    
    console.log('[DEBUG] Testing QStash connection with config:', {
      mode: config.mode,
      qstashUrl: config.qstashUrl,
      hasToken: !!config.qstashToken
    })

    const qstashClient = new Client({
      baseUrl: config.qstashUrl,
      token: config.qstashToken
    })

    // Test basic connection by fetching logs
    const _logs = await qstashClient.logs()
    
    return NextResponse.json({
      success: true,
      message: 'QStash connection test successful',
      config: {
        mode: config.mode,
        qstashUrl: config.qstashUrl,
        hasToken: !!config.qstashToken
      },
      logsCount: 0, // Simple connection test
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('[DEBUG] QStash connection test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'QStash connection test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = getWorkflowConfig()
    const body = await request.json()
    
    console.log('[DEBUG] Testing QStash publish with payload:', body)

    const qstashClient = new Client({
      baseUrl: config.qstashUrl,
      token: config.qstashToken
    })

    // Test publishing a message to our sleep endpoint with default payload
    const defaultPayload = { test: true, timestamp: Date.now() }
    const result = await qstashClient.publishJSON({
      url: `${config.workflowUrl}/sleep`,
      body: body.payload ?? defaultPayload
    })
    
    return NextResponse.json({
      success: true,
      message: 'QStash publish test successful',
      messageId: result.messageId,
      config: {
        mode: config.mode,
        publishedTo: `${config.workflowUrl}/sleep`
      },
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('[DEBUG] QStash publish test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'QStash publish test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }, { status: 500 })
  }
}