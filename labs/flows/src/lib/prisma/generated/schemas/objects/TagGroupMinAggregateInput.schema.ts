import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.literal(true).optional(),
    name: z.literal(true).optional(),
    color: z.literal(true).optional(),
    deleted: z.literal(true).optional(),
    createdAt: z.literal(true).optional(),
    updatedAt: z.literal(true).optional(),
    instanceId: z.literal(true).optional(),
  })
  .strict();

export const TagGroupMinAggregateInputObjectSchema = Schema;
