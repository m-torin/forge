import { z } from 'zod';
import { SecretCreateWithoutNodeInputObjectSchema } from './SecretCreateWithoutNodeInput.schema';
import { SecretUncheckedCreateWithoutNodeInputObjectSchema } from './SecretUncheckedCreateWithoutNodeInput.schema';
import { SecretCreateOrConnectWithoutNodeInputObjectSchema } from './SecretCreateOrConnectWithoutNodeInput.schema';
import { SecretUpsertWithWhereUniqueWithoutNodeInputObjectSchema } from './SecretUpsertWithWhereUniqueWithoutNodeInput.schema';
import { SecretCreateManyNodeInputEnvelopeObjectSchema } from './SecretCreateManyNodeInputEnvelope.schema';
import { SecretWhereUniqueInputObjectSchema } from './SecretWhereUniqueInput.schema';
import { SecretUpdateWithWhereUniqueWithoutNodeInputObjectSchema } from './SecretUpdateWithWhereUniqueWithoutNodeInput.schema';
import { SecretUpdateManyWithWhereWithoutNodeInputObjectSchema } from './SecretUpdateManyWithWhereWithoutNodeInput.schema';
import { SecretScalarWhereInputObjectSchema } from './SecretScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => SecretCreateWithoutNodeInputObjectSchema),
        z.lazy(() => SecretCreateWithoutNodeInputObjectSchema).array(),
        z.lazy(() => SecretUncheckedCreateWithoutNodeInputObjectSchema),
        z.lazy(() => SecretUncheckedCreateWithoutNodeInputObjectSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => SecretCreateOrConnectWithoutNodeInputObjectSchema),
        z.lazy(() => SecretCreateOrConnectWithoutNodeInputObjectSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => SecretUpsertWithWhereUniqueWithoutNodeInputObjectSchema),
        z
          .lazy(() => SecretUpsertWithWhereUniqueWithoutNodeInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => SecretCreateManyNodeInputEnvelopeObjectSchema)
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
        z.lazy(() => SecretUpdateWithWhereUniqueWithoutNodeInputObjectSchema),
        z
          .lazy(() => SecretUpdateWithWhereUniqueWithoutNodeInputObjectSchema)
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => SecretUpdateManyWithWhereWithoutNodeInputObjectSchema),
        z
          .lazy(() => SecretUpdateManyWithWhereWithoutNodeInputObjectSchema)
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

export const SecretUpdateManyWithoutNodeNestedInputObjectSchema = Schema;
