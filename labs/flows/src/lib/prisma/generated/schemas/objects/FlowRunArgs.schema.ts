import { z } from 'zod';
import { FlowRunSelectObjectSchema } from './FlowRunSelect.schema';
import { FlowRunIncludeObjectSchema } from './FlowRunInclude.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => FlowRunSelectObjectSchema).optional(),
    include: z.lazy(() => FlowRunIncludeObjectSchema).optional(),
  })
  .strict();

export const FlowRunArgsObjectSchema = Schema;
