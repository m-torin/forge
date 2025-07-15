import { z } from 'zod';
import { FlowMethodSchema } from '../enums/FlowMethod.schema';
import { NestedIntFilterObjectSchema } from './NestedIntFilter.schema';
import { NestedEnumFlowMethodFilterObjectSchema } from './NestedEnumFlowMethodFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: FlowMethodSchema.optional(),
    in: FlowMethodSchema.array().optional(),
    notIn: FlowMethodSchema.array().optional(),
    not: z
      .union([
        FlowMethodSchema,
        z.lazy(() => NestedEnumFlowMethodWithAggregatesFilterObjectSchema),
      ])
      .optional(),
    _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
    _min: z.lazy(() => NestedEnumFlowMethodFilterObjectSchema).optional(),
    _max: z.lazy(() => NestedEnumFlowMethodFilterObjectSchema).optional(),
  })
  .strict();

export const NestedEnumFlowMethodWithAggregatesFilterObjectSchema = Schema;
