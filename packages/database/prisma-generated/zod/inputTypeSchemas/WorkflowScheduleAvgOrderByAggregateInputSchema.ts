import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const WorkflowScheduleAvgOrderByAggregateInputSchema: z.ZodType<Prisma.WorkflowScheduleAvgOrderByAggregateInput> =
  z
    .object({
      totalRuns: z.lazy(() => SortOrderSchema).optional(),
      successfulRuns: z.lazy(() => SortOrderSchema).optional(),
      failedRuns: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default WorkflowScheduleAvgOrderByAggregateInputSchema;
