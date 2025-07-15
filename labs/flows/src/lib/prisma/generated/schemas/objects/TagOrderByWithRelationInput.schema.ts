import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { FlowOrderByWithRelationInputObjectSchema } from './FlowOrderByWithRelationInput.schema';
import { NodeOrderByWithRelationInputObjectSchema } from './NodeOrderByWithRelationInput.schema';
import { TagGroupOrderByWithRelationInputObjectSchema } from './TagGroupOrderByWithRelationInput.schema';
import { InstanceOrderByWithRelationInputObjectSchema } from './InstanceOrderByWithRelationInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.TagOrderByWithRelationInput> = z
  .object({
    id: SortOrderSchema.optional(),
    name: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    flowId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    nodeId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    tagGroupId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    instanceId: SortOrderSchema.optional(),
    flow: z.lazy(() => FlowOrderByWithRelationInputObjectSchema).optional(),
    node: z.lazy(() => NodeOrderByWithRelationInputObjectSchema).optional(),
    tagGroup: z
      .lazy(() => TagGroupOrderByWithRelationInputObjectSchema)
      .optional(),
    instance: z
      .lazy(() => InstanceOrderByWithRelationInputObjectSchema)
      .optional(),
  })
  .strict();

export const TagOrderByWithRelationInputObjectSchema = Schema;
