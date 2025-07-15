import { z } from 'zod';
import { FlowCountOutputTypeSelectObjectSchema } from './FlowCountOutputTypeSelect.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => FlowCountOutputTypeSelectObjectSchema).optional(),
  })
  .strict();

export const FlowCountOutputTypeArgsObjectSchema = Schema;
