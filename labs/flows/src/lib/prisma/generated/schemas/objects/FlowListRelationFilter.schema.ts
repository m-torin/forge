import { z } from 'zod';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    every: z.lazy(() => FlowWhereInputObjectSchema).optional(),
    some: z.lazy(() => FlowWhereInputObjectSchema).optional(),
    none: z.lazy(() => FlowWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowListRelationFilterObjectSchema = Schema;
