import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const WorkflowScheduleSumOrderByAggregateInputSchema: z.ZodType<Prisma.WorkflowScheduleSumOrderByAggregateInput> =
  z
    .object({
      totalRuns: z.lazy(() => SortOrderSchema).optional(),
      successfulRuns: z.lazy(() => SortOrderSchema).optional(),
      failedRuns: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default WorkflowScheduleSumOrderByAggregateInputSchema;
