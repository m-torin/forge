import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    instanceId: SortOrderSchema.optional(),
    isEnabled: SortOrderSchema.optional(),
    method: SortOrderSchema.optional(),
    name: SortOrderSchema.optional(),
    metadata: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
    viewport: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
  })
  .strict();

export const FlowCountOrderByAggregateInputObjectSchema = Schema;
