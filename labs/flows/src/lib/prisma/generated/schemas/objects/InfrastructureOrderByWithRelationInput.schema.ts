import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { NodeOrderByRelationAggregateInputObjectSchema } from './NodeOrderByRelationAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.InfrastructureOrderByWithRelationInput> = z
  .object({
    arn: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    canControl: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    data: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    id: SortOrderSchema.optional(),
    name: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    type: SortOrderSchema.optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    nodes: z
      .lazy(() => NodeOrderByRelationAggregateInputObjectSchema)
      .optional(),
  })
  .strict();

export const InfrastructureOrderByWithRelationInputObjectSchema = Schema;
