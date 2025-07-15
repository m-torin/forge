import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.literal(true).optional(),
    entityType: z.literal(true).optional(),
    entityId: z.literal(true).optional(),
    flowId: z.literal(true).optional(),
    changeType: z.literal(true).optional(),
    userId: z.literal(true).optional(),
    timestamp: z.literal(true).optional(),
  })
  .strict();

export const AuditLogMaxAggregateInputObjectSchema = Schema;
