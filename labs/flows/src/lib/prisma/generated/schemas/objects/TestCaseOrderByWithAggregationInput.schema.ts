import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { TestCaseCountOrderByAggregateInputObjectSchema } from './TestCaseCountOrderByAggregateInput.schema';
import { TestCaseMaxOrderByAggregateInputObjectSchema } from './TestCaseMaxOrderByAggregateInput.schema';
import { TestCaseMinOrderByAggregateInputObjectSchema } from './TestCaseMinOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    color: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    name: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    _count: z
      .lazy(() => TestCaseCountOrderByAggregateInputObjectSchema)
      .optional(),
    _max: z.lazy(() => TestCaseMaxOrderByAggregateInputObjectSchema).optional(),
    _min: z.lazy(() => TestCaseMinOrderByAggregateInputObjectSchema).optional(),
  })
  .strict();

export const TestCaseOrderByWithAggregationInputObjectSchema = Schema;
