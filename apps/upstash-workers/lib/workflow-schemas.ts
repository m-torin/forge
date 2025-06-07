import { z } from 'zod'

/**
 * Validation schemas for workflow payloads
 * Provides type safety and runtime validation
 */

// Base schema for common fields
const basePayloadSchema = z.object({
  timestamp: z
    .number()
    .optional()
    .default(() => Date.now()),
})

// Individual workflow schemas
export const workflowSchemas = {
  path: basePayloadSchema.extend({
    input: z.string().min(1, 'Input is required').max(1000, 'Input too long'),
  }),

  sleep: basePayloadSchema.extend({
    duration: z
      .number()
      .min(1, 'Duration must be at least 1 second')
      .max(60, 'Duration cannot exceed 60 seconds')
      .optional()
      .default(5),
    message: z
      .string()
      .min(1, 'Message is required')
      .max(500, 'Message too long'),
  }),

  sleepWithoutAwait: basePayloadSchema.extend({
    duration: z.number().min(1).max(60).optional().default(3),
    message: z.string().min(1).max(500),
  }),

  auth: basePayloadSchema.extend({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
  }),

  northStarSimple: basePayloadSchema.extend({
    email: z.string().email('Invalid email format'),
    amount: z
      .number()
      .min(0.01, 'Amount must be greater than 0')
      .max(10000, 'Amount too large'),
  }),

  northStar: basePayloadSchema.extend({
    email: z.string().email('Invalid email format'),
    amount: z
      .number()
      .min(0.01, 'Amount must be greater than 0')
      .max(10000, 'Amount too large'),
    date: z
      .number()
      .optional()
      .default(() => Date.now()),
  }),

  'vercel-ai-sdk': basePayloadSchema.extend({
    location: z
      .string()
      .min(1, 'Location is required')
      .max(100, 'Location too long'),
    question: z
      .string()
      .min(1, 'Question is required')
      .max(500, 'Question too long')
      .optional()
      .default('What are some good restaurants here?'),
  }),

  'serve-many': basePayloadSchema.extend({
    items: z
      .array(z.string().min(1))
      .min(1, 'At least one item is required')
      .max(10, 'Too many items'),
    parallel: z.boolean().optional().default(true),
  }),
} as const

export type WorkflowName = keyof typeof workflowSchemas

export type WorkflowPayload<T extends WorkflowName> = z.infer<
  (typeof workflowSchemas)[T]
>

/**
 * Validate a workflow payload
 */
export function validateWorkflowPayload<T extends WorkflowName>(
  workflowName: T,
  payload: unknown,
):
  | { success: true; data: WorkflowPayload<T> }
  | { success: false; error: string } {
  try {
    const schema = workflowSchemas[workflowName]
    const data = schema.parse(payload)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`,
      )
      return { success: false, error: messages.join(', ') }
    }
    return { success: false, error: 'Invalid payload format' }
  }
}

/**
 * Get example payload for a workflow
 */
export function getExamplePayload(workflowName: WorkflowName): string {
  const examples: Record<WorkflowName, object> = {
    path: { input: 'Hello World' },
    sleep: { duration: 5, message: 'Sleeping for 5 seconds' },
    sleepWithoutAwait: { duration: 3, message: 'Non-blocking sleep' },
    auth: { username: 'admin', password: 'secret' },
    northStarSimple: { email: 'user@example.com', amount: 50 },
    northStar: { email: 'user@example.com', amount: 100, date: Date.now() },
    'vercel-ai-sdk': {
      location: 'San Francisco',
      question: 'What are some good restaurants here?',
    },
    'serve-many': { items: ['task1', 'task2', 'task3'], parallel: true },
  }

  return JSON.stringify(examples[workflowName], null, 2)
}
