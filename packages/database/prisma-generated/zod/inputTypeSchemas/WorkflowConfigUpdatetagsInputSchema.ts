import type { Prisma } from '../../client';

import { z } from 'zod';

export const WorkflowConfigUpdatetagsInputSchema: z.ZodType<Prisma.WorkflowConfigUpdatetagsInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export default WorkflowConfigUpdatetagsInputSchema;
