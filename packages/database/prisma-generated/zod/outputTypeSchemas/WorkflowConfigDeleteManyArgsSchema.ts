import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowConfigWhereInputSchema } from '../inputTypeSchemas/WorkflowConfigWhereInputSchema'

export const WorkflowConfigDeleteManyArgsSchema: z.ZodType<Prisma.WorkflowConfigDeleteManyArgs> = z.object({
  where: WorkflowConfigWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default WorkflowConfigDeleteManyArgsSchema;
