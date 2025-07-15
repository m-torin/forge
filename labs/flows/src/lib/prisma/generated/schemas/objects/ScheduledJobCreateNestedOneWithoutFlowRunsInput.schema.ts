import { z } from 'zod';
import { ScheduledJobCreateWithoutFlowRunsInputObjectSchema } from './ScheduledJobCreateWithoutFlowRunsInput.schema';
import { ScheduledJobUncheckedCreateWithoutFlowRunsInputObjectSchema } from './ScheduledJobUncheckedCreateWithoutFlowRunsInput.schema';
import { ScheduledJobCreateOrConnectWithoutFlowRunsInputObjectSchema } from './ScheduledJobCreateOrConnectWithoutFlowRunsInput.schema';
import { ScheduledJobWhereUniqueInputObjectSchema } from './ScheduledJobWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => ScheduledJobCreateWithoutFlowRunsInputObjectSchema),
        z.lazy(
          () => ScheduledJobUncheckedCreateWithoutFlowRunsInputObjectSchema,
        ),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => ScheduledJobCreateOrConnectWithoutFlowRunsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => ScheduledJobWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const ScheduledJobCreateNestedOneWithoutFlowRunsInputObjectSchema =
  Schema;
