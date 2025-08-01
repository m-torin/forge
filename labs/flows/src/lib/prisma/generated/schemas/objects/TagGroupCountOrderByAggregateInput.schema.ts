import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: SortOrderSchema.optional(),
    name: SortOrderSchema.optional(),
    color: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
    metadata: SortOrderSchema.optional(),
    instanceId: SortOrderSchema.optional(),
  })
  .strict();

export const TagGroupCountOrderByAggregateInputObjectSchema = Schema;
