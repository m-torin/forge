import { z } from 'zod';
import { MantineColorSchema } from '../enums/MantineColor.schema';
import { NestedEnumMantineColorFilterObjectSchema } from './NestedEnumMantineColorFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: MantineColorSchema.optional(),
    in: MantineColorSchema.array().optional(),
    notIn: MantineColorSchema.array().optional(),
    not: z
      .union([
        MantineColorSchema,
        z.lazy(() => NestedEnumMantineColorFilterObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const EnumMantineColorFilterObjectSchema = Schema;
