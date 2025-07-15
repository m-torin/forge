import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    email: SortOrderSchema.optional(),
    emailVerified: SortOrderSchema.optional(),
    image: SortOrderSchema.optional(),
    name: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
  })
  .strict();

export const UserCountOrderByAggregateInputObjectSchema = Schema;
