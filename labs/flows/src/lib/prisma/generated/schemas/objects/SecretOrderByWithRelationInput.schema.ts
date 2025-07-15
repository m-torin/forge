import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { FlowOrderByWithRelationInputObjectSchema } from './FlowOrderByWithRelationInput.schema';
import { NodeOrderByWithRelationInputObjectSchema } from './NodeOrderByWithRelationInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.SecretOrderByWithRelationInput> = z
  .object({
    name: SortOrderSchema.optional(),
    category: SortOrderSchema.optional(),
    createdAt: SortOrderSchema.optional(),
    flowId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    id: SortOrderSchema.optional(),
    nodeId: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    secret: SortOrderSchema.optional(),
    shouldEncrypt: SortOrderSchema.optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    updatedAt: SortOrderSchema.optional(),
    deleted: SortOrderSchema.optional(),
    flow: z.lazy(() => FlowOrderByWithRelationInputObjectSchema).optional(),
    node: z.lazy(() => NodeOrderByWithRelationInputObjectSchema).optional(),
  })
  .strict();

export const SecretOrderByWithRelationInputObjectSchema = Schema;
