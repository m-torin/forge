import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flowRunId: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
  })
  .strict();

export const FlowEventSumOrderByAggregateInputObjectSchema = Schema;
