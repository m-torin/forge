import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: z.coerce.date().optional().nullable(),
    in: z.coerce.date().array().optional().nullable(),
    notIn: z.coerce.date().array().optional().nullable(),
    lt: z.coerce.date().optional(),
    lte: z.coerce.date().optional(),
    gt: z.coerce.date().optional(),
    gte: z.coerce.date().optional(),
    not: z
      .union([
        z.coerce.date(),
        z.lazy(() => NestedDateTimeNullableFilterObjectSchema),
      ])
      .optional()
      .nullable(),
  })
  .strict();

export const NestedDateTimeNullableFilterObjectSchema = Schema;
