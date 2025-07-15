import { z } from 'zod';
import { InfraTypeSchema } from '../enums/InfraType.schema';
import { NestedEnumInfraTypeWithAggregatesFilterObjectSchema } from './NestedEnumInfraTypeWithAggregatesFilter.schema';
import { NestedIntFilterObjectSchema } from './NestedIntFilter.schema';
import { NestedEnumInfraTypeFilterObjectSchema } from './NestedEnumInfraTypeFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: InfraTypeSchema.optional(),
    in: InfraTypeSchema.array().optional(),
    notIn: InfraTypeSchema.array().optional(),
    not: z
      .union([
        InfraTypeSchema,
        z.lazy(() => NestedEnumInfraTypeWithAggregatesFilterObjectSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
    _min: z.lazy(() => NestedEnumInfraTypeFilterObjectSchema).optional(),
    _max: z.lazy(() => NestedEnumInfraTypeFilterObjectSchema).optional(),
  })
  .strict();

export const EnumInfraTypeWithAggregatesFilterObjectSchema = Schema;
