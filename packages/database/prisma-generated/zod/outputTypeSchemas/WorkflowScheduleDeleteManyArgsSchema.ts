import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowScheduleWhereInputSchema } from '../inputTypeSchemas/WorkflowScheduleWhereInputSchema'

export const WorkflowScheduleDeleteManyArgsSchema: z.ZodType<Prisma.WorkflowScheduleDeleteManyArgs> = z.object({
  where: WorkflowScheduleWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default WorkflowScheduleDeleteManyArgsSchema;
