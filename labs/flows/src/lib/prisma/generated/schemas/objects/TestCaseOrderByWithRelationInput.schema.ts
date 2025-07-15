import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { FlowOrderByWithRelationInputObjectSchema } from './FlowOrderByWithRelationInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.TestCaseOrderByWithRelationInput> = z
  .object({
    color: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    name: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    flow: z.lazy(() => FlowOrderByWithRelationInputObjectSchema).optional(),
  })
  .strict();

export const TestCaseOrderByWithRelationInputObjectSchema = Schema;
