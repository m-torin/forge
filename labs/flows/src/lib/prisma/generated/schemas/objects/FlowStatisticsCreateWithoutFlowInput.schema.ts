import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.string().optional(),
    totalRuns: z.number().int().optional(),
    successfulRuns: z.number().int().optional(),
    failedRuns: z.number().int().optional(),
    lastUpdated: z.coerce.date().optional(),
  })
  .strict();

export const FlowStatisticsCreateWithoutFlowInputObjectSchema = Schema;
