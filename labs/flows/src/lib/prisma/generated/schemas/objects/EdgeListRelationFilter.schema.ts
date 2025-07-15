import { z } from 'zod';
import { EdgeWhereInputObjectSchema } from './EdgeWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    every: z.lazy(() => EdgeWhereInputObjectSchema).optional(),
    some: z.lazy(() => EdgeWhereInputObjectSchema).optional(),
    none: z.lazy(() => EdgeWhereInputObjectSchema).optional(),
  })
  .strict();

export const EdgeListRelationFilterObjectSchema = Schema;
