import { z } from 'zod';
import { FlowCreateWithoutInstanceInputObjectSchema } from './FlowCreateWithoutInstanceInput.schema';
import { FlowUncheckedCreateWithoutInstanceInputObjectSchema } from './FlowUncheckedCreateWithoutInstanceInput.schema';
import { FlowCreateOrConnectWithoutInstanceInputObjectSchema } from './FlowCreateOrConnectWithoutInstanceInput.schema';
import { FlowUpsertWithWhereUniqueWithoutInstanceInputObjectSchema } from './FlowUpsertWithWhereUniqueWithoutInstanceInput.schema';
import { FlowCreateManyInstanceInputEnvelopeObjectSchema } from './FlowCreateManyInstanceInputEnvelope.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowUpdateWithWhereUniqueWithoutInstanceInputObjectSchema } from './FlowUpdateWithWhereUniqueWithoutInstanceInput.schema';
import { FlowUpdateManyWithWhereWithoutInstanceInputObjectSchema } from './FlowUpdateManyWithWhereWithoutInstanceInput.schema';
import { FlowScalarWhereInputObjectSchema } from './FlowScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowCreateWithoutInstanceInputObjectSchema),
        z.lazy(() => FlowCreateWithoutInstanceInputObjectSchema).array(),
        z.lazy(() => FlowUncheckedCreateWithoutInstanceInputObjectSchema),
        z
          .lazy(() => FlowUncheckedCreateWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => FlowCreateOrConnectWithoutInstanceInputObjectSchema),
        z
          .lazy(() => FlowCreateOrConnectWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => FlowUpsertWithWhereUniqueWithoutInstanceInputObjectSchema),
        z
          .lazy(() => FlowUpsertWithWhereUniqueWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => FlowCreateManyInstanceInputEnvelopeObjectSchema)
      .optional(),
    set: z
      .union([
        z.lazy(() => FlowWhereUniqueInputObjectSchema),
        z.lazy(() => FlowWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => FlowWhereUniqueInputObjectSchema),
        z.lazy(() => FlowWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => FlowWhereUniqueInputObjectSchema),
        z.lazy(() => FlowWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => FlowWhereUniqueInputObjectSchema),
        z.lazy(() => FlowWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => FlowUpdateWithWhereUniqueWithoutInstanceInputObjectSchema),
        z
          .lazy(() => FlowUpdateWithWhereUniqueWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => FlowUpdateManyWithWhereWithoutInstanceInputObjectSchema),
        z
          .lazy(() => FlowUpdateManyWithWhereWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => FlowScalarWhereInputObjectSchema),
        z.lazy(() => FlowScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const FlowUpdateManyWithoutInstanceNestedInputObjectSchema = Schema;
