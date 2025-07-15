import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    totalRuns: z.literal(true).optional(),
    successfulRuns: z.literal(true).optional(),
    failedRuns: z.literal(true).optional(),
  })
  .strict();

export const FlowStatisticsAvgAggregateInputObjectSchema = Schema;
