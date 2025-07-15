import { z } from 'zod';
import { FlowRunCreateWithoutFlowInputObjectSchema } from './FlowRunCreateWithoutFlowInput.schema';
import { FlowRunUncheckedCreateWithoutFlowInputObjectSchema } from './FlowRunUncheckedCreateWithoutFlowInput.schema';
import { FlowRunCreateOrConnectWithoutFlowInputObjectSchema } from './FlowRunCreateOrConnectWithoutFlowInput.schema';
import { FlowRunUpsertWithWhereUniqueWithoutFlowInputObjectSchema } from './FlowRunUpsertWithWhereUniqueWithoutFlowInput.schema';
import { FlowRunCreateManyFlowInputEnvelopeObjectSchema } from './FlowRunCreateManyFlowInputEnvelope.schema';
import { FlowRunWhereUniqueInputObjectSchema } from './FlowRunWhereUniqueInput.schema';
import { FlowRunUpdateWithWhereUniqueWithoutFlowInputObjectSchema } from './FlowRunUpdateWithWhereUniqueWithoutFlowInput.schema';
import { FlowRunUpdateManyWithWhereWithoutFlowInputObjectSchema } from './FlowRunUpdateManyWithWhereWithoutFlowInput.schema';
import { FlowRunScalarWhereInputObjectSchema } from './FlowRunScalarWhereInput.schema';

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
    upsert: z
      .union([
        z.lazy(() => FlowRunUpsertWithWhereUniqueWithoutFlowInputObjectSchema),
        z
          .lazy(() => FlowRunUpsertWithWhereUniqueWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => FlowRunCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    set: z
      .union([
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
        z.lazy(() => FlowRunWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => FlowRunUpdateWithWhereUniqueWithoutFlowInputObjectSchema),
        z
          .lazy(() => FlowRunUpdateWithWhereUniqueWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => FlowRunUpdateManyWithWhereWithoutFlowInputObjectSchema),
        z
          .lazy(() => FlowRunUpdateManyWithWhereWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => FlowRunScalarWhereInputObjectSchema),
        z.lazy(() => FlowRunScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const FlowRunUncheckedUpdateManyWithoutFlowNestedInputObjectSchema =
  Schema;
