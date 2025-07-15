import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SessionCountOrderByAggregateInputObjectSchema } from './SessionCountOrderByAggregateInput.schema';
import { SessionMaxOrderByAggregateInputObjectSchema } from './SessionMaxOrderByAggregateInput.schema';
import { SessionMinOrderByAggregateInputObjectSchema } from './SessionMinOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    expires: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    sessionToken: SortOrderSchema.optional(),
    userId: SortOrderSchema.optional(),
    _count: z
      .lazy(() => SessionCountOrderByAggregateInputObjectSchema)
      .optional(),
    _max: z.lazy(() => SessionMaxOrderByAggregateInputObjectSchema).optional(),
    _min: z.lazy(() => SessionMinOrderByAggregateInputObjectSchema).optional(),
  })
  .strict();

export const SessionOrderByWithAggregationInputObjectSchema = Schema;
