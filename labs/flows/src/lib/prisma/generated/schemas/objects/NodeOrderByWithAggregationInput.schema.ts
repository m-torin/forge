import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { NodeCountOrderByAggregateInputObjectSchema } from './NodeCountOrderByAggregateInput.schema';
import { NodeMaxOrderByAggregateInputObjectSchema } from './NodeMaxOrderByAggregateInput.schema';
import { NodeMinOrderByAggregateInputObjectSchema } from './NodeMinOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    arn: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    createdAt: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    infrastructureId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    name: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    position: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    rfId: SortOrderSchema.optional(),
    type: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    _count: z.lazy(() => NodeCountOrderByAggregateInputObjectSchema).optional(),
    _max: z.lazy(() => NodeMaxOrderByAggregateInputObjectSchema).optional(),
    _min: z.lazy(() => NodeMinOrderByAggregateInputObjectSchema).optional(),
  })
  .strict();

export const NodeOrderByWithAggregationInputObjectSchema = Schema;
