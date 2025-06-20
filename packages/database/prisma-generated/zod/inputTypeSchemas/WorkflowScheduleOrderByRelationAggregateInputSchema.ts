import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const WorkflowScheduleOrderByRelationAggregateInputSchema: z.ZodType<Prisma.WorkflowScheduleOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default WorkflowScheduleOrderByRelationAggregateInputSchema;
