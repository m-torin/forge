import { z } from 'zod';
import { EdgeTypeSchema } from '../enums/EdgeType.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: EdgeTypeSchema.optional(),
    in: EdgeTypeSchema.array().optional(),
    notIn: EdgeTypeSchema.array().optional(),
    not: z
      .union([
        EdgeTypeSchema,
        z.lazy(() => NestedEnumEdgeTypeFilterObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const NestedEnumEdgeTypeFilterObjectSchema = Schema;
