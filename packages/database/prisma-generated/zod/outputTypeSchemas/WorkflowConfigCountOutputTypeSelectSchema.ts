import { z } from 'zod';
import type { Prisma } from '../../client';

export const WorkflowConfigCountOutputTypeSelectSchema: z.ZodType<Prisma.WorkflowConfigCountOutputTypeSelect> = z.object({
  schedules: z.boolean().optional(),
}).strict();

export default WorkflowConfigCountOutputTypeSelectSchema;
