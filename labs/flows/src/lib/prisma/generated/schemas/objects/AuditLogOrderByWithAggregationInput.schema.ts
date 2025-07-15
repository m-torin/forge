import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { AuditLogCountOrderByAggregateInputObjectSchema } from './AuditLogCountOrderByAggregateInput.schema';
import { AuditLogMaxOrderByAggregateInputObjectSchema } from './AuditLogMaxOrderByAggregateInput.schema';
import { AuditLogMinOrderByAggregateInputObjectSchema } from './AuditLogMinOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
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
    _count: z
      .lazy(() => AuditLogCountOrderByAggregateInputObjectSchema)
      .optional(),
    _max: z.lazy(() => AuditLogMaxOrderByAggregateInputObjectSchema).optional(),
    _min: z.lazy(() => AuditLogMinOrderByAggregateInputObjectSchema).optional(),
  })
  .strict();

export const AuditLogOrderByWithAggregationInputObjectSchema = Schema;
