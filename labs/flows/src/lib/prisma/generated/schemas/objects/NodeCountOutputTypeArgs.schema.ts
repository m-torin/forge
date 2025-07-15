import { z } from 'zod';
import { NodeCountOutputTypeSelectObjectSchema } from './NodeCountOutputTypeSelect.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => NodeCountOutputTypeSelectObjectSchema).optional(),
  })
  .strict();

export const NodeCountOutputTypeArgsObjectSchema = Schema;
