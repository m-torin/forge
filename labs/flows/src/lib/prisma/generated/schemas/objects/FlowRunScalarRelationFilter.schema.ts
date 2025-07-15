import { z } from 'zod';
import { FlowRunWhereInputObjectSchema } from './FlowRunWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    is: z.lazy(() => FlowRunWhereInputObjectSchema).optional(),
    isNot: z.lazy(() => FlowRunWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowRunScalarRelationFilterObjectSchema = Schema;
