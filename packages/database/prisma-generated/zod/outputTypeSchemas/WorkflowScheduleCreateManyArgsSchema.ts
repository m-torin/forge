import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowScheduleCreateManyInputSchema } from '../inputTypeSchemas/WorkflowScheduleCreateManyInputSchema';

export const WorkflowScheduleCreateManyArgsSchema: z.ZodType<Prisma.WorkflowScheduleCreateManyArgs> =
  z
    .object({
      data: z.union([
        WorkflowScheduleCreateManyInputSchema,
        WorkflowScheduleCreateManyInputSchema.array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default WorkflowScheduleCreateManyArgsSchema;
