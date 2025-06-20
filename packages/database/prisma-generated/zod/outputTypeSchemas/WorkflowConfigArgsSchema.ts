import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowConfigSelectSchema } from '../inputTypeSchemas/WorkflowConfigSelectSchema';
import { WorkflowConfigIncludeSchema } from '../inputTypeSchemas/WorkflowConfigIncludeSchema';

export const WorkflowConfigArgsSchema: z.ZodType<Prisma.WorkflowConfigDefaultArgs> = z.object({
  select: z.lazy(() => WorkflowConfigSelectSchema).optional(),
  include: z.lazy(() => WorkflowConfigIncludeSchema).optional(),
}).strict();

export default WorkflowConfigArgsSchema;
