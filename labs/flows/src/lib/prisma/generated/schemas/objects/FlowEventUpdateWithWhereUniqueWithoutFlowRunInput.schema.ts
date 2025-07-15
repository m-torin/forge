import { z } from 'zod';
import { FlowEventWhereUniqueInputObjectSchema } from './FlowEventWhereUniqueInput.schema';
import { FlowEventUpdateWithoutFlowRunInputObjectSchema } from './FlowEventUpdateWithoutFlowRunInput.schema';
import { FlowEventUncheckedUpdateWithoutFlowRunInputObjectSchema } from './FlowEventUncheckedUpdateWithoutFlowRunInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowEventWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => FlowEventUpdateWithoutFlowRunInputObjectSchema),
      z.lazy(() => FlowEventUncheckedUpdateWithoutFlowRunInputObjectSchema),
    ]),
  })
  .strict();

export const FlowEventUpdateWithWhereUniqueWithoutFlowRunInputObjectSchema =
  Schema;
