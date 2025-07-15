import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { FlowRunOrderByRelationAggregateInputObjectSchema } from './FlowRunOrderByRelationAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.ScheduledJobOrderByWithRelationInput> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    createdBy: SortOrderSchema.optional(),
    endpoint: SortOrderSchema.optional(),
    frequency: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    name: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    flowRuns: z
      .lazy(() => FlowRunOrderByRelationAggregateInputObjectSchema)
      .optional(),
  })
  .strict();

export const ScheduledJobOrderByWithRelationInputObjectSchema = Schema;
