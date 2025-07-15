import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    expires: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    sessionToken: SortOrderSchema.optional(),
    userId: SortOrderSchema.optional(),
  })
  .strict();

export const SessionMaxOrderByAggregateInputObjectSchema = Schema;
