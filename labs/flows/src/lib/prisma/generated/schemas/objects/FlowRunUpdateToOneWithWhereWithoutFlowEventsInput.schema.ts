import { z } from 'zod';
import { FlowRunWhereInputObjectSchema } from './FlowRunWhereInput.schema';
import { FlowRunUpdateWithoutFlowEventsInputObjectSchema } from './FlowRunUpdateWithoutFlowEventsInput.schema';
import { FlowRunUncheckedUpdateWithoutFlowEventsInputObjectSchema } from './FlowRunUncheckedUpdateWithoutFlowEventsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowRunWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => FlowRunUpdateWithoutFlowEventsInputObjectSchema),
      z.lazy(() => FlowRunUncheckedUpdateWithoutFlowEventsInputObjectSchema),
    ]),
  })
  .strict();

export const FlowRunUpdateToOneWithWhereWithoutFlowEventsInputObjectSchema =
  Schema;
