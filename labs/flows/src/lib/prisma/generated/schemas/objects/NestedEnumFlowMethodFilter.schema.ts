import { z } from 'zod';
import { FlowMethodSchema } from '../enums/FlowMethod.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: FlowMethodSchema.optional(),
    in: FlowMethodSchema.array().optional(),
    notIn: FlowMethodSchema.array().optional(),
    not: z
      .union([
        FlowMethodSchema,
        z.lazy(() => NestedEnumFlowMethodFilterObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const NestedEnumFlowMethodFilterObjectSchema = Schema;
