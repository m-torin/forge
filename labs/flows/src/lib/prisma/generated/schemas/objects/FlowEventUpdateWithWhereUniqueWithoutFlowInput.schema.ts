import { z } from 'zod';
import { FlowEventWhereUniqueInputObjectSchema } from './FlowEventWhereUniqueInput.schema';
import { FlowEventUpdateWithoutFlowInputObjectSchema } from './FlowEventUpdateWithoutFlowInput.schema';
import { FlowEventUncheckedUpdateWithoutFlowInputObjectSchema } from './FlowEventUncheckedUpdateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowEventWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => FlowEventUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => FlowEventUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const FlowEventUpdateWithWhereUniqueWithoutFlowInputObjectSchema =
  Schema;
