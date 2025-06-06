import { upstashServe as serve } from '@repo/orchestration/server'
import { updateWorkflowStatus, getExecutionIdFromContext } from '@/lib/workflow-status-updater'

export const dynamic = 'force-dynamic'

type Invoice = {
  date: number
  email: string
  amount: number
}

type Charge = {
  invoice: Invoice
  success: boolean
}

// Realistic payment simulation with genuine uncertainty
const attemptCharge = (invoice: Invoice, attemptNumber: number) => {
  console.log(`[SLEEP-WITHOUT-AWAIT] Attempt ${attemptNumber + 1} for invoice:`, invoice)
  
  // Realistic payment simulation - 60% success rate per attempt
  // This means some workflows will fail completely, others succeed early/late
  const success = Math.random() < 0.60
  
  if (success) {
    console.log('[SLEEP-WITHOUT-AWAIT] Charge success on attempt', attemptNumber + 1)
    return true
  }
  console.log('[SLEEP-WITHOUT-AWAIT] Charge failed on attempt', attemptNumber + 1)
  return false
}

export const { POST } = serve<Invoice>(async (context) => {
  const x = Math.random()
  const invoice = context.requestPayload
  console.log('[SLEEP-WITHOUT-AWAIT] Starting workflow for invoice:', invoice)

  // Get execution ID for status tracking
  const executionId = getExecutionIdFromContext(context)
  if (executionId) {
    console.log('[SLEEP-WITHOUT-AWAIT] Found execution ID:', executionId)
    updateWorkflowStatus(executionId, {
      stepUpdates: [{
        stepId: 'execute',
        status: 'running',
        startedAt: new Date(),
        output: 'Starting payment processing with sleep...'
      }]
    })
  }

  // Always run through all 3 attempts to show full retry flow
  let finalCharge: Charge | null = null
  
  for (let index = 0; index < 3; index++) {
    console.log(`[SLEEP-WITHOUT-AWAIT] Starting attempt ${index + 1}/3`)
    
    if (executionId) {
      updateWorkflowStatus(executionId, {
        stepUpdates: [{
          stepId: 'execute',
          status: 'running',
          output: `Attempting payment ${index + 1}/3...`
        }]
      })
    }
    
    const charge = await context.run(`attemptCharge_${index + 1}`, async () => {
      const success = attemptCharge(invoice, index)
      const charge: Charge = { invoice, success }
      return charge
    })

    if (charge.success) {
      console.log(`[SLEEP-WITHOUT-AWAIT] Payment successful on attempt ${index + 1}`)
      finalCharge = charge
      if (executionId) {
        updateWorkflowStatus(executionId, {
          stepUpdates: [{
            stepId: 'execute',
            status: 'running',
            output: `Payment succeeded on attempt ${index + 1}`
          }]
        })
      }
      break
    } else {
      console.log(`[SLEEP-WITHOUT-AWAIT] Payment failed on attempt ${index + 1}, will retry...`)
      if (executionId) {
        updateWorkflowStatus(executionId, {
          stepUpdates: [{
            stepId: 'execute',
            status: 'running',
            output: `Payment failed on attempt ${index + 1}${index < 2 ? ', retrying in 2 seconds...' : ''}`
          }]
        })
      }
      if (index < 2) { // Don't sleep after the last attempt
        await context.sleep(`retrySleep_${index + 1}`, 2)
      }
    }
  }
  
  if (finalCharge?.success) {
    console.log('[SLEEP-WITHOUT-AWAIT] Processing successful payment...')
    
    if (executionId) {
      updateWorkflowStatus(executionId, {
        stepUpdates: [{
          stepId: 'execute',
          status: 'running',
          output: 'Processing payment with parallel tasks and 5-second sleep...'
        }]
      })
    }

    const [updateDb, receipt, wait] = await Promise.all([
      context.run('updateDb', async () => {
        console.log(`[SLEEP-WITHOUT-AWAIT] Updating DB with amount:`, finalCharge!.invoice.amount)
        return 5
      }),
      context.run('sendReceipt', async () => {
        console.log(`[SLEEP-WITHOUT-AWAIT] Sending receipt to:`, finalCharge!.invoice.email)
        return 10
      }),
      context.sleep('finalSleep', 5),
    ])
    
    console.log('[SLEEP-WITHOUT-AWAIT] Workflow completed successfully:', { updateDb, receipt, wait })
    
    if (executionId) {
      updateWorkflowStatus(executionId, {
        status: 'completed',
        completedAt: new Date(),
        stepUpdates: [{
          stepId: 'execute',
          status: 'completed',
          completedAt: new Date(),
          output: 'Payment processed with parallel execution and sleep completed'
        }],
        output: { success: true, updateDb, receipt, waitTime: wait }
      })
    }
    
    return { success: true, updateDb, receipt, waitTime: wait }
  }
  
  // If we get here, all payment attempts failed
  await context.run('paymentFailed', async () => {
    console.log(
      `[SLEEP-WITHOUT-AWAIT] Payment failed permanently with input: ${JSON.stringify(context.requestPayload)}`,
    )
    return true
  })
  
  if (executionId) {
    updateWorkflowStatus(executionId, {
      status: 'failed',
      completedAt: new Date(),
      stepUpdates: [{
        stepId: 'execute',
        status: 'failed',
        completedAt: new Date(),
        error: 'Payment failed after 3 attempts'
      }],
      error: 'Payment failed after 3 attempts'
    })
  }
  
  return { success: false, message: 'Payment failed after 3 attempts' }
})
