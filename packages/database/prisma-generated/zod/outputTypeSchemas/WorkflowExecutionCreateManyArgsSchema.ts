import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowExecutionCreateManyInputSchema } from '../inputTypeSchemas/WorkflowExecutionCreateManyInputSchema'

export const WorkflowExecutionCreateManyArgsSchema: z.ZodType<Prisma.WorkflowExecutionCreateManyArgs> = z.object({
  data: z.union([ WorkflowExecutionCreateManyInputSchema,WorkflowExecutionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default WorkflowExecutionCreateManyArgsSchema;
