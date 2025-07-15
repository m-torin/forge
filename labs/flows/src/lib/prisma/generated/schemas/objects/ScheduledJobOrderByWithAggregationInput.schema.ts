import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { ScheduledJobCountOrderByAggregateInputObjectSchema } from './ScheduledJobCountOrderByAggregateInput.schema';
import { ScheduledJobAvgOrderByAggregateInputObjectSchema } from './ScheduledJobAvgOrderByAggregateInput.schema';
import { ScheduledJobMaxOrderByAggregateInputObjectSchema } from './ScheduledJobMaxOrderByAggregateInput.schema';
import { ScheduledJobMinOrderByAggregateInputObjectSchema } from './ScheduledJobMinOrderByAggregateInput.schema';
import { ScheduledJobSumOrderByAggregateInputObjectSchema } from './ScheduledJobSumOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    createdBy: SortOrderSchema.optional(),
    endpoint: SortOrderSchema.optional(),
    frequency: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    name: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    _count: z
      .lazy(() => ScheduledJobCountOrderByAggregateInputObjectSchema)
      .optional(),
    _avg: z
      .lazy(() => ScheduledJobAvgOrderByAggregateInputObjectSchema)
      .optional(),
    _max: z
      .lazy(() => ScheduledJobMaxOrderByAggregateInputObjectSchema)
      .optional(),
    _min: z
      .lazy(() => ScheduledJobMinOrderByAggregateInputObjectSchema)
      .optional(),
    _sum: z
      .lazy(() => ScheduledJobSumOrderByAggregateInputObjectSchema)
      .optional(),
  })
  .strict();

export const ScheduledJobOrderByWithAggregationInputObjectSchema = Schema;
