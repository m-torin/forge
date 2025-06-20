import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowConfigUpdateManyMutationInputSchema } from '../inputTypeSchemas/WorkflowConfigUpdateManyMutationInputSchema'
import { WorkflowConfigUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/WorkflowConfigUncheckedUpdateManyInputSchema'
import { WorkflowConfigWhereInputSchema } from '../inputTypeSchemas/WorkflowConfigWhereInputSchema'

export const WorkflowConfigUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.WorkflowConfigUpdateManyAndReturnArgs> = z.object({
  data: z.union([ WorkflowConfigUpdateManyMutationInputSchema,WorkflowConfigUncheckedUpdateManyInputSchema ]),
  where: WorkflowConfigWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default WorkflowConfigUpdateManyAndReturnArgsSchema;
