import { NextRequest, NextResponse } from 'next/server'
import { UpstashWorkflowProvider } from '@repo/orchestration/server'
import { getOrchestrationConfig } from '@/lib/workflow-config'

export async function GET(_request: NextRequest) {
  try {
    const config = getOrchestrationConfig()
    
    console.log('[DEBUG] Testing orchestration provider with config:', {
      env: config.env,
      baseUrl: config.baseUrl,
      hasQstashToken: !!config.qstash.token
    })

    const provider = new UpstashWorkflowProvider(config)

    // Test basic connection by checking provider properties
    const providerInfo = {
      name: provider.name,
      version: provider.version
    }
    
    return NextResponse.json({
      success: true,
      message: 'Orchestration provider connection test successful',
      config: {
        env: config.env,
        baseUrl: config.baseUrl,
        hasQstashToken: !!config.qstash.token
      },
      provider: providerInfo,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('[DEBUG] Orchestration provider connection test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Orchestration provider connection test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = getOrchestrationConfig()
    const body = await request.json()
    
    console.log('[DEBUG] Testing workflow execution with payload:', body)

    const provider = new UpstashWorkflowProvider(config)

    // Create a simple test workflow definition
    const testWorkflow = {
      id: 'test-workflow',
      name: 'Test Workflow',
      description: 'Simple test workflow for debugging',
      version: '1.0.0',
      steps: [
        {
          id: 'test-step',
          name: 'Test Step',
          action: 'test',
          config: {}
        }
      ]
    }

    // Test workflow execution with default payload
    const defaultPayload = { test: true, timestamp: Date.now() }
    const execution = await provider.execute(testWorkflow, body.payload ?? defaultPayload)
    
    return NextResponse.json({
      success: true,
      message: 'Workflow execution test successful',
      executionId: execution.id,
      execution: {
        id: execution.id,
        status: execution.status,
        workflowId: execution.workflowId,
        startedAt: execution.startedAt
      },
      config: {
        env: config.env,
        baseUrl: config.baseUrl
      },
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('[DEBUG] Workflow execution test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Workflow execution test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }, { status: 500 })
  }
}