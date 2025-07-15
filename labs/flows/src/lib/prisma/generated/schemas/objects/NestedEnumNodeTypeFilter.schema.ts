import { z } from 'zod';
import { NodeTypeSchema } from '../enums/NodeType.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: NodeTypeSchema.optional(),
    in: NodeTypeSchema.array().optional(),
    notIn: NodeTypeSchema.array().optional(),
    not: z
      .union([
        NodeTypeSchema,
        z.lazy(() => NestedEnumNodeTypeFilterObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const NestedEnumNodeTypeFilterObjectSchema = Schema;
