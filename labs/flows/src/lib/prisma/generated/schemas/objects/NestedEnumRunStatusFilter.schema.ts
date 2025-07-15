import { z } from 'zod';
import { RunStatusSchema } from '../enums/RunStatus.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: RunStatusSchema.optional(),
    in: RunStatusSchema.array().optional(),
    notIn: RunStatusSchema.array().optional(),
    not: z
      .union([
        RunStatusSchema,
        z.lazy(() => NestedEnumRunStatusFilterObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const NestedEnumRunStatusFilterObjectSchema = Schema;
