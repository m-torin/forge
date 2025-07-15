import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    arn: z.literal(true).optional(),
    canControl: z.literal(true).optional(),
    createdAt: z.literal(true).optional(),
    id: z.literal(true).optional(),
    name: z.literal(true).optional(),
    type: z.literal(true).optional(),
    updatedAt: z.literal(true).optional(),
    deleted: z.literal(true).optional(),
  })
  .strict();

export const InfrastructureMinAggregateInputObjectSchema = Schema;
