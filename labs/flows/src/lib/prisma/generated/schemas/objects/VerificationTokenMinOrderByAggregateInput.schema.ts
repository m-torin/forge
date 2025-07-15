import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    expires: SortOrderSchema.optional(),
    identifier: SortOrderSchema.optional(),
    token: SortOrderSchema.optional(),
  })
  .strict();

export const VerificationTokenMinOrderByAggregateInputObjectSchema = Schema;
