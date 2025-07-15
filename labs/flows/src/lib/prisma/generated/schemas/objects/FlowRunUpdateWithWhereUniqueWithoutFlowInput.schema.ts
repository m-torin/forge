import { z } from 'zod';
import { FlowRunWhereUniqueInputObjectSchema } from './FlowRunWhereUniqueInput.schema';
import { FlowRunUpdateWithoutFlowInputObjectSchema } from './FlowRunUpdateWithoutFlowInput.schema';
import { FlowRunUncheckedUpdateWithoutFlowInputObjectSchema } from './FlowRunUncheckedUpdateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => FlowRunUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => FlowRunUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const FlowRunUpdateWithWhereUniqueWithoutFlowInputObjectSchema = Schema;
