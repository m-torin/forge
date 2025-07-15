import { z } from 'zod';
import { FlowRunCreateWithoutFlowEventsInputObjectSchema } from './FlowRunCreateWithoutFlowEventsInput.schema';
import { FlowRunUncheckedCreateWithoutFlowEventsInputObjectSchema } from './FlowRunUncheckedCreateWithoutFlowEventsInput.schema';
import { FlowRunCreateOrConnectWithoutFlowEventsInputObjectSchema } from './FlowRunCreateOrConnectWithoutFlowEventsInput.schema';
import { FlowRunWhereUniqueInputObjectSchema } from './FlowRunWhereUniqueInput.schema';

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
    connect: z.lazy(() => FlowRunWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const FlowRunCreateNestedOneWithoutFlowEventsInputObjectSchema = Schema;
