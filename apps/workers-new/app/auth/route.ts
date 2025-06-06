import { upstashServe as serve } from '@repo/orchestration/server'
import { updateWorkflowStatus, getExecutionIdFromContext } from '@/lib/workflow-status-updater'

export const dynamic = 'force-dynamic'

export const { POST } = serve<string>(async (context) => {
  console.log('[AUTH-WORKFLOW] Starting workflow execution...')
  console.log('[AUTH-WORKFLOW] Context:', Object.keys(context))
  
  // Get execution ID for status tracking
  const executionId = getExecutionIdFromContext(context)
  if (executionId) {
    console.log('[AUTH-WORKFLOW] Found execution ID:', executionId)
    updateWorkflowStatus(executionId, {
      stepUpdates: [{
        stepId: 'execute',
        status: 'running',
        startedAt: new Date(),
        output: 'Starting auth workflow...'
      }]
    })
  }
  
  const result1 = await context.run('step1', async () => {
    console.log('[AUTH-WORKFLOW] Executing step1')
    if (executionId) {
      updateWorkflowStatus(executionId, {
        stepUpdates: [{
          stepId: 'execute',
          status: 'running',
          output: 'Executing authentication step 1...'
        }]
      })
    }
    return 'output 1'
  })
  
  console.log('[AUTH-WORKFLOW] Step1 result:', result1)

  const result2 = await context.run('step2', async () => {
    console.log('[AUTH-WORKFLOW] Executing step2')
    if (executionId) {
      updateWorkflowStatus(executionId, {
        stepUpdates: [{
          stepId: 'execute',
          status: 'running',
          output: 'Executing authentication step 2...'
        }]
      })
    }
    return 'output 2'
  })
  
  console.log('[AUTH-WORKFLOW] Step2 result:', result2)
  console.log('[AUTH-WORKFLOW] Workflow completed successfully')
  
  if (executionId) {
    updateWorkflowStatus(executionId, {
      status: 'completed',
      completedAt: new Date(),
      stepUpdates: [{
        stepId: 'execute',
        status: 'completed',
        completedAt: new Date(),
        output: 'Auth workflow completed successfully'
      }],
      output: { success: true, result: result2 }
    })
  }
  
  return result2
})
