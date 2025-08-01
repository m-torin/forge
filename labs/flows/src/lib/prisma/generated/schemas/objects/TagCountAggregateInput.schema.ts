import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.literal(true).optional(),
    name: z.literal(true).optional(),
    createdAt: z.literal(true).optional(),
    updatedAt: z.literal(true).optional(),
    deleted: z.literal(true).optional(),
    metadata: z.literal(true).optional(),
    flowId: z.literal(true).optional(),
    nodeId: z.literal(true).optional(),
    tagGroupId: z.literal(true).optional(),
    instanceId: z.literal(true).optional(),
    _all: z.literal(true).optional(),
  })
  .strict();

export const TagCountAggregateInputObjectSchema = Schema;
