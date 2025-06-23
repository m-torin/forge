import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowExecutionWhereUniqueInputSchema } from '../inputTypeSchemas/WorkflowExecutionWhereUniqueInputSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const WorkflowExecutionSelectSchema: z.ZodType<Prisma.WorkflowExecutionSelect> = z
  .object({
    id: z.boolean().optional(),
    workflowRunId: z.boolean().optional(),
    workflowSlug: z.boolean().optional(),
    userId: z.boolean().optional(),
    organizationId: z.boolean().optional(),
    status: z.boolean().optional(),
    startedAt: z.boolean().optional(),
    completedAt: z.boolean().optional(),
    duration: z.boolean().optional(),
    inputPayloadHash: z.boolean().optional(),
    hasOutput: z.boolean().optional(),
    error: z.boolean().optional(),
    errorType: z.boolean().optional(),
    stepCount: z.boolean().optional(),
    completedSteps: z.boolean().optional(),
    retryCount: z.boolean().optional(),
    triggeredBy: z.boolean().optional(),
    triggerSource: z.boolean().optional(),
    parentExecutionId: z.boolean().optional(),
    creditsUsed: z.boolean().optional(),
    apiCallCount: z.boolean().optional(),
    tags: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
  })
  .strict();

export const WorkflowExecutionFindUniqueArgsSchema: z.ZodType<Prisma.WorkflowExecutionFindUniqueArgs> =
  z
    .object({
      select: WorkflowExecutionSelectSchema.optional(),
      where: WorkflowExecutionWhereUniqueInputSchema,
    })
    .strict();

export default WorkflowExecutionFindUniqueArgsSchema;
