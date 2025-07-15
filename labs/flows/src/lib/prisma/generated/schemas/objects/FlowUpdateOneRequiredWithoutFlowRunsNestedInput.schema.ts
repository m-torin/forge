import { z } from 'zod';
import { FlowCreateWithoutFlowRunsInputObjectSchema } from './FlowCreateWithoutFlowRunsInput.schema';
import { FlowUncheckedCreateWithoutFlowRunsInputObjectSchema } from './FlowUncheckedCreateWithoutFlowRunsInput.schema';
import { FlowCreateOrConnectWithoutFlowRunsInputObjectSchema } from './FlowCreateOrConnectWithoutFlowRunsInput.schema';
import { FlowUpsertWithoutFlowRunsInputObjectSchema } from './FlowUpsertWithoutFlowRunsInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowUpdateToOneWithWhereWithoutFlowRunsInputObjectSchema } from './FlowUpdateToOneWithWhereWithoutFlowRunsInput.schema';
import { FlowUpdateWithoutFlowRunsInputObjectSchema } from './FlowUpdateWithoutFlowRunsInput.schema';
import { FlowUncheckedUpdateWithoutFlowRunsInputObjectSchema } from './FlowUncheckedUpdateWithoutFlowRunsInput.schema';

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
    upsert: z.lazy(() => FlowUpsertWithoutFlowRunsInputObjectSchema).optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(() => FlowUpdateToOneWithWhereWithoutFlowRunsInputObjectSchema),
        z.lazy(() => FlowUpdateWithoutFlowRunsInputObjectSchema),
        z.lazy(() => FlowUncheckedUpdateWithoutFlowRunsInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowUpdateOneRequiredWithoutFlowRunsNestedInputObjectSchema =
  Schema;
