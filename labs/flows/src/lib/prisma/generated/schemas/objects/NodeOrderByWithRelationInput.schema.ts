import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { FlowOrderByWithRelationInputObjectSchema } from './FlowOrderByWithRelationInput.schema';
import { InfrastructureOrderByWithRelationInputObjectSchema } from './InfrastructureOrderByWithRelationInput.schema';
import { SecretOrderByRelationAggregateInputObjectSchema } from './SecretOrderByRelationAggregateInput.schema';
import { EdgeOrderByRelationAggregateInputObjectSchema } from './EdgeOrderByRelationAggregateInput.schema';
import { TagOrderByRelationAggregateInputObjectSchema } from './TagOrderByRelationAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.NodeOrderByWithRelationInput> = z
  .object({
    arn: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    createdAt: SortOrderSchema.optional(),
    flowId: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    infrastructureId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    name: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    position: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    rfId: SortOrderSchema.optional(),
    type: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    flow: z.lazy(() => FlowOrderByWithRelationInputObjectSchema).optional(),
    infrastructure: z
      .lazy(() => InfrastructureOrderByWithRelationInputObjectSchema)
      .optional(),
    secrets: z
      .lazy(() => SecretOrderByRelationAggregateInputObjectSchema)
      .optional(),
    sourceEdges: z
      .lazy(() => EdgeOrderByRelationAggregateInputObjectSchema)
      .optional(),
    targetEdges: z
      .lazy(() => EdgeOrderByRelationAggregateInputObjectSchema)
      .optional(),
    Tag: z.lazy(() => TagOrderByRelationAggregateInputObjectSchema).optional(),
  })
  .strict();

export const NodeOrderByWithRelationInputObjectSchema = Schema;
