import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { FlowCountOrderByAggregateInputObjectSchema } from './FlowCountOrderByAggregateInput.schema';
import { FlowMaxOrderByAggregateInputObjectSchema } from './FlowMaxOrderByAggregateInput.schema';
import { FlowMinOrderByAggregateInputObjectSchema } from './FlowMinOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    instanceId: SortOrderSchema.optional(),
    isEnabled: SortOrderSchema.optional(),
    method: SortOrderSchema.optional(),
    name: SortOrderSchema.optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    updatedAt: SortOrderSchema.optional(),
    viewport: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    deleted: SortOrderSchema.optional(),
    _count: z.lazy(() => FlowCountOrderByAggregateInputObjectSchema).optional(),
    _max: z.lazy(() => FlowMaxOrderByAggregateInputObjectSchema).optional(),
    _min: z.lazy(() => FlowMinOrderByAggregateInputObjectSchema).optional(),
  })
  .strict();

export const FlowOrderByWithAggregationInputObjectSchema = Schema;
