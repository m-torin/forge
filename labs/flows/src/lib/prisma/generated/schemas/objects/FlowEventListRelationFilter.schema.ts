import { z } from 'zod';
import { FlowEventWhereInputObjectSchema } from './FlowEventWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    every: z.lazy(() => FlowEventWhereInputObjectSchema).optional(),
    some: z.lazy(() => FlowEventWhereInputObjectSchema).optional(),
    none: z.lazy(() => FlowEventWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowEventListRelationFilterObjectSchema = Schema;
