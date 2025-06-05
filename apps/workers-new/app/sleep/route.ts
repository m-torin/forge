import { serve } from '@upstash/workflow/nextjs'
import { getWorkflowConfig } from '@/lib/workflow-config'

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
  
  const result1 = await context.run('step1', async () => {
    const output = someWork(input)
    console.log('[SLEEP] Step 1 - input:', input, 'output:', output)
    return output
  })

  console.log('[SLEEP] Sleeping for 3 seconds...')
  await context.sleepUntil('sleep1', Date.now() / 1000 + 3)

  const result2 = await context.run('step2', async () => {
    const output = someWork(result1)
    console.log('[SLEEP] Step 2 - input:', result1, 'output:', output)
    return output
  })
  
  console.log('[SLEEP] Workflow completed successfully')
  return result2
}, serveOptions)
