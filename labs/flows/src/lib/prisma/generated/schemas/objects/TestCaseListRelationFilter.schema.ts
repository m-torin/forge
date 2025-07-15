import { z } from 'zod';
import { TestCaseWhereInputObjectSchema } from './TestCaseWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    every: z.lazy(() => TestCaseWhereInputObjectSchema).optional(),
    some: z.lazy(() => TestCaseWhereInputObjectSchema).optional(),
    none: z.lazy(() => TestCaseWhereInputObjectSchema).optional(),
  })
  .strict();

export const TestCaseListRelationFilterObjectSchema = Schema;
