import { z } from 'zod';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { FlowUpdateWithoutFlowEventsInputObjectSchema } from './FlowUpdateWithoutFlowEventsInput.schema';
import { FlowUncheckedUpdateWithoutFlowEventsInputObjectSchema } from './FlowUncheckedUpdateWithoutFlowEventsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => FlowUpdateWithoutFlowEventsInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutFlowEventsInputObjectSchema),
    ]),
  })
  .strict();

export const FlowUpdateToOneWithWhereWithoutFlowEventsInputObjectSchema =
  Schema;
