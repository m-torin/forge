import { z } from 'zod';
import { FlowEventCreateWithoutFlowRunInputObjectSchema } from './FlowEventCreateWithoutFlowRunInput.schema';
import { FlowEventUncheckedCreateWithoutFlowRunInputObjectSchema } from './FlowEventUncheckedCreateWithoutFlowRunInput.schema';
import { FlowEventCreateOrConnectWithoutFlowRunInputObjectSchema } from './FlowEventCreateOrConnectWithoutFlowRunInput.schema';
import { FlowEventUpsertWithWhereUniqueWithoutFlowRunInputObjectSchema } from './FlowEventUpsertWithWhereUniqueWithoutFlowRunInput.schema';
import { FlowEventCreateManyFlowRunInputEnvelopeObjectSchema } from './FlowEventCreateManyFlowRunInputEnvelope.schema';
import { FlowEventWhereUniqueInputObjectSchema } from './FlowEventWhereUniqueInput.schema';
import { FlowEventUpdateWithWhereUniqueWithoutFlowRunInputObjectSchema } from './FlowEventUpdateWithWhereUniqueWithoutFlowRunInput.schema';
import { FlowEventUpdateManyWithWhereWithoutFlowRunInputObjectSchema } from './FlowEventUpdateManyWithWhereWithoutFlowRunInput.schema';
import { FlowEventScalarWhereInputObjectSchema } from './FlowEventScalarWhereInput.schema';

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
    upsert: z
      .union([
        z.lazy(
          () => FlowEventUpsertWithWhereUniqueWithoutFlowRunInputObjectSchema,
        ),
        z
          .lazy(
            () => FlowEventUpsertWithWhereUniqueWithoutFlowRunInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => FlowEventCreateManyFlowRunInputEnvelopeObjectSchema)
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
          () => FlowEventUpdateWithWhereUniqueWithoutFlowRunInputObjectSchema,
        ),
        z
          .lazy(
            () => FlowEventUpdateWithWhereUniqueWithoutFlowRunInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(
          () => FlowEventUpdateManyWithWhereWithoutFlowRunInputObjectSchema,
        ),
        z
          .lazy(
            () => FlowEventUpdateManyWithWhereWithoutFlowRunInputObjectSchema,
          )
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

export const FlowEventUpdateManyWithoutFlowRunNestedInputObjectSchema = Schema;
