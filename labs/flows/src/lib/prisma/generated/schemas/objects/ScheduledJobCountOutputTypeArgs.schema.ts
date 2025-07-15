import { z } from 'zod';
import { ScheduledJobCountOutputTypeSelectObjectSchema } from './ScheduledJobCountOutputTypeSelect.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z
      .lazy(() => ScheduledJobCountOutputTypeSelectObjectSchema)
      .optional(),
  })
  .strict();

export const ScheduledJobCountOutputTypeArgsObjectSchema = Schema;
