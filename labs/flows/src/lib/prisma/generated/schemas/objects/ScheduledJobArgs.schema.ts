import { z } from 'zod';
import { ScheduledJobSelectObjectSchema } from './ScheduledJobSelect.schema';
import { ScheduledJobIncludeObjectSchema } from './ScheduledJobInclude.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => ScheduledJobSelectObjectSchema).optional(),
    include: z.lazy(() => ScheduledJobIncludeObjectSchema).optional(),
  })
  .strict();

export const ScheduledJobArgsObjectSchema = Schema;
