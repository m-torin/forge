import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { SecretCountOrderByAggregateInputObjectSchema } from './SecretCountOrderByAggregateInput.schema';
import { SecretAvgOrderByAggregateInputObjectSchema } from './SecretAvgOrderByAggregateInput.schema';
import { SecretMaxOrderByAggregateInputObjectSchema } from './SecretMaxOrderByAggregateInput.schema';
import { SecretMinOrderByAggregateInputObjectSchema } from './SecretMinOrderByAggregateInput.schema';
import { SecretSumOrderByAggregateInputObjectSchema } from './SecretSumOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    name: SortOrderSchema.optional(),
    category: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    flowId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    id: SortOrderSchema.optional(),
    nodeId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    secret: SortOrderSchema.optional(),
    shouldEncrypt: SortOrderSchema.optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    _count: z
      .lazy(() => SecretCountOrderByAggregateInputObjectSchema)
      .optional(),
    _avg: z.lazy(() => SecretAvgOrderByAggregateInputObjectSchema).optional(),
    _max: z.lazy(() => SecretMaxOrderByAggregateInputObjectSchema).optional(),
    _min: z.lazy(() => SecretMinOrderByAggregateInputObjectSchema).optional(),
    _sum: z.lazy(() => SecretSumOrderByAggregateInputObjectSchema).optional(),
  })
  .strict();

export const SecretOrderByWithAggregationInputObjectSchema = Schema;
