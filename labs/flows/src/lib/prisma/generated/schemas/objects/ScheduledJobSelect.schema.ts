import { z } from 'zod';
import { FlowRunFindManySchema } from '../findManyFlowRun.schema';
import { ScheduledJobCountOutputTypeArgsObjectSchema } from './ScheduledJobCountOutputTypeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.boolean().optional(),
    createdBy: z.boolean().optional(),
    endpoint: z.boolean().optional(),
    frequency: z.boolean().optional(),
    flowRuns: z
      .union([z.boolean(), z.lazy(() => FlowRunFindManySchema)])
      .optional(),
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    deleted: z.boolean().optional(),
    _count: z
      .union([
        z.boolean(),
        z.lazy(() => ScheduledJobCountOutputTypeArgsObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const ScheduledJobSelectObjectSchema = Schema;
