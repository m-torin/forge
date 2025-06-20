import type { Prisma } from '../../client';

import { z } from 'zod';

export const WorkflowExecutionCreatetagsInputSchema: z.ZodType<Prisma.WorkflowExecutionCreatetagsInput> = z.object({
  set: z.string().array()
}).strict();

export default WorkflowExecutionCreatetagsInputSchema;
