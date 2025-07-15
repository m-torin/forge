import { z } from 'zod';
import { TagGroupSelectObjectSchema } from './TagGroupSelect.schema';
import { TagGroupIncludeObjectSchema } from './TagGroupInclude.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => TagGroupSelectObjectSchema).optional(),
    include: z.lazy(() => TagGroupIncludeObjectSchema).optional(),
  })
  .strict();

export const TagGroupArgsObjectSchema = Schema;
