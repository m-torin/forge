import { upstashServe as serve } from '@repo/orchestration/server'
import { getWorkflowConfig } from '@/lib/workflow-config'
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
  console.log(`[NORTH-STAR-SIMPLE] Attempt ${attemptNumber + 1} for invoice:`, invoice)
  
  // Realistic payment simulation - 60% success rate per attempt
  // This means some workflows will fail completely, others succeed early/late
  const success = Math.random() < 0.60
  
  if (success) {
    console.log('[NORTH-STAR-SIMPLE] Charge success on attempt', attemptNumber + 1)
    return true
  }
  console.log('[NORTH-STAR-SIMPLE] Charge failed on attempt', attemptNumber + 1)
  return false
}

// Get configuration for local or cloud mode
const config = getWorkflowConfig()

console.log('[NORTH-STAR-SIMPLE] Workflow config:', {
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

export const { POST } = serve<Invoice>(async (context) => {
  const invoice = context.requestPayload
  console.log('[NORTH-STAR-SIMPLE] Starting workflow for invoice:', invoice)

  // Get execution ID for status tracking
  const executionId = getExecutionIdFromContext(context)
  if (executionId) {
    console.log('[NORTH-STAR-SIMPLE] Found execution ID:', executionId)
    updateWorkflowStatus(executionId, {
      stepUpdates: [{
        stepId: 'execute',
        status: 'running',
        startedAt: new Date(),
        output: 'Starting payment processing...'
      }]
    })
  }

  // Always run through all 3 attempts to show full retry flow
  let finalCharge: Charge | null = null
  
  for (let index = 0; index < 3; index++) {
    console.log(`[NORTH-STAR-SIMPLE] Starting attempt ${index + 1}/3`)
    
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
      console.log(`[NORTH-STAR-SIMPLE] Payment successful on attempt ${index + 1}`)
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
      console.log(`[NORTH-STAR-SIMPLE] Payment failed on attempt ${index + 1}, will retry...`)
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
    console.log('[NORTH-STAR-SIMPLE] Processing successful payment...')
    
    if (executionId) {
      updateWorkflowStatus(executionId, {
        stepUpdates: [{
          stepId: 'execute',
          status: 'running',
          output: 'Processing successful payment...'
        }]
      })
    }
    
    const updateDb = await context.run('updateDb', async () => {
      console.log('[NORTH-STAR-SIMPLE] Updating DB with amount:', finalCharge!.invoice.amount)
      return 5
    })

    await context.run('sendReceipt', async () => {
      console.log('[NORTH-STAR-SIMPLE] Sending receipt to:', finalCharge!.invoice.email, 'DB result:', updateDb)
      return 10
    })

    console.log('[NORTH-STAR-SIMPLE] Workflow completed successfully')
    
    if (executionId) {
      updateWorkflowStatus(executionId, {
        status: 'completed',
        completedAt: new Date(),
        stepUpdates: [{
          stepId: 'execute',
          status: 'completed',
          completedAt: new Date(),
          output: 'Payment processed successfully'
        }],
        output: { success: true, dbResult: updateDb, invoice: finalCharge.invoice }
      })
    }
    
    return { success: true, dbResult: updateDb, invoice: finalCharge.invoice }
  }
  
  // If we get here, all payment attempts failed
  await context.run('paymentFailed', async () => {
    console.log(
      `[NORTH-STAR-SIMPLE] Payment failed permanently with input: ${JSON.stringify(context.requestPayload)}`,
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
}, serveOptions)
