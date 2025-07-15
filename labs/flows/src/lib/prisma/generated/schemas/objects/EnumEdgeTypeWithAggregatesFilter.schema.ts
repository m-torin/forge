import { z } from 'zod';
import { EdgeTypeSchema } from '../enums/EdgeType.schema';
import { NestedEnumEdgeTypeWithAggregatesFilterObjectSchema } from './NestedEnumEdgeTypeWithAggregatesFilter.schema';
import { NestedIntFilterObjectSchema } from './NestedIntFilter.schema';
import { NestedEnumEdgeTypeFilterObjectSchema } from './NestedEnumEdgeTypeFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: EdgeTypeSchema.optional(),
    in: EdgeTypeSchema.array().optional(),
    notIn: EdgeTypeSchema.array().optional(),
    not: z
      .union([
        EdgeTypeSchema,
        z.lazy(() => NestedEnumEdgeTypeWithAggregatesFilterObjectSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
    _min: z.lazy(() => NestedEnumEdgeTypeFilterObjectSchema).optional(),
    _max: z.lazy(() => NestedEnumEdgeTypeFilterObjectSchema).optional(),
  })
  .strict();

export const EnumEdgeTypeWithAggregatesFilterObjectSchema = Schema;
