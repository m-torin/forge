import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowScheduleSelectSchema } from '../inputTypeSchemas/WorkflowScheduleSelectSchema';
import { WorkflowScheduleIncludeSchema } from '../inputTypeSchemas/WorkflowScheduleIncludeSchema';

export const WorkflowScheduleArgsSchema: z.ZodType<Prisma.WorkflowScheduleDefaultArgs> = z.object({
  select: z.lazy(() => WorkflowScheduleSelectSchema).optional(),
  include: z.lazy(() => WorkflowScheduleIncludeSchema).optional(),
}).strict();

export default WorkflowScheduleArgsSchema;
