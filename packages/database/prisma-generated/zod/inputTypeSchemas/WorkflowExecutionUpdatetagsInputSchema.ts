import type { Prisma } from '../../client';

import { z } from 'zod';

export const WorkflowExecutionUpdatetagsInputSchema: z.ZodType<Prisma.WorkflowExecutionUpdatetagsInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export default WorkflowExecutionUpdatetagsInputSchema;
