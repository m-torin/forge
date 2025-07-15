import { z } from 'zod';
import { EdgeSelectObjectSchema } from './EdgeSelect.schema';
import { EdgeIncludeObjectSchema } from './EdgeInclude.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => EdgeSelectObjectSchema).optional(),
    include: z.lazy(() => EdgeIncludeObjectSchema).optional(),
  })
  .strict();

export const EdgeArgsObjectSchema = Schema;
