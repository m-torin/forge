import { serve } from '@upstash/workflow/nextjs'

type Invoice = {
  date: number
  email: string
  amount: number
}

type Charge = {
  invoice: Invoice
  success: boolean
}

const attemptCharge = (invoice: Invoice, attemptCount: number) => {
  if (attemptCount === 3) {
    console.log(' charge success', invoice)
    return true
  }
  console.log(' charge failed', invoice, `attempt ${attemptCount}`)
  return false
}

export const { POST } = serve<Invoice>(async (context) => {
  const x = Math.random()
  const invoice = context.requestPayload

  for (let index = 0; index < 3; index++) {
    const charge = await context.run(`attemptCharge-${index + 1}`, async () => {
      const success = attemptCharge(invoice, index + 1)
      const charge: Charge = { invoice, success }
      return charge
    })

    if (charge.success) {
      console.log('success')

      const [updateDb, receipt] = await Promise.all([
        context.run('updateDb', async () => {
          console.log(x, '  update db amount', charge.invoice.amount)
          return charge.invoice.amount
        }),
        context.run('sendReceipt', async () => {
          console.log(x, '  send receipt', charge.invoice.email)
          return charge.invoice.email
        }),
      ])
      console.log('end', updateDb, receipt)
      return
    }
    await context.sleep('retrySleep', 2)
  }
  await context.run('paymentFailed', async () => {
    console.log(
      `northStarSimple failed permenantly with input ${JSON.stringify(context.requestPayload)}`,
    )
    return true
  })
})
