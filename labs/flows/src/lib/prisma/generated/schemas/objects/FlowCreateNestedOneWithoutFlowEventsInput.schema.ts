import { z } from 'zod';
import { FlowCreateWithoutFlowEventsInputObjectSchema } from './FlowCreateWithoutFlowEventsInput.schema';
import { FlowUncheckedCreateWithoutFlowEventsInputObjectSchema } from './FlowUncheckedCreateWithoutFlowEventsInput.schema';
import { FlowCreateOrConnectWithoutFlowEventsInputObjectSchema } from './FlowCreateOrConnectWithoutFlowEventsInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';

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
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const FlowCreateNestedOneWithoutFlowEventsInputObjectSchema = Schema;
