import { z } from 'zod';
import { FlowUpdateWithoutFlowEventsInputObjectSchema } from './FlowUpdateWithoutFlowEventsInput.schema';
import { FlowUncheckedUpdateWithoutFlowEventsInputObjectSchema } from './FlowUncheckedUpdateWithoutFlowEventsInput.schema';
import { FlowCreateWithoutFlowEventsInputObjectSchema } from './FlowCreateWithoutFlowEventsInput.schema';
import { FlowUncheckedCreateWithoutFlowEventsInputObjectSchema } from './FlowUncheckedCreateWithoutFlowEventsInput.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => FlowUpdateWithoutFlowEventsInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutFlowEventsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowCreateWithoutFlowEventsInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutFlowEventsInputObjectSchema),
    ]),
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowUpsertWithoutFlowEventsInputObjectSchema = Schema;
