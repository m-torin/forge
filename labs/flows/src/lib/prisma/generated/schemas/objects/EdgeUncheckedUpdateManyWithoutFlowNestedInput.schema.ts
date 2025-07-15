import { z } from 'zod';
import { EdgeCreateWithoutFlowInputObjectSchema } from './EdgeCreateWithoutFlowInput.schema';
import { EdgeUncheckedCreateWithoutFlowInputObjectSchema } from './EdgeUncheckedCreateWithoutFlowInput.schema';
import { EdgeCreateOrConnectWithoutFlowInputObjectSchema } from './EdgeCreateOrConnectWithoutFlowInput.schema';
import { EdgeUpsertWithWhereUniqueWithoutFlowInputObjectSchema } from './EdgeUpsertWithWhereUniqueWithoutFlowInput.schema';
import { EdgeCreateManyFlowInputEnvelopeObjectSchema } from './EdgeCreateManyFlowInputEnvelope.schema';
import { EdgeWhereUniqueInputObjectSchema } from './EdgeWhereUniqueInput.schema';
import { EdgeUpdateWithWhereUniqueWithoutFlowInputObjectSchema } from './EdgeUpdateWithWhereUniqueWithoutFlowInput.schema';
import { EdgeUpdateManyWithWhereWithoutFlowInputObjectSchema } from './EdgeUpdateManyWithWhereWithoutFlowInput.schema';
import { EdgeScalarWhereInputObjectSchema } from './EdgeScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => EdgeCreateWithoutFlowInputObjectSchema),
        z.lazy(() => EdgeCreateWithoutFlowInputObjectSchema).array(),
        z.lazy(() => EdgeUncheckedCreateWithoutFlowInputObjectSchema),
        z.lazy(() => EdgeUncheckedCreateWithoutFlowInputObjectSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => EdgeCreateOrConnectWithoutFlowInputObjectSchema),
        z.lazy(() => EdgeCreateOrConnectWithoutFlowInputObjectSchema).array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(() => EdgeUpsertWithWhereUniqueWithoutFlowInputObjectSchema),
        z
          .lazy(() => EdgeUpsertWithWhereUniqueWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => EdgeCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    set: z
      .union([
        z.lazy(() => EdgeWhereUniqueInputObjectSchema),
        z.lazy(() => EdgeWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => EdgeWhereUniqueInputObjectSchema),
        z.lazy(() => EdgeWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => EdgeWhereUniqueInputObjectSchema),
        z.lazy(() => EdgeWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => EdgeWhereUniqueInputObjectSchema),
        z.lazy(() => EdgeWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => EdgeUpdateWithWhereUniqueWithoutFlowInputObjectSchema),
        z
          .lazy(() => EdgeUpdateWithWhereUniqueWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => EdgeUpdateManyWithWhereWithoutFlowInputObjectSchema),
        z
          .lazy(() => EdgeUpdateManyWithWhereWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => EdgeScalarWhereInputObjectSchema),
        z.lazy(() => EdgeScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const EdgeUncheckedUpdateManyWithoutFlowNestedInputObjectSchema = Schema;
