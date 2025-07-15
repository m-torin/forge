import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    arn: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    infrastructureId: SortOrderSchema.optional(),
    name: SortOrderSchema.optional(),
    position: SortOrderSchema.optional(),
    metadata: SortOrderSchema.optional(),
    rfId: SortOrderSchema.optional(),
    type: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
  })
  .strict();

export const NodeCountOrderByAggregateInputObjectSchema = Schema;
