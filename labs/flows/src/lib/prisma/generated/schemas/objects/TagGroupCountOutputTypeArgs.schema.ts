import { z } from 'zod';
import { TagGroupCountOutputTypeSelectObjectSchema } from './TagGroupCountOutputTypeSelect.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => TagGroupCountOutputTypeSelectObjectSchema).optional(),
  })
  .strict();

export const TagGroupCountOutputTypeArgsObjectSchema = Schema;
