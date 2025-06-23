import { z } from 'zod';

/////////////////////////////////////////
// WORKFLOW EXECUTION SCHEMA
/////////////////////////////////////////

export const WorkflowExecutionSchema = z.object({
  id: z.string().cuid(),
  workflowRunId: z.string(),
  workflowSlug: z.string(),
  userId: z.string().nullable(),
  organizationId: z.string().nullable(),
  status: z.string(),
  startedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable(),
  duration: z.number().int().nullable(),
  inputPayloadHash: z.string().nullable(),
  hasOutput: z.boolean(),
  error: z.string().nullable(),
  errorType: z.string().nullable(),
  stepCount: z.number().int(),
  completedSteps: z.number().int(),
  retryCount: z.number().int(),
  triggeredBy: z.string(),
  triggerSource: z.string().nullable(),
  parentExecutionId: z.string().nullable(),
  creditsUsed: z.number().int(),
  apiCallCount: z.number().int(),
  tags: z.string().array(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type WorkflowExecution = z.infer<typeof WorkflowExecutionSchema>;

export default WorkflowExecutionSchema;
