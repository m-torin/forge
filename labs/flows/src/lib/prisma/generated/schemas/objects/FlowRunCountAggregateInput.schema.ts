import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flowId: z.literal(true).optional(),
    id: z.literal(true).optional(),
    isScheduled: z.literal(true).optional(),
    payload: z.literal(true).optional(),
    metadata: z.literal(true).optional(),
    runStatus: z.literal(true).optional(),
    scheduledJobId: z.literal(true).optional(),
    startedBy: z.literal(true).optional(),
    timeEnded: z.literal(true).optional(),
    timeStarted: z.literal(true).optional(),
    _all: z.literal(true).optional(),
  })
  .strict();

export const FlowRunCountAggregateInputObjectSchema = Schema;
