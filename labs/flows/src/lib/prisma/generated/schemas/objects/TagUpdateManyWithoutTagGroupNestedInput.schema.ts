import { z } from 'zod';
import { TagCreateWithoutTagGroupInputObjectSchema } from './TagCreateWithoutTagGroupInput.schema';
import { TagUncheckedCreateWithoutTagGroupInputObjectSchema } from './TagUncheckedCreateWithoutTagGroupInput.schema';
import { TagCreateOrConnectWithoutTagGroupInputObjectSchema } from './TagCreateOrConnectWithoutTagGroupInput.schema';
import { TagUpsertWithWhereUniqueWithoutTagGroupInputObjectSchema } from './TagUpsertWithWhereUniqueWithoutTagGroupInput.schema';
import { TagCreateManyTagGroupInputEnvelopeObjectSchema } from './TagCreateManyTagGroupInputEnvelope.schema';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';
import { TagUpdateWithWhereUniqueWithoutTagGroupInputObjectSchema } from './TagUpdateWithWhereUniqueWithoutTagGroupInput.schema';
import { TagUpdateManyWithWhereWithoutTagGroupInputObjectSchema } from './TagUpdateManyWithWhereWithoutTagGroupInput.schema';
import { TagScalarWhereInputObjectSchema } from './TagScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => TagCreateWithoutTagGroupInputObjectSchema),
        z.lazy(() => TagCreateWithoutTagGroupInputObjectSchema).array(),
        z.lazy(() => TagUncheckedCreateWithoutTagGroupInputObjectSchema),
        z
          .lazy(() => TagUncheckedCreateWithoutTagGroupInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => TagCreateOrConnectWithoutTagGroupInputObjectSchema),
        z
          .lazy(() => TagCreateOrConnectWithoutTagGroupInputObjectSchema)
          .array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => TagUpsertWithWhereUniqueWithoutTagGroupInputObjectSchema),
        z
          .lazy(() => TagUpsertWithWhereUniqueWithoutTagGroupInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => TagCreateManyTagGroupInputEnvelopeObjectSchema)
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
        z.lazy(() => TagUpdateWithWhereUniqueWithoutTagGroupInputObjectSchema),
        z
          .lazy(() => TagUpdateWithWhereUniqueWithoutTagGroupInputObjectSchema)
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => TagUpdateManyWithWhereWithoutTagGroupInputObjectSchema),
        z
          .lazy(() => TagUpdateManyWithWhereWithoutTagGroupInputObjectSchema)
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

export const TagUpdateManyWithoutTagGroupNestedInputObjectSchema = Schema;
