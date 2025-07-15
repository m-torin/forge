import { z } from 'zod';
import { InfraTypeSchema } from '../enums/InfraType.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: InfraTypeSchema.optional(),
    in: InfraTypeSchema.array().optional(),
    notIn: InfraTypeSchema.array().optional(),
    not: z
      .union([
        InfraTypeSchema,
        z.lazy(() => NestedEnumInfraTypeFilterObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const NestedEnumInfraTypeFilterObjectSchema = Schema;
