import { z } from 'zod';
import { SecretCategorySchema } from '../enums/SecretCategory.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    set: SecretCategorySchema.optional(),
  })
  .strict();

export const EnumSecretCategoryFieldUpdateOperationsInputObjectSchema = Schema;
