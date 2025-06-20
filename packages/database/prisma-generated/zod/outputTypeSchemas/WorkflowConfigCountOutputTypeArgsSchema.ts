import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowConfigCountOutputTypeSelectSchema } from './WorkflowConfigCountOutputTypeSelectSchema';

export const WorkflowConfigCountOutputTypeArgsSchema: z.ZodType<Prisma.WorkflowConfigCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => WorkflowConfigCountOutputTypeSelectSchema).nullish(),
}).strict();

export default WorkflowConfigCountOutputTypeSelectSchema;
