import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    createdBy: SortOrderSchema.optional(),
    endpoint: SortOrderSchema.optional(),
    frequency: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    name: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
  })
  .strict();

export const ScheduledJobMaxOrderByAggregateInputObjectSchema = Schema;
