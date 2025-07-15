import { z } from 'zod';
import { FlowRunCreateWithoutFlowInputObjectSchema } from './FlowRunCreateWithoutFlowInput.schema';
import { FlowRunUncheckedCreateWithoutFlowInputObjectSchema } from './FlowRunUncheckedCreateWithoutFlowInput.schema';
import { FlowRunCreateOrConnectWithoutFlowInputObjectSchema } from './FlowRunCreateOrConnectWithoutFlowInput.schema';
import { FlowRunCreateManyFlowInputEnvelopeObjectSchema } from './FlowRunCreateManyFlowInputEnvelope.schema';
import { FlowRunWhereUniqueInputObjectSchema } from './FlowRunWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowRunCreateWithoutFlowInputObjectSchema),
        z.lazy(() => FlowRunCreateWithoutFlowInputObjectSchema).array(),
        z.lazy(() => FlowRunUncheckedCreateWithoutFlowInputObjectSchema),
        z
          .lazy(() => FlowRunUncheckedCreateWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => FlowRunCreateOrConnectWithoutFlowInputObjectSchema),
        z
          .lazy(() => FlowRunCreateOrConnectWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => FlowRunCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const FlowRunUncheckedCreateNestedManyWithoutFlowInputObjectSchema =
  Schema;
