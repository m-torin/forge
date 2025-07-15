import { z } from 'zod';
import { FlowEventWhereUniqueInputObjectSchema } from './FlowEventWhereUniqueInput.schema';
import { FlowEventUpdateWithoutFlowRunInputObjectSchema } from './FlowEventUpdateWithoutFlowRunInput.schema';
import { FlowEventUncheckedUpdateWithoutFlowRunInputObjectSchema } from './FlowEventUncheckedUpdateWithoutFlowRunInput.schema';
import { FlowEventCreateWithoutFlowRunInputObjectSchema } from './FlowEventCreateWithoutFlowRunInput.schema';
import { FlowEventUncheckedCreateWithoutFlowRunInputObjectSchema } from './FlowEventUncheckedCreateWithoutFlowRunInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowEventWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => FlowEventUpdateWithoutFlowRunInputObjectSchema),
      z.lazy(() => FlowEventUncheckedUpdateWithoutFlowRunInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowEventCreateWithoutFlowRunInputObjectSchema),
      z.lazy(() => FlowEventUncheckedCreateWithoutFlowRunInputObjectSchema),
    ]),
  })
  .strict();

export const FlowEventUpsertWithWhereUniqueWithoutFlowRunInputObjectSchema =
  Schema;
