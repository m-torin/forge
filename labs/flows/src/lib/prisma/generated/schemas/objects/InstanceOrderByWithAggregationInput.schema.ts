import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { InstanceCountOrderByAggregateInputObjectSchema } from './InstanceCountOrderByAggregateInput.schema';
import { InstanceMaxOrderByAggregateInputObjectSchema } from './InstanceMaxOrderByAggregateInput.schema';
import { InstanceMinOrderByAggregateInputObjectSchema } from './InstanceMinOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    description: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    id: SortOrderSchema.optional(),
    image: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    logo: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    name: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    updatedAt: SortOrderSchema.optional(),
    userId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    _count: z
      .lazy(() => InstanceCountOrderByAggregateInputObjectSchema)
      .optional(),
    _max: z.lazy(() => InstanceMaxOrderByAggregateInputObjectSchema).optional(),
    _min: z.lazy(() => InstanceMinOrderByAggregateInputObjectSchema).optional(),
  })
  .strict();

export const InstanceOrderByWithAggregationInputObjectSchema = Schema;
