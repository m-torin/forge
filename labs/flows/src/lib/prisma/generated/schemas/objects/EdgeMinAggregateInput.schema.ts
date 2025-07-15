import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.literal(true).optional(),
    sourceNodeId: z.literal(true).optional(),
    targetNodeId: z.literal(true).optional(),
    flowId: z.literal(true).optional(),
    rfId: z.literal(true).optional(),
    label: z.literal(true).optional(),
    isActive: z.literal(true).optional(),
    type: z.literal(true).optional(),
    normalizedKey: z.literal(true).optional(),
    createdAt: z.literal(true).optional(),
    updatedAt: z.literal(true).optional(),
    deleted: z.literal(true).optional(),
  })
  .strict();

export const EdgeMinAggregateInputObjectSchema = Schema;
