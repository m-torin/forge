import { z } from 'zod';
import { FlowSelectObjectSchema } from './FlowSelect.schema';
import { FlowIncludeObjectSchema } from './FlowInclude.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => FlowSelectObjectSchema).optional(),
    include: z.lazy(() => FlowIncludeObjectSchema).optional(),
  })
  .strict();

export const FlowArgsObjectSchema = Schema;
