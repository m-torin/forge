import { z } from 'zod';
import { TagCreateWithoutInstanceInputObjectSchema } from './TagCreateWithoutInstanceInput.schema';
import { TagUncheckedCreateWithoutInstanceInputObjectSchema } from './TagUncheckedCreateWithoutInstanceInput.schema';
import { TagCreateOrConnectWithoutInstanceInputObjectSchema } from './TagCreateOrConnectWithoutInstanceInput.schema';
import { TagUpsertWithWhereUniqueWithoutInstanceInputObjectSchema } from './TagUpsertWithWhereUniqueWithoutInstanceInput.schema';
import { TagCreateManyInstanceInputEnvelopeObjectSchema } from './TagCreateManyInstanceInputEnvelope.schema';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';
import { TagUpdateWithWhereUniqueWithoutInstanceInputObjectSchema } from './TagUpdateWithWhereUniqueWithoutInstanceInput.schema';
import { TagUpdateManyWithWhereWithoutInstanceInputObjectSchema } from './TagUpdateManyWithWhereWithoutInstanceInput.schema';
import { TagScalarWhereInputObjectSchema } from './TagScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => TagCreateWithoutInstanceInputObjectSchema),
        z.lazy(() => TagCreateWithoutInstanceInputObjectSchema).array(),
        z.lazy(() => TagUncheckedCreateWithoutInstanceInputObjectSchema),
        z
          .lazy(() => TagUncheckedCreateWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => TagCreateOrConnectWithoutInstanceInputObjectSchema),
        z
          .lazy(() => TagCreateOrConnectWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => TagUpsertWithWhereUniqueWithoutInstanceInputObjectSchema),
        z
          .lazy(() => TagUpsertWithWhereUniqueWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => TagCreateManyInstanceInputEnvelopeObjectSchema)
      .optional(),
    set: z
      .union([
        z.lazy(() => TagWhereUniqueInputObjectSchema),
        z.lazy(() => TagWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => TagWhereUniqueInputObjectSchema),
        z.lazy(() => TagWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => TagWhereUniqueInputObjectSchema),
        z.lazy(() => TagWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => TagWhereUniqueInputObjectSchema),
        z.lazy(() => TagWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => TagUpdateWithWhereUniqueWithoutInstanceInputObjectSchema),
        z
          .lazy(() => TagUpdateWithWhereUniqueWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => TagUpdateManyWithWhereWithoutInstanceInputObjectSchema),
        z
          .lazy(() => TagUpdateManyWithWhereWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => TagScalarWhereInputObjectSchema),
        z.lazy(() => TagScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const TagUpdateManyWithoutInstanceNestedInputObjectSchema = Schema;
