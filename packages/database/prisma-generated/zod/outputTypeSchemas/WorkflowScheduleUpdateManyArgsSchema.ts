import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowScheduleUpdateManyMutationInputSchema } from '../inputTypeSchemas/WorkflowScheduleUpdateManyMutationInputSchema';
import { WorkflowScheduleUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/WorkflowScheduleUncheckedUpdateManyInputSchema';
import { WorkflowScheduleWhereInputSchema } from '../inputTypeSchemas/WorkflowScheduleWhereInputSchema';

export const WorkflowScheduleUpdateManyArgsSchema: z.ZodType<Prisma.WorkflowScheduleUpdateManyArgs> =
  z
    .object({
      data: z.union([
        WorkflowScheduleUpdateManyMutationInputSchema,
        WorkflowScheduleUncheckedUpdateManyInputSchema,
      ]),
      where: WorkflowScheduleWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default WorkflowScheduleUpdateManyArgsSchema;
