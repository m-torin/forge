import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: SortOrderSchema.optional(),
    entityType: SortOrderSchema.optional(),
    entityId: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    changeType: SortOrderSchema.optional(),
    userId: SortOrderSchema.optional(),
    timestamp: SortOrderSchema.optional(),
  })
  .strict();

export const AuditLogMinOrderByAggregateInputObjectSchema = Schema;
