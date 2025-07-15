import { z } from 'zod';
import { TagCreateWithoutFlowInputObjectSchema } from './TagCreateWithoutFlowInput.schema';
import { TagUncheckedCreateWithoutFlowInputObjectSchema } from './TagUncheckedCreateWithoutFlowInput.schema';
import { TagCreateOrConnectWithoutFlowInputObjectSchema } from './TagCreateOrConnectWithoutFlowInput.schema';
import { TagUpsertWithWhereUniqueWithoutFlowInputObjectSchema } from './TagUpsertWithWhereUniqueWithoutFlowInput.schema';
import { TagCreateManyFlowInputEnvelopeObjectSchema } from './TagCreateManyFlowInputEnvelope.schema';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';
import { TagUpdateWithWhereUniqueWithoutFlowInputObjectSchema } from './TagUpdateWithWhereUniqueWithoutFlowInput.schema';
import { TagUpdateManyWithWhereWithoutFlowInputObjectSchema } from './TagUpdateManyWithWhereWithoutFlowInput.schema';
import { TagScalarWhereInputObjectSchema } from './TagScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => TagCreateWithoutFlowInputObjectSchema),
        z.lazy(() => TagCreateWithoutFlowInputObjectSchema).array(),
        z.lazy(() => TagUncheckedCreateWithoutFlowInputObjectSchema),
        z.lazy(() => TagUncheckedCreateWithoutFlowInputObjectSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => TagCreateOrConnectWithoutFlowInputObjectSchema),
        z.lazy(() => TagCreateOrConnectWithoutFlowInputObjectSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => TagUpsertWithWhereUniqueWithoutFlowInputObjectSchema),
        z
          .lazy(() => TagUpsertWithWhereUniqueWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => TagCreateManyFlowInputEnvelopeObjectSchema)
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
        z.lazy(() => TagUpdateWithWhereUniqueWithoutFlowInputObjectSchema),
        z
          .lazy(() => TagUpdateWithWhereUniqueWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => TagUpdateManyWithWhereWithoutFlowInputObjectSchema),
        z
          .lazy(() => TagUpdateManyWithWhereWithoutFlowInputObjectSchema)
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

export const TagUpdateManyWithoutFlowNestedInputObjectSchema = Schema;
