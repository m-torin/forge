import { upstashServe as serve } from '@repo/orchestration/server'
import { getWorkflowConfig } from '@/lib/workflow-config'
import { updateWorkflowStatus, getExecutionIdFromContext } from '@/lib/workflow-status-updater'

export const dynamic = 'force-dynamic'

const someWork = (input: string) => {
  return `processed '${JSON.stringify(input)}'`
}

// Get configuration for local or cloud mode
const config = getWorkflowConfig()

console.log('[SLEEP] Workflow config:', {
  mode: config.mode,
  qstashUrl: config.qstashUrl,
  hasSigningKeys: !!config.signingKeys?.current
})

// Configure serve function based on environment
const serveOptions = config.mode === 'local' 
  ? {
      // Local development - disable signature verification
      receiver: undefined,
      verbose: true as const
    }
  : undefined // Use default receiver for cloud mode

export const { POST } = serve<string>(async (context) => {
  const input = context.requestPayload
  console.log('[SLEEP] Starting workflow with input:', input)
  
  // Get execution ID from the context
  const executionId = getExecutionIdFromContext(context)
  if (executionId) {
    console.log('[SLEEP] Found execution ID:', executionId)
  }
  
  const result1 = await context.run('step1', async () => {
    if (executionId) {
      updateWorkflowStatus(executionId, {
        stepUpdates: [{
          stepId: 'execute',
          status: 'running',
          startedAt: new Date(),
          output: 'Starting step 1...'
        }]
      })
    }
    
    const output = someWork(input)
    console.log('[SLEEP] Step 1 - input:', input, 'output:', output)
    
    if (executionId) {
      updateWorkflowStatus(executionId, {
        stepUpdates: [{
          stepId: 'execute',
          status: 'running',
          output: `Step 1 completed: ${output}`
        }]
      })
    }
    
    return output
  })

  console.log('[SLEEP] Sleeping for 15 seconds...')
  if (executionId) {
    updateWorkflowStatus(executionId, {
      stepUpdates: [{
        stepId: 'execute',
        status: 'running',
        output: 'Sleeping for 15 seconds...'
      }]
    })
  }
  
  await context.sleepUntil('sleep1', Date.now() / 1000 + 15)

  const result2 = await context.run('step2', async () => {
    if (executionId) {
      updateWorkflowStatus(executionId, {
        stepUpdates: [{
          stepId: 'execute',
          status: 'running',
          output: 'Starting step 2...'
        }]
      })
    }
    
    const output = someWork(result1)
    console.log('[SLEEP] Step 2 - input:', result1, 'output:', output)
    
    if (executionId) {
      updateWorkflowStatus(executionId, {
        stepUpdates: [{
          stepId: 'execute',
          status: 'completed',
          completedAt: new Date(),
          output: `Step 2 completed: ${output}`
        }]
      })
    }
    
    return output
  })
  
  console.log('[SLEEP] Workflow completed successfully')
  
  // Mark the entire workflow as completed
  if (executionId) {
    updateWorkflowStatus(executionId, {
      status: 'completed',
      completedAt: new Date(),
      output: { success: true, result: result2 }
    })
  }
  
  return result2
}, serveOptions)
