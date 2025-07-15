import { z } from 'zod';
import { ScheduledJobUpdateWithoutFlowRunsInputObjectSchema } from './ScheduledJobUpdateWithoutFlowRunsInput.schema';
import { ScheduledJobUncheckedUpdateWithoutFlowRunsInputObjectSchema } from './ScheduledJobUncheckedUpdateWithoutFlowRunsInput.schema';
import { ScheduledJobCreateWithoutFlowRunsInputObjectSchema } from './ScheduledJobCreateWithoutFlowRunsInput.schema';
import { ScheduledJobUncheckedCreateWithoutFlowRunsInputObjectSchema } from './ScheduledJobUncheckedCreateWithoutFlowRunsInput.schema';
import { ScheduledJobWhereInputObjectSchema } from './ScheduledJobWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => ScheduledJobUpdateWithoutFlowRunsInputObjectSchema),
      z.lazy(() => ScheduledJobUncheckedUpdateWithoutFlowRunsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => ScheduledJobCreateWithoutFlowRunsInputObjectSchema),
      z.lazy(() => ScheduledJobUncheckedCreateWithoutFlowRunsInputObjectSchema),
    ]),
    where: z.lazy(() => ScheduledJobWhereInputObjectSchema).optional(),
  })
  .strict();

export const ScheduledJobUpsertWithoutFlowRunsInputObjectSchema = Schema;
