import { z } from 'zod';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowCreateWithoutFlowEventsInputObjectSchema } from './FlowCreateWithoutFlowEventsInput.schema';
import { FlowUncheckedCreateWithoutFlowEventsInputObjectSchema } from './FlowUncheckedCreateWithoutFlowEventsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => FlowCreateWithoutFlowEventsInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutFlowEventsInputObjectSchema),
    ]),
  })
  .strict();

export const FlowCreateOrConnectWithoutFlowEventsInputObjectSchema = Schema;
