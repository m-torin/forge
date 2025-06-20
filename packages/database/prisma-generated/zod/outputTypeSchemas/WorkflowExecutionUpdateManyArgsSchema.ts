import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowExecutionUpdateManyMutationInputSchema } from '../inputTypeSchemas/WorkflowExecutionUpdateManyMutationInputSchema'
import { WorkflowExecutionUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/WorkflowExecutionUncheckedUpdateManyInputSchema'
import { WorkflowExecutionWhereInputSchema } from '../inputTypeSchemas/WorkflowExecutionWhereInputSchema'

export const WorkflowExecutionUpdateManyArgsSchema: z.ZodType<Prisma.WorkflowExecutionUpdateManyArgs> = z.object({
  data: z.union([ WorkflowExecutionUpdateManyMutationInputSchema,WorkflowExecutionUncheckedUpdateManyInputSchema ]),
  where: WorkflowExecutionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default WorkflowExecutionUpdateManyArgsSchema;
