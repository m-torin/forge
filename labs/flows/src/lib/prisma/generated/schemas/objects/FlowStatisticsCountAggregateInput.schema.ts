import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.literal(true).optional(),
    flowId: z.literal(true).optional(),
    totalRuns: z.literal(true).optional(),
    successfulRuns: z.literal(true).optional(),
    failedRuns: z.literal(true).optional(),
    lastUpdated: z.literal(true).optional(),
    _all: z.literal(true).optional(),
  })
  .strict();

export const FlowStatisticsCountAggregateInputObjectSchema = Schema;
