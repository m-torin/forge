import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flowRuns: z.boolean().optional(),
  })
  .strict();

export const ScheduledJobCountOutputTypeSelectObjectSchema = Schema;
