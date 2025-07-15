import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.literal(true).optional(),
    createdBy: z.literal(true).optional(),
    endpoint: z.literal(true).optional(),
    frequency: z.literal(true).optional(),
    id: z.literal(true).optional(),
    name: z.literal(true).optional(),
    deleted: z.literal(true).optional(),
  })
  .strict();

export const ScheduledJobMaxAggregateInputObjectSchema = Schema;
