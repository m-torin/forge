import { z } from 'zod';
import { FlowUpdateWithoutFlowRunsInputObjectSchema } from './FlowUpdateWithoutFlowRunsInput.schema';
import { FlowUncheckedUpdateWithoutFlowRunsInputObjectSchema } from './FlowUncheckedUpdateWithoutFlowRunsInput.schema';
import { FlowCreateWithoutFlowRunsInputObjectSchema } from './FlowCreateWithoutFlowRunsInput.schema';
import { FlowUncheckedCreateWithoutFlowRunsInputObjectSchema } from './FlowUncheckedCreateWithoutFlowRunsInput.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => FlowUpdateWithoutFlowRunsInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutFlowRunsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowCreateWithoutFlowRunsInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutFlowRunsInputObjectSchema),
    ]),
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowUpsertWithoutFlowRunsInputObjectSchema = Schema;
