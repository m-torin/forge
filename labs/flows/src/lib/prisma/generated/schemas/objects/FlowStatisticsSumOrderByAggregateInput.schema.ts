import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    totalRuns: SortOrderSchema.optional(),
    successfulRuns: SortOrderSchema.optional(),
    failedRuns: SortOrderSchema.optional(),
  })
  .strict();

export const FlowStatisticsSumOrderByAggregateInputObjectSchema = Schema;
