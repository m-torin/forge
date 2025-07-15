import { z } from 'zod';
import { EdgeCreateWithoutSourceNodeInputObjectSchema } from './EdgeCreateWithoutSourceNodeInput.schema';
import { EdgeUncheckedCreateWithoutSourceNodeInputObjectSchema } from './EdgeUncheckedCreateWithoutSourceNodeInput.schema';
import { EdgeCreateOrConnectWithoutSourceNodeInputObjectSchema } from './EdgeCreateOrConnectWithoutSourceNodeInput.schema';
import { EdgeUpsertWithWhereUniqueWithoutSourceNodeInputObjectSchema } from './EdgeUpsertWithWhereUniqueWithoutSourceNodeInput.schema';
import { EdgeCreateManySourceNodeInputEnvelopeObjectSchema } from './EdgeCreateManySourceNodeInputEnvelope.schema';
import { EdgeWhereUniqueInputObjectSchema } from './EdgeWhereUniqueInput.schema';
import { EdgeUpdateWithWhereUniqueWithoutSourceNodeInputObjectSchema } from './EdgeUpdateWithWhereUniqueWithoutSourceNodeInput.schema';
import { EdgeUpdateManyWithWhereWithoutSourceNodeInputObjectSchema } from './EdgeUpdateManyWithWhereWithoutSourceNodeInput.schema';
import { EdgeScalarWhereInputObjectSchema } from './EdgeScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => EdgeCreateWithoutSourceNodeInputObjectSchema),
        z.lazy(() => EdgeCreateWithoutSourceNodeInputObjectSchema).array(),
        z.lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputObjectSchema),
        z
          .lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => EdgeCreateOrConnectWithoutSourceNodeInputObjectSchema),
        z
          .lazy(() => EdgeCreateOrConnectWithoutSourceNodeInputObjectSchema)
          .array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(
          () => EdgeUpsertWithWhereUniqueWithoutSourceNodeInputObjectSchema,
        ),
        z
          .lazy(
            () => EdgeUpsertWithWhereUniqueWithoutSourceNodeInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => EdgeCreateManySourceNodeInputEnvelopeObjectSchema)
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
        z.lazy(
          () => EdgeUpdateWithWhereUniqueWithoutSourceNodeInputObjectSchema,
        ),
        z
          .lazy(
            () => EdgeUpdateWithWhereUniqueWithoutSourceNodeInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => EdgeUpdateManyWithWhereWithoutSourceNodeInputObjectSchema),
        z
          .lazy(() => EdgeUpdateManyWithWhereWithoutSourceNodeInputObjectSchema)
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

export const EdgeUncheckedUpdateManyWithoutSourceNodeNestedInputObjectSchema =
  Schema;
