import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: SortOrderSchema.optional(),
    sourceNodeId: SortOrderSchema.optional(),
    targetNodeId: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    rfId: SortOrderSchema.optional(),
    label: SortOrderSchema.optional(),
    isActive: SortOrderSchema.optional(),
    type: SortOrderSchema.optional(),
    normalizedKey: SortOrderSchema.optional(),
    metadata: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
  })
  .strict();

export const EdgeCountOrderByAggregateInputObjectSchema = Schema;
