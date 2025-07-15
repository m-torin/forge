import { z } from 'zod';
import { FlowRunFindManySchema } from '../findManyFlowRun.schema';
import { ScheduledJobCountOutputTypeArgsObjectSchema } from './ScheduledJobCountOutputTypeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flowRuns: z
      .union([z.boolean(), z.lazy(() => FlowRunFindManySchema)])
      .optional(),
    _count: z
      .union([
        z.boolean(),
        z.lazy(() => ScheduledJobCountOutputTypeArgsObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const ScheduledJobIncludeObjectSchema = Schema;
