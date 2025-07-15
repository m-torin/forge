import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    description: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    image: SortOrderSchema.optional(),
    logo: SortOrderSchema.optional(),
    name: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
    userId: SortOrderSchema.optional(),
  })
  .strict();

export const InstanceMaxOrderByAggregateInputObjectSchema = Schema;
