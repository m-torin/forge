import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { EdgeCountOrderByAggregateInputObjectSchema } from './EdgeCountOrderByAggregateInput.schema';
import { EdgeMaxOrderByAggregateInputObjectSchema } from './EdgeMaxOrderByAggregateInput.schema';
import { EdgeMinOrderByAggregateInputObjectSchema } from './EdgeMinOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: SortOrderSchema.optional(),
    sourceNodeId: SortOrderSchema.optional(),
    targetNodeId: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    rfId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    label: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    isActive: SortOrderSchema.optional(),
    type: SortOrderSchema.optional(),
    normalizedKey: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    createdAt: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    _count: z.lazy(() => EdgeCountOrderByAggregateInputObjectSchema).optional(),
    _max: z.lazy(() => EdgeMaxOrderByAggregateInputObjectSchema).optional(),
    _min: z.lazy(() => EdgeMinOrderByAggregateInputObjectSchema).optional(),
  })
  .strict();

export const EdgeOrderByWithAggregationInputObjectSchema = Schema;
