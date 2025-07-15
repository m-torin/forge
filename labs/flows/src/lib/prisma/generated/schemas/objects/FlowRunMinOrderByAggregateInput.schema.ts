import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flowId: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    isScheduled: SortOrderSchema.optional(),
    runStatus: SortOrderSchema.optional(),
    scheduledJobId: SortOrderSchema.optional(),
    startedBy: SortOrderSchema.optional(),
    timeEnded: SortOrderSchema.optional(),
    timeStarted: SortOrderSchema.optional(),
  })
  .strict();

export const FlowRunMinOrderByAggregateInputObjectSchema = Schema;
