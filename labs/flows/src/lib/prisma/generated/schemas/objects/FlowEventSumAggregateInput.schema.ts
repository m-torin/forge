import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flowRunId: z.literal(true).optional(),
    id: z.literal(true).optional(),
  })
  .strict();

export const FlowEventSumAggregateInputObjectSchema = Schema;
