import { z } from 'zod';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    every: z.lazy(() => NodeWhereInputObjectSchema).optional(),
    some: z.lazy(() => NodeWhereInputObjectSchema).optional(),
    none: z.lazy(() => NodeWhereInputObjectSchema).optional(),
  })
  .strict();

export const NodeListRelationFilterObjectSchema = Schema;
