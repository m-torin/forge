import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    flowRunId: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    nodeId: SortOrderSchema.optional(),
    startedBy: SortOrderSchema.optional(),
  })
  .strict();

export const FlowEventMinOrderByAggregateInputObjectSchema = Schema;
