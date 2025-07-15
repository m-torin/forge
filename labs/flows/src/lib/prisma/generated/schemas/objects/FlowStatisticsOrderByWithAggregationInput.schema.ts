import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { FlowStatisticsCountOrderByAggregateInputObjectSchema } from './FlowStatisticsCountOrderByAggregateInput.schema';
import { FlowStatisticsAvgOrderByAggregateInputObjectSchema } from './FlowStatisticsAvgOrderByAggregateInput.schema';
import { FlowStatisticsMaxOrderByAggregateInputObjectSchema } from './FlowStatisticsMaxOrderByAggregateInput.schema';
import { FlowStatisticsMinOrderByAggregateInputObjectSchema } from './FlowStatisticsMinOrderByAggregateInput.schema';
import { FlowStatisticsSumOrderByAggregateInputObjectSchema } from './FlowStatisticsSumOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    totalRuns: SortOrderSchema.optional(),
    successfulRuns: SortOrderSchema.optional(),
    failedRuns: SortOrderSchema.optional(),
    lastUpdated: SortOrderSchema.optional(),
    _count: z
      .lazy(() => FlowStatisticsCountOrderByAggregateInputObjectSchema)
      .optional(),
    _avg: z
      .lazy(() => FlowStatisticsAvgOrderByAggregateInputObjectSchema)
      .optional(),
    _max: z
      .lazy(() => FlowStatisticsMaxOrderByAggregateInputObjectSchema)
      .optional(),
    _min: z
      .lazy(() => FlowStatisticsMinOrderByAggregateInputObjectSchema)
      .optional(),
    _sum: z
      .lazy(() => FlowStatisticsSumOrderByAggregateInputObjectSchema)
      .optional(),
  })
  .strict();

export const FlowStatisticsOrderByWithAggregationInputObjectSchema = Schema;
