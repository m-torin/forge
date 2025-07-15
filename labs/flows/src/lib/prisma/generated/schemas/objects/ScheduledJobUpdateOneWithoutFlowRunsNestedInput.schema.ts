import { z } from 'zod';
import { ScheduledJobCreateWithoutFlowRunsInputObjectSchema } from './ScheduledJobCreateWithoutFlowRunsInput.schema';
import { ScheduledJobUncheckedCreateWithoutFlowRunsInputObjectSchema } from './ScheduledJobUncheckedCreateWithoutFlowRunsInput.schema';
import { ScheduledJobCreateOrConnectWithoutFlowRunsInputObjectSchema } from './ScheduledJobCreateOrConnectWithoutFlowRunsInput.schema';
import { ScheduledJobUpsertWithoutFlowRunsInputObjectSchema } from './ScheduledJobUpsertWithoutFlowRunsInput.schema';
import { ScheduledJobWhereInputObjectSchema } from './ScheduledJobWhereInput.schema';
import { ScheduledJobWhereUniqueInputObjectSchema } from './ScheduledJobWhereUniqueInput.schema';
import { ScheduledJobUpdateToOneWithWhereWithoutFlowRunsInputObjectSchema } from './ScheduledJobUpdateToOneWithWhereWithoutFlowRunsInput.schema';
import { ScheduledJobUpdateWithoutFlowRunsInputObjectSchema } from './ScheduledJobUpdateWithoutFlowRunsInput.schema';
import { ScheduledJobUncheckedUpdateWithoutFlowRunsInputObjectSchema } from './ScheduledJobUncheckedUpdateWithoutFlowRunsInput.schema';

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
    upsert: z
      .lazy(() => ScheduledJobUpsertWithoutFlowRunsInputObjectSchema)
      .optional(),
    disconnect: z
      .union([z.boolean(), z.lazy(() => ScheduledJobWhereInputObjectSchema)])
      .optional(),
    delete: z
      .union([z.boolean(), z.lazy(() => ScheduledJobWhereInputObjectSchema)])
      .optional(),
    connect: z.lazy(() => ScheduledJobWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(
          () =>
            ScheduledJobUpdateToOneWithWhereWithoutFlowRunsInputObjectSchema,
        ),
        z.lazy(() => ScheduledJobUpdateWithoutFlowRunsInputObjectSchema),
        z.lazy(
          () => ScheduledJobUncheckedUpdateWithoutFlowRunsInputObjectSchema,
        ),
      ])
      .optional(),
  })
  .strict();

export const ScheduledJobUpdateOneWithoutFlowRunsNestedInputObjectSchema =
  Schema;
