import { z } from 'zod';
import { InstanceCountOutputTypeSelectObjectSchema } from './InstanceCountOutputTypeSelect.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => InstanceCountOutputTypeSelectObjectSchema).optional(),
  })
  .strict();

export const InstanceCountOutputTypeArgsObjectSchema = Schema;
