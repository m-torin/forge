import { z } from 'zod';
import { MantineColorSchema } from '../enums/MantineColor.schema';
import { NestedIntFilterObjectSchema } from './NestedIntFilter.schema';
import { NestedEnumMantineColorFilterObjectSchema } from './NestedEnumMantineColorFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: MantineColorSchema.optional(),
    in: MantineColorSchema.array().optional(),
    notIn: MantineColorSchema.array().optional(),
    not: z
      .union([
        MantineColorSchema,
        z.lazy(() => NestedEnumMantineColorWithAggregatesFilterObjectSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
    _min: z.lazy(() => NestedEnumMantineColorFilterObjectSchema).optional(),
    _max: z.lazy(() => NestedEnumMantineColorFilterObjectSchema).optional(),
  })
  .strict();

export const NestedEnumMantineColorWithAggregatesFilterObjectSchema = Schema;
