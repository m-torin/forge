import { z } from 'zod';
import { FlowEventWhereUniqueInputObjectSchema } from './FlowEventWhereUniqueInput.schema';
import { FlowEventUpdateWithoutFlowInputObjectSchema } from './FlowEventUpdateWithoutFlowInput.schema';
import { FlowEventUncheckedUpdateWithoutFlowInputObjectSchema } from './FlowEventUncheckedUpdateWithoutFlowInput.schema';
import { FlowEventCreateWithoutFlowInputObjectSchema } from './FlowEventCreateWithoutFlowInput.schema';
import { FlowEventUncheckedCreateWithoutFlowInputObjectSchema } from './FlowEventUncheckedCreateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowEventWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => FlowEventUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => FlowEventUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowEventCreateWithoutFlowInputObjectSchema),
      z.lazy(() => FlowEventUncheckedCreateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const FlowEventUpsertWithWhereUniqueWithoutFlowInputObjectSchema =
  Schema;
