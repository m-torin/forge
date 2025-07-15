import { z } from 'zod';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    is: z.lazy(() => FlowWhereInputObjectSchema).optional(),
    isNot: z.lazy(() => FlowWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowScalarRelationFilterObjectSchema = Schema;
