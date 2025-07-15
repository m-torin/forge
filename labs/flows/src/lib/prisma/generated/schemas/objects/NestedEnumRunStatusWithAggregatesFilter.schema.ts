import { z } from 'zod';
import { RunStatusSchema } from '../enums/RunStatus.schema';
import { NestedIntFilterObjectSchema } from './NestedIntFilter.schema';
import { NestedEnumRunStatusFilterObjectSchema } from './NestedEnumRunStatusFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: RunStatusSchema.optional(),
    in: RunStatusSchema.array().optional(),
    notIn: RunStatusSchema.array().optional(),
    not: z
      .union([
        RunStatusSchema,
        z.lazy(() => NestedEnumRunStatusWithAggregatesFilterObjectSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
    _min: z.lazy(() => NestedEnumRunStatusFilterObjectSchema).optional(),
    _max: z.lazy(() => NestedEnumRunStatusFilterObjectSchema).optional(),
  })
  .strict();

export const NestedEnumRunStatusWithAggregatesFilterObjectSchema = Schema;
