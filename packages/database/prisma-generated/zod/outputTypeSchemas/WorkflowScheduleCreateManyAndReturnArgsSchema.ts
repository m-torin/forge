import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowScheduleCreateManyInputSchema } from '../inputTypeSchemas/WorkflowScheduleCreateManyInputSchema'

export const WorkflowScheduleCreateManyAndReturnArgsSchema: z.ZodType<Prisma.WorkflowScheduleCreateManyAndReturnArgs> = z.object({
  data: z.union([ WorkflowScheduleCreateManyInputSchema,WorkflowScheduleCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default WorkflowScheduleCreateManyAndReturnArgsSchema;
