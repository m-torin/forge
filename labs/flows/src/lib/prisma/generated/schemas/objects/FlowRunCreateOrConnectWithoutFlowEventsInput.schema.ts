import { z } from 'zod';
import { FlowRunWhereUniqueInputObjectSchema } from './FlowRunWhereUniqueInput.schema';
import { FlowRunCreateWithoutFlowEventsInputObjectSchema } from './FlowRunCreateWithoutFlowEventsInput.schema';
import { FlowRunUncheckedCreateWithoutFlowEventsInputObjectSchema } from './FlowRunUncheckedCreateWithoutFlowEventsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => FlowRunCreateWithoutFlowEventsInputObjectSchema),
      z.lazy(() => FlowRunUncheckedCreateWithoutFlowEventsInputObjectSchema),
    ]),
  })
  .strict();

export const FlowRunCreateOrConnectWithoutFlowEventsInputObjectSchema = Schema;
