import { z } from 'zod';
import { InstanceCreateWithoutUserInputObjectSchema } from './InstanceCreateWithoutUserInput.schema';
import { InstanceUncheckedCreateWithoutUserInputObjectSchema } from './InstanceUncheckedCreateWithoutUserInput.schema';
import { InstanceCreateOrConnectWithoutUserInputObjectSchema } from './InstanceCreateOrConnectWithoutUserInput.schema';
import { InstanceUpsertWithWhereUniqueWithoutUserInputObjectSchema } from './InstanceUpsertWithWhereUniqueWithoutUserInput.schema';
import { InstanceCreateManyUserInputEnvelopeObjectSchema } from './InstanceCreateManyUserInputEnvelope.schema';
import { InstanceWhereUniqueInputObjectSchema } from './InstanceWhereUniqueInput.schema';
import { InstanceUpdateWithWhereUniqueWithoutUserInputObjectSchema } from './InstanceUpdateWithWhereUniqueWithoutUserInput.schema';
import { InstanceUpdateManyWithWhereWithoutUserInputObjectSchema } from './InstanceUpdateManyWithWhereWithoutUserInput.schema';
import { InstanceScalarWhereInputObjectSchema } from './InstanceScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => InstanceCreateWithoutUserInputObjectSchema),
        z.lazy(() => InstanceCreateWithoutUserInputObjectSchema).array(),
        z.lazy(() => InstanceUncheckedCreateWithoutUserInputObjectSchema),
        z
          .lazy(() => InstanceUncheckedCreateWithoutUserInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => InstanceCreateOrConnectWithoutUserInputObjectSchema),
        z
          .lazy(() => InstanceCreateOrConnectWithoutUserInputObjectSchema)
          .array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => InstanceUpsertWithWhereUniqueWithoutUserInputObjectSchema),
        z
          .lazy(() => InstanceUpsertWithWhereUniqueWithoutUserInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => InstanceCreateManyUserInputEnvelopeObjectSchema)
      .optional(),
    set: z
      .union([
        z.lazy(() => InstanceWhereUniqueInputObjectSchema),
        z.lazy(() => InstanceWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => InstanceWhereUniqueInputObjectSchema),
        z.lazy(() => InstanceWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => InstanceWhereUniqueInputObjectSchema),
        z.lazy(() => InstanceWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => InstanceWhereUniqueInputObjectSchema),
        z.lazy(() => InstanceWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => InstanceUpdateWithWhereUniqueWithoutUserInputObjectSchema),
        z
          .lazy(() => InstanceUpdateWithWhereUniqueWithoutUserInputObjectSchema)
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => InstanceUpdateManyWithWhereWithoutUserInputObjectSchema),
        z
          .lazy(() => InstanceUpdateManyWithWhereWithoutUserInputObjectSchema)
          .array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => InstanceScalarWhereInputObjectSchema),
        z.lazy(() => InstanceScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const InstanceUpdateManyWithoutUserNestedInputObjectSchema = Schema;
