import { z } from 'zod';
import { FlowRunWhereInputObjectSchema } from './FlowRunWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    every: z.lazy(() => FlowRunWhereInputObjectSchema).optional(),
    some: z.lazy(() => FlowRunWhereInputObjectSchema).optional(),
    none: z.lazy(() => FlowRunWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowRunListRelationFilterObjectSchema = Schema;
