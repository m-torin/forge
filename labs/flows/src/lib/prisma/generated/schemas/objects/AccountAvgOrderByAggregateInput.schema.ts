import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    expires_at: SortOrderSchema.optional(),
    refresh_token_expires_in: SortOrderSchema.optional(),
  })
  .strict();

export const AccountAvgOrderByAggregateInputObjectSchema = Schema;
