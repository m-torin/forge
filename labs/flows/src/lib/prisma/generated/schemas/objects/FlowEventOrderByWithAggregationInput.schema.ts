import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { FlowEventCountOrderByAggregateInputObjectSchema } from './FlowEventCountOrderByAggregateInput.schema';
import { FlowEventAvgOrderByAggregateInputObjectSchema } from './FlowEventAvgOrderByAggregateInput.schema';
import { FlowEventMaxOrderByAggregateInputObjectSchema } from './FlowEventMaxOrderByAggregateInput.schema';
import { FlowEventMinOrderByAggregateInputObjectSchema } from './FlowEventMinOrderByAggregateInput.schema';
import { FlowEventSumOrderByAggregateInputObjectSchema } from './FlowEventSumOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    flowRunId: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    nodeId: SortOrderSchema.optional(),
    payload: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    startedBy: SortOrderSchema.optional(),
    _count: z
      .lazy(() => FlowEventCountOrderByAggregateInputObjectSchema)
      .optional(),
    _avg: z
      .lazy(() => FlowEventAvgOrderByAggregateInputObjectSchema)
      .optional(),
    _max: z
      .lazy(() => FlowEventMaxOrderByAggregateInputObjectSchema)
      .optional(),
    _min: z
      .lazy(() => FlowEventMinOrderByAggregateInputObjectSchema)
      .optional(),
    _sum: z
      .lazy(() => FlowEventSumOrderByAggregateInputObjectSchema)
      .optional(),
  })
  .strict();

export const FlowEventOrderByWithAggregationInputObjectSchema = Schema;
