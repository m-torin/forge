import { z } from 'zod';
import { FlowEventCreateWithoutFlowInputObjectSchema } from './FlowEventCreateWithoutFlowInput.schema';
import { FlowEventUncheckedCreateWithoutFlowInputObjectSchema } from './FlowEventUncheckedCreateWithoutFlowInput.schema';
import { FlowEventCreateOrConnectWithoutFlowInputObjectSchema } from './FlowEventCreateOrConnectWithoutFlowInput.schema';
import { FlowEventUpsertWithWhereUniqueWithoutFlowInputObjectSchema } from './FlowEventUpsertWithWhereUniqueWithoutFlowInput.schema';
import { FlowEventCreateManyFlowInputEnvelopeObjectSchema } from './FlowEventCreateManyFlowInputEnvelope.schema';
import { FlowEventWhereUniqueInputObjectSchema } from './FlowEventWhereUniqueInput.schema';
import { FlowEventUpdateWithWhereUniqueWithoutFlowInputObjectSchema } from './FlowEventUpdateWithWhereUniqueWithoutFlowInput.schema';
import { FlowEventUpdateManyWithWhereWithoutFlowInputObjectSchema } from './FlowEventUpdateManyWithWhereWithoutFlowInput.schema';
import { FlowEventScalarWhereInputObjectSchema } from './FlowEventScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowEventCreateWithoutFlowInputObjectSchema),
        z.lazy(() => FlowEventCreateWithoutFlowInputObjectSchema).array(),
        z.lazy(() => FlowEventUncheckedCreateWithoutFlowInputObjectSchema),
        z
          .lazy(() => FlowEventUncheckedCreateWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => FlowEventCreateOrConnectWithoutFlowInputObjectSchema),
        z
          .lazy(() => FlowEventCreateOrConnectWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(
          () => FlowEventUpsertWithWhereUniqueWithoutFlowInputObjectSchema,
        ),
        z
          .lazy(
            () => FlowEventUpsertWithWhereUniqueWithoutFlowInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => FlowEventCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    set: z
      .union([
        z.lazy(() => FlowEventWhereUniqueInputObjectSchema),
        z.lazy(() => FlowEventWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => FlowEventWhereUniqueInputObjectSchema),
        z.lazy(() => FlowEventWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => FlowEventWhereUniqueInputObjectSchema),
        z.lazy(() => FlowEventWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => FlowEventWhereUniqueInputObjectSchema),
        z.lazy(() => FlowEventWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(
          () => FlowEventUpdateWithWhereUniqueWithoutFlowInputObjectSchema,
        ),
        z
          .lazy(
            () => FlowEventUpdateWithWhereUniqueWithoutFlowInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => FlowEventUpdateManyWithWhereWithoutFlowInputObjectSchema),
        z
          .lazy(() => FlowEventUpdateManyWithWhereWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => FlowEventScalarWhereInputObjectSchema),
        z.lazy(() => FlowEventScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const FlowEventUncheckedUpdateManyWithoutFlowNestedInputObjectSchema =
  Schema;
