import { z } from 'zod';
import { FlowRunCountOutputTypeSelectObjectSchema } from './FlowRunCountOutputTypeSelect.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => FlowRunCountOutputTypeSelectObjectSchema).optional(),
  })
  .strict();

export const FlowRunCountOutputTypeArgsObjectSchema = Schema;
