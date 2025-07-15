import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { TagOrderByRelationAggregateInputObjectSchema } from './TagOrderByRelationAggregateInput.schema';
import { InstanceOrderByWithRelationInputObjectSchema } from './InstanceOrderByWithRelationInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.TagGroupOrderByWithRelationInput> = z
  .object({
    id: SortOrderSchema.optional(),
    name: SortOrderSchema.optional(),
    color: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    instanceId: SortOrderSchema.optional(),
    tags: z.lazy(() => TagOrderByRelationAggregateInputObjectSchema).optional(),
    instance: z
      .lazy(() => InstanceOrderByWithRelationInputObjectSchema)
      .optional(),
  })
  .strict();

export const TagGroupOrderByWithRelationInputObjectSchema = Schema;
