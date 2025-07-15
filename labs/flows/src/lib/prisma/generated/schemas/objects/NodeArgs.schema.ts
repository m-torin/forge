import { z } from 'zod';
import { NodeSelectObjectSchema } from './NodeSelect.schema';
import { NodeIncludeObjectSchema } from './NodeInclude.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => NodeSelectObjectSchema).optional(),
    include: z.lazy(() => NodeIncludeObjectSchema).optional(),
  })
  .strict();

export const NodeArgsObjectSchema = Schema;
