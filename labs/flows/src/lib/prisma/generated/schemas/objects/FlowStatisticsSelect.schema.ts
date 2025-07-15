import { z } from 'zod';
import { FlowArgsObjectSchema } from './FlowArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.boolean().optional(),
    flow: z.union([z.boolean(), z.lazy(() => FlowArgsObjectSchema)]).optional(),
    flowId: z.boolean().optional(),
    totalRuns: z.boolean().optional(),
    successfulRuns: z.boolean().optional(),
    failedRuns: z.boolean().optional(),
    lastUpdated: z.boolean().optional(),
  })
  .strict();

export const FlowStatisticsSelectObjectSchema = Schema;
