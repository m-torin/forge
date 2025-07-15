import { z } from 'zod';
import { SecretCategorySchema } from '../enums/SecretCategory.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: SecretCategorySchema.optional(),
    in: SecretCategorySchema.array().optional(),
    notIn: SecretCategorySchema.array().optional(),
    not: z
      .union([
        SecretCategorySchema,
        z.lazy(() => NestedEnumSecretCategoryFilterObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const NestedEnumSecretCategoryFilterObjectSchema = Schema;
