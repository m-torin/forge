import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowScheduleWhereInputSchema } from './WorkflowScheduleWhereInputSchema';

export const WorkflowScheduleListRelationFilterSchema: z.ZodType<Prisma.WorkflowScheduleListRelationFilter> = z.object({
  every: z.lazy(() => WorkflowScheduleWhereInputSchema).optional(),
  some: z.lazy(() => WorkflowScheduleWhereInputSchema).optional(),
  none: z.lazy(() => WorkflowScheduleWhereInputSchema).optional()
}).strict();

export default WorkflowScheduleListRelationFilterSchema;
