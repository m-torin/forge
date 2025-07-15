import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { InfrastructureCountOrderByAggregateInputObjectSchema } from './InfrastructureCountOrderByAggregateInput.schema';
import { InfrastructureMaxOrderByAggregateInputObjectSchema } from './InfrastructureMaxOrderByAggregateInput.schema';
import { InfrastructureMinOrderByAggregateInputObjectSchema } from './InfrastructureMinOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    arn: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    canControl: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    data: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    id: SortOrderSchema.optional(),
    name: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    type: SortOrderSchema.optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    _count: z
      .lazy(() => InfrastructureCountOrderByAggregateInputObjectSchema)
      .optional(),
    _max: z
      .lazy(() => InfrastructureMaxOrderByAggregateInputObjectSchema)
      .optional(),
    _min: z
      .lazy(() => InfrastructureMinOrderByAggregateInputObjectSchema)
      .optional(),
  })
  .strict();

export const InfrastructureOrderByWithAggregationInputObjectSchema = Schema;
