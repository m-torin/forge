import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { FlowOrderByRelationAggregateInputObjectSchema } from './FlowOrderByRelationAggregateInput.schema';
import { TagOrderByRelationAggregateInputObjectSchema } from './TagOrderByRelationAggregateInput.schema';
import { TagGroupOrderByRelationAggregateInputObjectSchema } from './TagGroupOrderByRelationAggregateInput.schema';
import { UserOrderByWithRelationInputObjectSchema } from './UserOrderByWithRelationInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.InstanceOrderByWithRelationInput> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    description: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    id: SortOrderSchema.optional(),
    image: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    logo: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    name: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    updatedAt: SortOrderSchema.optional(),
    userId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    flows: z
      .lazy(() => FlowOrderByRelationAggregateInputObjectSchema)
      .optional(),
    tags: z.lazy(() => TagOrderByRelationAggregateInputObjectSchema).optional(),
    tagGroups: z
      .lazy(() => TagGroupOrderByRelationAggregateInputObjectSchema)
      .optional(),
    user: z.lazy(() => UserOrderByWithRelationInputObjectSchema).optional(),
  })
  .strict();

export const InstanceOrderByWithRelationInputObjectSchema = Schema;
