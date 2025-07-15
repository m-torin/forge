import { z } from 'zod';
import { TagSelectObjectSchema } from './TagSelect.schema';
import { TagIncludeObjectSchema } from './TagInclude.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => TagSelectObjectSchema).optional(),
    include: z.lazy(() => TagIncludeObjectSchema).optional(),
  })
  .strict();

export const TagArgsObjectSchema = Schema;
