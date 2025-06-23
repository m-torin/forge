import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { WorkflowScheduleCountOrderByAggregateInputSchema } from './WorkflowScheduleCountOrderByAggregateInputSchema';
import { WorkflowScheduleAvgOrderByAggregateInputSchema } from './WorkflowScheduleAvgOrderByAggregateInputSchema';
import { WorkflowScheduleMaxOrderByAggregateInputSchema } from './WorkflowScheduleMaxOrderByAggregateInputSchema';
import { WorkflowScheduleMinOrderByAggregateInputSchema } from './WorkflowScheduleMinOrderByAggregateInputSchema';
import { WorkflowScheduleSumOrderByAggregateInputSchema } from './WorkflowScheduleSumOrderByAggregateInputSchema';

export const WorkflowScheduleOrderByWithAggregationInputSchema: z.ZodType<Prisma.WorkflowScheduleOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      configId: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      description: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      cronExpression: z.lazy(() => SortOrderSchema).optional(),
      timezone: z.lazy(() => SortOrderSchema).optional(),
      isActive: z.lazy(() => SortOrderSchema).optional(),
      payload: z.lazy(() => SortOrderSchema).optional(),
      nextRunAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      lastRunAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      lastRunStatus: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      totalRuns: z.lazy(() => SortOrderSchema).optional(),
      successfulRuns: z.lazy(() => SortOrderSchema).optional(),
      failedRuns: z.lazy(() => SortOrderSchema).optional(),
      validFrom: z.lazy(() => SortOrderSchema).optional(),
      validUntil: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      createdBy: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      _count: z.lazy(() => WorkflowScheduleCountOrderByAggregateInputSchema).optional(),
      _avg: z.lazy(() => WorkflowScheduleAvgOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => WorkflowScheduleMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => WorkflowScheduleMinOrderByAggregateInputSchema).optional(),
      _sum: z.lazy(() => WorkflowScheduleSumOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default WorkflowScheduleOrderByWithAggregationInputSchema;
