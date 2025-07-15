import { z } from 'zod';
import { FlowArgsObjectSchema } from './FlowArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flow: z.union([z.boolean(), z.lazy(() => FlowArgsObjectSchema)]).optional(),
  })
  .strict();

export const TestCaseIncludeObjectSchema = Schema;
