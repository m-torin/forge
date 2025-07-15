import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { FlowRunCountOrderByAggregateInputObjectSchema } from './FlowRunCountOrderByAggregateInput.schema';
import { FlowRunAvgOrderByAggregateInputObjectSchema } from './FlowRunAvgOrderByAggregateInput.schema';
import { FlowRunMaxOrderByAggregateInputObjectSchema } from './FlowRunMaxOrderByAggregateInput.schema';
import { FlowRunMinOrderByAggregateInputObjectSchema } from './FlowRunMinOrderByAggregateInput.schema';
import { FlowRunSumOrderByAggregateInputObjectSchema } from './FlowRunSumOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flowId: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    isScheduled: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    payload: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    runStatus: SortOrderSchema.optional(),
    scheduledJobId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    startedBy: SortOrderSchema.optional(),
    timeEnded: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    timeStarted: SortOrderSchema.optional(),
    _count: z
      .lazy(() => FlowRunCountOrderByAggregateInputObjectSchema)
      .optional(),
    _avg: z.lazy(() => FlowRunAvgOrderByAggregateInputObjectSchema).optional(),
    _max: z.lazy(() => FlowRunMaxOrderByAggregateInputObjectSchema).optional(),
    _min: z.lazy(() => FlowRunMinOrderByAggregateInputObjectSchema).optional(),
    _sum: z.lazy(() => FlowRunSumOrderByAggregateInputObjectSchema).optional(),
  })
  .strict();

export const FlowRunOrderByWithAggregationInputObjectSchema = Schema;
