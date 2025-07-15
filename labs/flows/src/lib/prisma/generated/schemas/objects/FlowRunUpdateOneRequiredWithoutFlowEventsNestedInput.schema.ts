import { z } from 'zod';
import { FlowRunCreateWithoutFlowEventsInputObjectSchema } from './FlowRunCreateWithoutFlowEventsInput.schema';
import { FlowRunUncheckedCreateWithoutFlowEventsInputObjectSchema } from './FlowRunUncheckedCreateWithoutFlowEventsInput.schema';
import { FlowRunCreateOrConnectWithoutFlowEventsInputObjectSchema } from './FlowRunCreateOrConnectWithoutFlowEventsInput.schema';
import { FlowRunUpsertWithoutFlowEventsInputObjectSchema } from './FlowRunUpsertWithoutFlowEventsInput.schema';
import { FlowRunWhereUniqueInputObjectSchema } from './FlowRunWhereUniqueInput.schema';
import { FlowRunUpdateToOneWithWhereWithoutFlowEventsInputObjectSchema } from './FlowRunUpdateToOneWithWhereWithoutFlowEventsInput.schema';
import { FlowRunUpdateWithoutFlowEventsInputObjectSchema } from './FlowRunUpdateWithoutFlowEventsInput.schema';
import { FlowRunUncheckedUpdateWithoutFlowEventsInputObjectSchema } from './FlowRunUncheckedUpdateWithoutFlowEventsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowRunCreateWithoutFlowEventsInputObjectSchema),
        z.lazy(() => FlowRunUncheckedCreateWithoutFlowEventsInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => FlowRunCreateOrConnectWithoutFlowEventsInputObjectSchema)
      .optional(),
    upsert: z
      .lazy(() => FlowRunUpsertWithoutFlowEventsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => FlowRunWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(
          () => FlowRunUpdateToOneWithWhereWithoutFlowEventsInputObjectSchema,
        ),
        z.lazy(() => FlowRunUpdateWithoutFlowEventsInputObjectSchema),
        z.lazy(() => FlowRunUncheckedUpdateWithoutFlowEventsInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowRunUpdateOneRequiredWithoutFlowEventsNestedInputObjectSchema =
  Schema;
