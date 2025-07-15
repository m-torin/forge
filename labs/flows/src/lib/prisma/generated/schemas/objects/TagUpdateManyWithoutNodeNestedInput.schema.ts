import { z } from 'zod';
import { TagCreateWithoutNodeInputObjectSchema } from './TagCreateWithoutNodeInput.schema';
import { TagUncheckedCreateWithoutNodeInputObjectSchema } from './TagUncheckedCreateWithoutNodeInput.schema';
import { TagCreateOrConnectWithoutNodeInputObjectSchema } from './TagCreateOrConnectWithoutNodeInput.schema';
import { TagUpsertWithWhereUniqueWithoutNodeInputObjectSchema } from './TagUpsertWithWhereUniqueWithoutNodeInput.schema';
import { TagCreateManyNodeInputEnvelopeObjectSchema } from './TagCreateManyNodeInputEnvelope.schema';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';
import { TagUpdateWithWhereUniqueWithoutNodeInputObjectSchema } from './TagUpdateWithWhereUniqueWithoutNodeInput.schema';
import { TagUpdateManyWithWhereWithoutNodeInputObjectSchema } from './TagUpdateManyWithWhereWithoutNodeInput.schema';
import { TagScalarWhereInputObjectSchema } from './TagScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => TagCreateWithoutNodeInputObjectSchema),
        z.lazy(() => TagCreateWithoutNodeInputObjectSchema).array(),
        z.lazy(() => TagUncheckedCreateWithoutNodeInputObjectSchema),
        z.lazy(() => TagUncheckedCreateWithoutNodeInputObjectSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => TagCreateOrConnectWithoutNodeInputObjectSchema),
        z.lazy(() => TagCreateOrConnectWithoutNodeInputObjectSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => TagUpsertWithWhereUniqueWithoutNodeInputObjectSchema),
        z
          .lazy(() => TagUpsertWithWhereUniqueWithoutNodeInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => TagCreateManyNodeInputEnvelopeObjectSchema)
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
        z.lazy(() => TagUpdateWithWhereUniqueWithoutNodeInputObjectSchema),
        z
          .lazy(() => TagUpdateWithWhereUniqueWithoutNodeInputObjectSchema)
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => TagUpdateManyWithWhereWithoutNodeInputObjectSchema),
        z
          .lazy(() => TagUpdateManyWithWhereWithoutNodeInputObjectSchema)
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

export const TagUpdateManyWithoutNodeNestedInputObjectSchema = Schema;
