import { z } from 'zod';
import { TagGroupWhereInputObjectSchema } from './TagGroupWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    every: z.lazy(() => TagGroupWhereInputObjectSchema).optional(),
    some: z.lazy(() => TagGroupWhereInputObjectSchema).optional(),
    none: z.lazy(() => TagGroupWhereInputObjectSchema).optional(),
  })
  .strict();

export const TagGroupListRelationFilterObjectSchema = Schema;
