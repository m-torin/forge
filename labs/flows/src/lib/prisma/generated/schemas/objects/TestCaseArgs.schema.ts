import { z } from 'zod';
import { TestCaseSelectObjectSchema } from './TestCaseSelect.schema';
import { TestCaseIncludeObjectSchema } from './TestCaseInclude.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => TestCaseSelectObjectSchema).optional(),
    include: z.lazy(() => TestCaseIncludeObjectSchema).optional(),
  })
  .strict();

export const TestCaseArgsObjectSchema = Schema;
