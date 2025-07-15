import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.literal(true).optional(),
    scheduledJobId: z.literal(true).optional(),
  })
  .strict();

export const FlowRunSumAggregateInputObjectSchema = Schema;
