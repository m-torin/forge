import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    arn: SortOrderSchema.optional(),
    canControl: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    name: SortOrderSchema.optional(),
    type: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
  })
  .strict();

export const InfrastructureMinOrderByAggregateInputObjectSchema = Schema;
