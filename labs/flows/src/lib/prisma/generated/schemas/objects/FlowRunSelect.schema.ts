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
    flowId: z.boolean().optional(),
    id: z.boolean().optional(),
    isScheduled: z.boolean().optional(),
    payload: z.boolean().optional(),
    metadata: z.boolean().optional(),
    runStatus: z.boolean().optional(),
    scheduledJob: z
      .union([z.boolean(), z.lazy(() => ScheduledJobArgsObjectSchema)])
      .optional(),
    scheduledJobId: z.boolean().optional(),
    startedBy: z.boolean().optional(),
    timeEnded: z.boolean().optional(),
    timeStarted: z.boolean().optional(),
    _count: z
      .union([
        z.boolean(),
        z.lazy(() => FlowRunCountOutputTypeArgsObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowRunSelectObjectSchema = Schema;
