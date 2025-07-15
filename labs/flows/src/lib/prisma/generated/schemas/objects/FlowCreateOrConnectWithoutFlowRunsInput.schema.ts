import { z } from 'zod';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowCreateWithoutFlowRunsInputObjectSchema } from './FlowCreateWithoutFlowRunsInput.schema';
import { FlowUncheckedCreateWithoutFlowRunsInputObjectSchema } from './FlowUncheckedCreateWithoutFlowRunsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => FlowCreateWithoutFlowRunsInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutFlowRunsInputObjectSchema),
    ]),
  })
  .strict();

export const FlowCreateOrConnectWithoutFlowRunsInputObjectSchema = Schema;
