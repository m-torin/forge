import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.literal(true).optional(),
    id: z.literal(true).optional(),
    instanceId: z.literal(true).optional(),
    isEnabled: z.literal(true).optional(),
    method: z.literal(true).optional(),
    name: z.literal(true).optional(),
    updatedAt: z.literal(true).optional(),
    deleted: z.literal(true).optional(),
  })
  .strict();

export const FlowMinAggregateInputObjectSchema = Schema;
