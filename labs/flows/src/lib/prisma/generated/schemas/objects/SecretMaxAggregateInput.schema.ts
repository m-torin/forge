import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    name: z.literal(true).optional(),
    category: z.literal(true).optional(),
    createdAt: z.literal(true).optional(),
    flowId: z.literal(true).optional(),
    id: z.literal(true).optional(),
    nodeId: z.literal(true).optional(),
    secret: z.literal(true).optional(),
    shouldEncrypt: z.literal(true).optional(),
    updatedAt: z.literal(true).optional(),
    deleted: z.literal(true).optional(),
  })
  .strict();

export const SecretMaxAggregateInputObjectSchema = Schema;
