import { z } from 'zod';
import { ScheduledJobWhereUniqueInputObjectSchema } from './ScheduledJobWhereUniqueInput.schema';
import { ScheduledJobCreateWithoutFlowRunsInputObjectSchema } from './ScheduledJobCreateWithoutFlowRunsInput.schema';
import { ScheduledJobUncheckedCreateWithoutFlowRunsInputObjectSchema } from './ScheduledJobUncheckedCreateWithoutFlowRunsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => ScheduledJobWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => ScheduledJobCreateWithoutFlowRunsInputObjectSchema),
      z.lazy(() => ScheduledJobUncheckedCreateWithoutFlowRunsInputObjectSchema),
    ]),
  })
  .strict();

export const ScheduledJobCreateOrConnectWithoutFlowRunsInputObjectSchema =
  Schema;
