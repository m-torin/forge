import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowConfigCreateManyInputSchema } from '../inputTypeSchemas/WorkflowConfigCreateManyInputSchema'

export const WorkflowConfigCreateManyArgsSchema: z.ZodType<Prisma.WorkflowConfigCreateManyArgs> = z.object({
  data: z.union([ WorkflowConfigCreateManyInputSchema,WorkflowConfigCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default WorkflowConfigCreateManyArgsSchema;
