import { z } from 'zod';
import { SecretCategorySchema } from '../enums/SecretCategory.schema';
import { NestedEnumSecretCategoryWithAggregatesFilterObjectSchema } from './NestedEnumSecretCategoryWithAggregatesFilter.schema';
import { NestedIntFilterObjectSchema } from './NestedIntFilter.schema';
import { NestedEnumSecretCategoryFilterObjectSchema } from './NestedEnumSecretCategoryFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: SecretCategorySchema.optional(),
    in: SecretCategorySchema.array().optional(),
    notIn: SecretCategorySchema.array().optional(),
    not: z
      .union([
        SecretCategorySchema,
        z.lazy(() => NestedEnumSecretCategoryWithAggregatesFilterObjectSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
    _min: z.lazy(() => NestedEnumSecretCategoryFilterObjectSchema).optional(),
    _max: z.lazy(() => NestedEnumSecretCategoryFilterObjectSchema).optional(),
  })
  .strict();

export const EnumSecretCategoryWithAggregatesFilterObjectSchema = Schema;
