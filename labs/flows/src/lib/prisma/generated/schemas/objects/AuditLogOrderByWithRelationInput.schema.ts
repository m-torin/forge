import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { UserOrderByWithRelationInputObjectSchema } from './UserOrderByWithRelationInput.schema';
import { FlowOrderByWithRelationInputObjectSchema } from './FlowOrderByWithRelationInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.AuditLogOrderByWithRelationInput> = z
  .object({
    id: SortOrderSchema.optional(),
    entityType: SortOrderSchema.optional(),
    entityId: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    changeType: SortOrderSchema.optional(),
    before: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    after: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    userId: SortOrderSchema.optional(),
    timestamp: SortOrderSchema.optional(),
    user: z.lazy(() => UserOrderByWithRelationInputObjectSchema).optional(),
    flow: z.lazy(() => FlowOrderByWithRelationInputObjectSchema).optional(),
  })
  .strict();

export const AuditLogOrderByWithRelationInputObjectSchema = Schema;
