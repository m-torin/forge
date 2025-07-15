import { z } from 'zod';
import { FlowEventCreateWithoutFlowRunInputObjectSchema } from './FlowEventCreateWithoutFlowRunInput.schema';
import { FlowEventUncheckedCreateWithoutFlowRunInputObjectSchema } from './FlowEventUncheckedCreateWithoutFlowRunInput.schema';
import { FlowEventCreateOrConnectWithoutFlowRunInputObjectSchema } from './FlowEventCreateOrConnectWithoutFlowRunInput.schema';
import { FlowEventCreateManyFlowRunInputEnvelopeObjectSchema } from './FlowEventCreateManyFlowRunInputEnvelope.schema';
import { FlowEventWhereUniqueInputObjectSchema } from './FlowEventWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowEventCreateWithoutFlowRunInputObjectSchema),
        z.lazy(() => FlowEventCreateWithoutFlowRunInputObjectSchema).array(),
        z.lazy(() => FlowEventUncheckedCreateWithoutFlowRunInputObjectSchema),
        z
          .lazy(() => FlowEventUncheckedCreateWithoutFlowRunInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => FlowEventCreateOrConnectWithoutFlowRunInputObjectSchema),
        z
          .lazy(() => FlowEventCreateOrConnectWithoutFlowRunInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => FlowEventCreateManyFlowRunInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => FlowEventWhereUniqueInputObjectSchema),
        z.lazy(() => FlowEventWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const FlowEventCreateNestedManyWithoutFlowRunInputObjectSchema = Schema;
