import { z } from 'zod';
import { FlowRunUpdateWithoutFlowEventsInputObjectSchema } from './FlowRunUpdateWithoutFlowEventsInput.schema';
import { FlowRunUncheckedUpdateWithoutFlowEventsInputObjectSchema } from './FlowRunUncheckedUpdateWithoutFlowEventsInput.schema';
import { FlowRunCreateWithoutFlowEventsInputObjectSchema } from './FlowRunCreateWithoutFlowEventsInput.schema';
import { FlowRunUncheckedCreateWithoutFlowEventsInputObjectSchema } from './FlowRunUncheckedCreateWithoutFlowEventsInput.schema';
import { FlowRunWhereInputObjectSchema } from './FlowRunWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => FlowRunUpdateWithoutFlowEventsInputObjectSchema),
      z.lazy(() => FlowRunUncheckedUpdateWithoutFlowEventsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowRunCreateWithoutFlowEventsInputObjectSchema),
      z.lazy(() => FlowRunUncheckedCreateWithoutFlowEventsInputObjectSchema),
    ]),
    where: z.lazy(() => FlowRunWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowRunUpsertWithoutFlowEventsInputObjectSchema = Schema;
