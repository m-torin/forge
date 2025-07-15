import { z } from 'zod';
import { TagGroupWhereInputObjectSchema } from './TagGroupWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    is: z
      .lazy(() => TagGroupWhereInputObjectSchema)
      .optional()
      .nullable(),
    isNot: z
      .lazy(() => TagGroupWhereInputObjectSchema)
      .optional()
      .nullable(),
  })
  .strict();

export const TagGroupNullableScalarRelationFilterObjectSchema = Schema;
