import { z } from 'zod';
import { NodeTypeSchema } from '../enums/NodeType.schema';
import { NestedEnumNodeTypeWithAggregatesFilterObjectSchema } from './NestedEnumNodeTypeWithAggregatesFilter.schema';
import { NestedIntFilterObjectSchema } from './NestedIntFilter.schema';
import { NestedEnumNodeTypeFilterObjectSchema } from './NestedEnumNodeTypeFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: NodeTypeSchema.optional(),
    in: NodeTypeSchema.array().optional(),
    notIn: NodeTypeSchema.array().optional(),
    not: z
      .union([
        NodeTypeSchema,
        z.lazy(() => NestedEnumNodeTypeWithAggregatesFilterObjectSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
    _min: z.lazy(() => NestedEnumNodeTypeFilterObjectSchema).optional(),
    _max: z.lazy(() => NestedEnumNodeTypeFilterObjectSchema).optional(),
  })
  .strict();

export const EnumNodeTypeWithAggregatesFilterObjectSchema = Schema;
