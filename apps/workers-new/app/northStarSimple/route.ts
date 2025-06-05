import { serve } from '@upstash/workflow/nextjs'
import { getWorkflowConfig } from '@/lib/workflow-config'

type Invoice = {
  date: number
  email: string
  amount: number
}

type Charge = {
  invoice: Invoice
  success: boolean
}

let counter = 0
const attemptCharge = (invoice: Invoice) => {
  counter += 1
  if (counter === 3) {
    console.log('[NORTH-STAR-SIMPLE] Charge success:', invoice)
    counter = 0
    return true
  }
  console.log('[NORTH-STAR-SIMPLE] Charge failed:', invoice)
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

  for (let index = 0; index < 3; index++) {
    const charge = await context.run('attemptCharge', async () => {
      const success = attemptCharge(invoice)
      const charge: Charge = { invoice, success }
      return charge
    })

    if (charge.success) {
      const updateDb = await context.run('updateDb', async () => {
        console.log('  update db amount', charge.invoice.amount)
        return 5
      })

      await context.run('sendReceipt', async () => {
        console.log('[NORTH-STAR-SIMPLE] Send receipt to:', charge.invoice.email, 'db result:', updateDb)
        return 10
      })

      console.log('[NORTH-STAR-SIMPLE] Payment successful, workflow completed')
      return
    }
    await context.sleep('retrySleep', 2)
  }
  await context.run('paymentFailed', async () => {
    console.log(
      `[NORTH-STAR-SIMPLE] Payment failed permanently with input: ${JSON.stringify(context.requestPayload)}`,
    )
    return true
  })
}, serveOptions)
