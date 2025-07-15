import { z } from 'zod';
import { TagGroupCreateWithoutInstanceInputObjectSchema } from './TagGroupCreateWithoutInstanceInput.schema';
import { TagGroupUncheckedCreateWithoutInstanceInputObjectSchema } from './TagGroupUncheckedCreateWithoutInstanceInput.schema';
import { TagGroupCreateOrConnectWithoutInstanceInputObjectSchema } from './TagGroupCreateOrConnectWithoutInstanceInput.schema';
import { TagGroupUpsertWithWhereUniqueWithoutInstanceInputObjectSchema } from './TagGroupUpsertWithWhereUniqueWithoutInstanceInput.schema';
import { TagGroupCreateManyInstanceInputEnvelopeObjectSchema } from './TagGroupCreateManyInstanceInputEnvelope.schema';
import { TagGroupWhereUniqueInputObjectSchema } from './TagGroupWhereUniqueInput.schema';
import { TagGroupUpdateWithWhereUniqueWithoutInstanceInputObjectSchema } from './TagGroupUpdateWithWhereUniqueWithoutInstanceInput.schema';
import { TagGroupUpdateManyWithWhereWithoutInstanceInputObjectSchema } from './TagGroupUpdateManyWithWhereWithoutInstanceInput.schema';
import { TagGroupScalarWhereInputObjectSchema } from './TagGroupScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => TagGroupCreateWithoutInstanceInputObjectSchema),
        z.lazy(() => TagGroupCreateWithoutInstanceInputObjectSchema).array(),
        z.lazy(() => TagGroupUncheckedCreateWithoutInstanceInputObjectSchema),
        z
          .lazy(() => TagGroupUncheckedCreateWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => TagGroupCreateOrConnectWithoutInstanceInputObjectSchema),
        z
          .lazy(() => TagGroupCreateOrConnectWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(
          () => TagGroupUpsertWithWhereUniqueWithoutInstanceInputObjectSchema,
        ),
        z
          .lazy(
            () => TagGroupUpsertWithWhereUniqueWithoutInstanceInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => TagGroupCreateManyInstanceInputEnvelopeObjectSchema)
      .optional(),
    set: z
      .union([
        z.lazy(() => TagGroupWhereUniqueInputObjectSchema),
        z.lazy(() => TagGroupWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => TagGroupWhereUniqueInputObjectSchema),
        z.lazy(() => TagGroupWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => TagGroupWhereUniqueInputObjectSchema),
        z.lazy(() => TagGroupWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => TagGroupWhereUniqueInputObjectSchema),
        z.lazy(() => TagGroupWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(
          () => TagGroupUpdateWithWhereUniqueWithoutInstanceInputObjectSchema,
        ),
        z
          .lazy(
            () => TagGroupUpdateWithWhereUniqueWithoutInstanceInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(
          () => TagGroupUpdateManyWithWhereWithoutInstanceInputObjectSchema,
        ),
        z
          .lazy(
            () => TagGroupUpdateManyWithWhereWithoutInstanceInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => TagGroupScalarWhereInputObjectSchema),
        z.lazy(() => TagGroupScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const TagGroupUncheckedUpdateManyWithoutInstanceNestedInputObjectSchema =
  Schema;
