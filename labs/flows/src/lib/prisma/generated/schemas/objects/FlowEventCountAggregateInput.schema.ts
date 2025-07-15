import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.literal(true).optional(),
    flowRunId: z.literal(true).optional(),
    flowId: z.literal(true).optional(),
    id: z.literal(true).optional(),
    nodeId: z.literal(true).optional(),
    payload: z.literal(true).optional(),
    metadata: z.literal(true).optional(),
    startedBy: z.literal(true).optional(),
    _all: z.literal(true).optional(),
  })
  .strict();

export const FlowEventCountAggregateInputObjectSchema = Schema;
