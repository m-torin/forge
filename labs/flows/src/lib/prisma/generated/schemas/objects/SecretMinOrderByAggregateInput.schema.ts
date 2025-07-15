import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    name: SortOrderSchema.optional(),
    category: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    nodeId: SortOrderSchema.optional(),
    secret: SortOrderSchema.optional(),
    shouldEncrypt: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
  })
  .strict();

export const SecretMinOrderByAggregateInputObjectSchema = Schema;
