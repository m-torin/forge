import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { TagGroupCountOrderByAggregateInputObjectSchema } from './TagGroupCountOrderByAggregateInput.schema';
import { TagGroupMaxOrderByAggregateInputObjectSchema } from './TagGroupMaxOrderByAggregateInput.schema';
import { TagGroupMinOrderByAggregateInputObjectSchema } from './TagGroupMinOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: SortOrderSchema.optional(),
    name: SortOrderSchema.optional(),
    color: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    instanceId: SortOrderSchema.optional(),
    _count: z
      .lazy(() => TagGroupCountOrderByAggregateInputObjectSchema)
      .optional(),
    _max: z.lazy(() => TagGroupMaxOrderByAggregateInputObjectSchema).optional(),
    _min: z.lazy(() => TagGroupMinOrderByAggregateInputObjectSchema).optional(),
  })
  .strict();

export const TagGroupOrderByWithAggregationInputObjectSchema = Schema;
