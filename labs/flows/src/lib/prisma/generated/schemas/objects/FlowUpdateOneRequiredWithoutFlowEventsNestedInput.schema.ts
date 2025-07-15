import { z } from 'zod';
import { FlowCreateWithoutFlowEventsInputObjectSchema } from './FlowCreateWithoutFlowEventsInput.schema';
import { FlowUncheckedCreateWithoutFlowEventsInputObjectSchema } from './FlowUncheckedCreateWithoutFlowEventsInput.schema';
import { FlowCreateOrConnectWithoutFlowEventsInputObjectSchema } from './FlowCreateOrConnectWithoutFlowEventsInput.schema';
import { FlowUpsertWithoutFlowEventsInputObjectSchema } from './FlowUpsertWithoutFlowEventsInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowUpdateToOneWithWhereWithoutFlowEventsInputObjectSchema } from './FlowUpdateToOneWithWhereWithoutFlowEventsInput.schema';
import { FlowUpdateWithoutFlowEventsInputObjectSchema } from './FlowUpdateWithoutFlowEventsInput.schema';
import { FlowUncheckedUpdateWithoutFlowEventsInputObjectSchema } from './FlowUncheckedUpdateWithoutFlowEventsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowCreateWithoutFlowEventsInputObjectSchema),
        z.lazy(() => FlowUncheckedCreateWithoutFlowEventsInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => FlowCreateOrConnectWithoutFlowEventsInputObjectSchema)
      .optional(),
    upsert: z
      .lazy(() => FlowUpsertWithoutFlowEventsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(
          () => FlowUpdateToOneWithWhereWithoutFlowEventsInputObjectSchema,
        ),
        z.lazy(() => FlowUpdateWithoutFlowEventsInputObjectSchema),
        z.lazy(() => FlowUncheckedUpdateWithoutFlowEventsInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowUpdateOneRequiredWithoutFlowEventsNestedInputObjectSchema =
  Schema;
