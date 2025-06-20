import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowExecutionWhereInputSchema } from '../inputTypeSchemas/WorkflowExecutionWhereInputSchema'

export const WorkflowExecutionDeleteManyArgsSchema: z.ZodType<Prisma.WorkflowExecutionDeleteManyArgs> = z.object({
  where: WorkflowExecutionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default WorkflowExecutionDeleteManyArgsSchema;
