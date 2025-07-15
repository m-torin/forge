import { z } from 'zod';
import { SecretCreateWithoutFlowInputObjectSchema } from './SecretCreateWithoutFlowInput.schema';
import { SecretUncheckedCreateWithoutFlowInputObjectSchema } from './SecretUncheckedCreateWithoutFlowInput.schema';
import { SecretCreateOrConnectWithoutFlowInputObjectSchema } from './SecretCreateOrConnectWithoutFlowInput.schema';
import { SecretUpsertWithWhereUniqueWithoutFlowInputObjectSchema } from './SecretUpsertWithWhereUniqueWithoutFlowInput.schema';
import { SecretCreateManyFlowInputEnvelopeObjectSchema } from './SecretCreateManyFlowInputEnvelope.schema';
import { SecretWhereUniqueInputObjectSchema } from './SecretWhereUniqueInput.schema';
import { SecretUpdateWithWhereUniqueWithoutFlowInputObjectSchema } from './SecretUpdateWithWhereUniqueWithoutFlowInput.schema';
import { SecretUpdateManyWithWhereWithoutFlowInputObjectSchema } from './SecretUpdateManyWithWhereWithoutFlowInput.schema';
import { SecretScalarWhereInputObjectSchema } from './SecretScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => SecretCreateWithoutFlowInputObjectSchema),
        z.lazy(() => SecretCreateWithoutFlowInputObjectSchema).array(),
        z.lazy(() => SecretUncheckedCreateWithoutFlowInputObjectSchema),
        z.lazy(() => SecretUncheckedCreateWithoutFlowInputObjectSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => SecretCreateOrConnectWithoutFlowInputObjectSchema),
        z.lazy(() => SecretCreateOrConnectWithoutFlowInputObjectSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => SecretUpsertWithWhereUniqueWithoutFlowInputObjectSchema),
        z
          .lazy(() => SecretUpsertWithWhereUniqueWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => SecretCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    set: z
      .union([
        z.lazy(() => SecretWhereUniqueInputObjectSchema),
        z.lazy(() => SecretWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => SecretWhereUniqueInputObjectSchema),
        z.lazy(() => SecretWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => SecretWhereUniqueInputObjectSchema),
        z.lazy(() => SecretWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => SecretWhereUniqueInputObjectSchema),
        z.lazy(() => SecretWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => SecretUpdateWithWhereUniqueWithoutFlowInputObjectSchema),
        z
          .lazy(() => SecretUpdateWithWhereUniqueWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => SecretUpdateManyWithWhereWithoutFlowInputObjectSchema),
        z
          .lazy(() => SecretUpdateManyWithWhereWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => SecretScalarWhereInputObjectSchema),
        z.lazy(() => SecretScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const SecretUpdateManyWithoutFlowNestedInputObjectSchema = Schema;
