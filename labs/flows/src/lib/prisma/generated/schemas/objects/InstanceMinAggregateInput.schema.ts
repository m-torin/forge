import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.literal(true).optional(),
    description: z.literal(true).optional(),
    id: z.literal(true).optional(),
    image: z.literal(true).optional(),
    logo: z.literal(true).optional(),
    name: z.literal(true).optional(),
    updatedAt: z.literal(true).optional(),
    userId: z.literal(true).optional(),
  })
  .strict();

export const InstanceMinAggregateInputObjectSchema = Schema;
