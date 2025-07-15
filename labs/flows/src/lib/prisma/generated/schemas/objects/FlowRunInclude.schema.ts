import { z } from 'zod';
import { FlowArgsObjectSchema } from './FlowArgs.schema';
import { FlowEventFindManySchema } from '../findManyFlowEvent.schema';
import { ScheduledJobArgsObjectSchema } from './ScheduledJobArgs.schema';
import { FlowRunCountOutputTypeArgsObjectSchema } from './FlowRunCountOutputTypeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flow: z.union([z.boolean(), z.lazy(() => FlowArgsObjectSchema)]).optional(),
    flowEvents: z
      .union([z.boolean(), z.lazy(() => FlowEventFindManySchema)])
      .optional(),
    scheduledJob: z
      .union([z.boolean(), z.lazy(() => ScheduledJobArgsObjectSchema)])
      .optional(),
    _count: z
      .union([
        z.boolean(),
        z.lazy(() => FlowRunCountOutputTypeArgsObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowRunIncludeObjectSchema = Schema;
