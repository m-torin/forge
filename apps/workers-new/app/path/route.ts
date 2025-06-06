import { upstashServe as serve } from '@repo/orchestration/server'
import { updateWorkflowStatus, getExecutionIdFromContext } from '@/lib/workflow-status-updater'

export const dynamic = 'force-dynamic'

const someWork = (input: string) => {
  return `processed '${JSON.stringify(input)}'`
}

export const { POST } = serve<string>(async (context) => {
  const input = context.requestPayload
  console.log('[PATH] Starting workflow with input:', input)

  // Get execution ID for status tracking
  const executionId = getExecutionIdFromContext(context)
  if (executionId) {
    console.log('[PATH] Found execution ID:', executionId)
    updateWorkflowStatus(executionId, {
      stepUpdates: [{
        stepId: 'execute',
        status: 'running',
        startedAt: new Date(),
        output: 'Starting path workflow...'
      }]
    })
  }

  const result1 = await context.run('step1', async () => {
    if (executionId) {
      updateWorkflowStatus(executionId, {
        stepUpdates: [{
          stepId: 'execute',
          status: 'running',
          output: 'Executing step 1...'
        }]
      })
    }
    
    const output = someWork(input)
    console.log('[PATH] Step 1 - input:', input, 'output:', output)
    
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

  const result2 = await context.run('step2', async () => {
    if (executionId) {
      updateWorkflowStatus(executionId, {
        stepUpdates: [{
          stepId: 'execute',
          status: 'running',
          output: 'Executing step 2...'
        }]
      })
    }
    
    const output = someWork(result1)
    console.log('[PATH] Step 2 - input:', result1, 'output:', output)
    
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

  console.log('[PATH] Workflow completed successfully with result:', result2)
  
  if (executionId) {
    updateWorkflowStatus(executionId, {
      status: 'completed',
      completedAt: new Date(),
      output: { success: true, result: result2 }
    })
  }
  
  return { success: true, result: result2 }
})
