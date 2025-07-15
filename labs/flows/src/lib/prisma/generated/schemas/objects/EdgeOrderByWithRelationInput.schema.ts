import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { FlowOrderByWithRelationInputObjectSchema } from './FlowOrderByWithRelationInput.schema';
import { NodeOrderByWithRelationInputObjectSchema } from './NodeOrderByWithRelationInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.EdgeOrderByWithRelationInput> = z
  .object({
    id: SortOrderSchema.optional(),
    sourceNodeId: SortOrderSchema.optional(),
    targetNodeId: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    rfId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    label: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    isActive: SortOrderSchema.optional(),
    type: SortOrderSchema.optional(),
    normalizedKey: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    createdAt: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    flow: z.lazy(() => FlowOrderByWithRelationInputObjectSchema).optional(),
    sourceNode: z
      .lazy(() => NodeOrderByWithRelationInputObjectSchema)
      .optional(),
    targetNode: z
      .lazy(() => NodeOrderByWithRelationInputObjectSchema)
      .optional(),
  })
  .strict();

export const EdgeOrderByWithRelationInputObjectSchema = Schema;
