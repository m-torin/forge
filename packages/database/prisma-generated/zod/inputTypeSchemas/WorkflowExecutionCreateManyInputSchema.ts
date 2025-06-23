import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowExecutionCreatetagsInputSchema } from './WorkflowExecutionCreatetagsInputSchema';

export const WorkflowExecutionCreateManyInputSchema: z.ZodType<Prisma.WorkflowExecutionCreateManyInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      workflowRunId: z.string(),
      workflowSlug: z.string(),
      userId: z.string().optional().nullable(),
      organizationId: z.string().optional().nullable(),
      status: z.string(),
      startedAt: z.coerce.date().optional(),
      completedAt: z.coerce.date().optional().nullable(),
      duration: z.number().int().optional().nullable(),
      inputPayloadHash: z.string().optional().nullable(),
      hasOutput: z.boolean().optional(),
      error: z.string().optional().nullable(),
      errorType: z.string().optional().nullable(),
      stepCount: z.number().int().optional(),
      completedSteps: z.number().int().optional(),
      retryCount: z.number().int().optional(),
      triggeredBy: z.string(),
      triggerSource: z.string().optional().nullable(),
      parentExecutionId: z.string().optional().nullable(),
      creditsUsed: z.number().int().optional(),
      apiCallCount: z.number().int().optional(),
      tags: z
        .union([z.lazy(() => WorkflowExecutionCreatetagsInputSchema), z.string().array()])
        .optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
    })
    .strict();

export default WorkflowExecutionCreateManyInputSchema;
