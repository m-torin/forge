import { z } from 'zod';
import { ScheduledJobWhereInputObjectSchema } from './ScheduledJobWhereInput.schema';
import { ScheduledJobUpdateWithoutFlowRunsInputObjectSchema } from './ScheduledJobUpdateWithoutFlowRunsInput.schema';
import { ScheduledJobUncheckedUpdateWithoutFlowRunsInputObjectSchema } from './ScheduledJobUncheckedUpdateWithoutFlowRunsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => ScheduledJobWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => ScheduledJobUpdateWithoutFlowRunsInputObjectSchema),
      z.lazy(() => ScheduledJobUncheckedUpdateWithoutFlowRunsInputObjectSchema),
    ]),
  })
  .strict();

export const ScheduledJobUpdateToOneWithWhereWithoutFlowRunsInputObjectSchema =
  Schema;
