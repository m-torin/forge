import { z } from 'zod';
import { FlowCreateWithoutFlowRunsInputObjectSchema } from './FlowCreateWithoutFlowRunsInput.schema';
import { FlowUncheckedCreateWithoutFlowRunsInputObjectSchema } from './FlowUncheckedCreateWithoutFlowRunsInput.schema';
import { FlowCreateOrConnectWithoutFlowRunsInputObjectSchema } from './FlowCreateOrConnectWithoutFlowRunsInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowCreateWithoutFlowRunsInputObjectSchema),
        z.lazy(() => FlowUncheckedCreateWithoutFlowRunsInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => FlowCreateOrConnectWithoutFlowRunsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const FlowCreateNestedOneWithoutFlowRunsInputObjectSchema = Schema;
