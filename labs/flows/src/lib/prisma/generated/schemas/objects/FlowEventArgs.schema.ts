import { z } from 'zod';
import { FlowEventSelectObjectSchema } from './FlowEventSelect.schema';
import { FlowEventIncludeObjectSchema } from './FlowEventInclude.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => FlowEventSelectObjectSchema).optional(),
    include: z.lazy(() => FlowEventIncludeObjectSchema).optional(),
  })
  .strict();

export const FlowEventArgsObjectSchema = Schema;
