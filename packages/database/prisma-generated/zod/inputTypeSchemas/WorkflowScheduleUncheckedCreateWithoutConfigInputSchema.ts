import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const WorkflowScheduleUncheckedCreateWithoutConfigInputSchema: z.ZodType<Prisma.WorkflowScheduleUncheckedCreateWithoutConfigInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      name: z.string(),
      description: z.string().optional().nullable(),
      cronExpression: z.string(),
      timezone: z.string().optional(),
      isActive: z.boolean().optional(),
      payload: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
      nextRunAt: z.coerce.date().optional().nullable(),
      lastRunAt: z.coerce.date().optional().nullable(),
      lastRunStatus: z.string().optional().nullable(),
      totalRuns: z.number().int().optional(),
      successfulRuns: z.number().int().optional(),
      failedRuns: z.number().int().optional(),
      validFrom: z.coerce.date().optional(),
      validUntil: z.coerce.date().optional().nullable(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      createdBy: z.string().optional().nullable(),
    })
    .strict();

export default WorkflowScheduleUncheckedCreateWithoutConfigInputSchema;
