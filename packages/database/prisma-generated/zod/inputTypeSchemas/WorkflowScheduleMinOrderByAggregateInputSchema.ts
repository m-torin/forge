import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const WorkflowScheduleMinOrderByAggregateInputSchema: z.ZodType<Prisma.WorkflowScheduleMinOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      configId: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      description: z.lazy(() => SortOrderSchema).optional(),
      cronExpression: z.lazy(() => SortOrderSchema).optional(),
      timezone: z.lazy(() => SortOrderSchema).optional(),
      isActive: z.lazy(() => SortOrderSchema).optional(),
      nextRunAt: z.lazy(() => SortOrderSchema).optional(),
      lastRunAt: z.lazy(() => SortOrderSchema).optional(),
      lastRunStatus: z.lazy(() => SortOrderSchema).optional(),
      totalRuns: z.lazy(() => SortOrderSchema).optional(),
      successfulRuns: z.lazy(() => SortOrderSchema).optional(),
      failedRuns: z.lazy(() => SortOrderSchema).optional(),
      validFrom: z.lazy(() => SortOrderSchema).optional(),
      validUntil: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      createdBy: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default WorkflowScheduleMinOrderByAggregateInputSchema;
