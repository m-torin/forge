import { z } from 'zod';
import { FlowRunWhereUniqueInputObjectSchema } from './FlowRunWhereUniqueInput.schema';
import { FlowRunUpdateWithoutFlowInputObjectSchema } from './FlowRunUpdateWithoutFlowInput.schema';
import { FlowRunUncheckedUpdateWithoutFlowInputObjectSchema } from './FlowRunUncheckedUpdateWithoutFlowInput.schema';
import { FlowRunCreateWithoutFlowInputObjectSchema } from './FlowRunCreateWithoutFlowInput.schema';
import { FlowRunUncheckedCreateWithoutFlowInputObjectSchema } from './FlowRunUncheckedCreateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => FlowRunUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => FlowRunUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowRunCreateWithoutFlowInputObjectSchema),
      z.lazy(() => FlowRunUncheckedCreateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const FlowRunUpsertWithWhereUniqueWithoutFlowInputObjectSchema = Schema;
