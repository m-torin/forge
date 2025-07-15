import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { FlowOrderByWithRelationInputObjectSchema } from './FlowOrderByWithRelationInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.FlowStatisticsOrderByWithRelationInput> = z
  .object({
    id: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    totalRuns: SortOrderSchema.optional(),
    successfulRuns: SortOrderSchema.optional(),
    failedRuns: SortOrderSchema.optional(),
    lastUpdated: SortOrderSchema.optional(),
    flow: z.lazy(() => FlowOrderByWithRelationInputObjectSchema).optional(),
  })
  .strict();

export const FlowStatisticsOrderByWithRelationInputObjectSchema = Schema;
