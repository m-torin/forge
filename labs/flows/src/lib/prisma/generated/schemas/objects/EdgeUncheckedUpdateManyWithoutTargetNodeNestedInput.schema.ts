import { z } from 'zod';
import { EdgeCreateWithoutTargetNodeInputObjectSchema } from './EdgeCreateWithoutTargetNodeInput.schema';
import { EdgeUncheckedCreateWithoutTargetNodeInputObjectSchema } from './EdgeUncheckedCreateWithoutTargetNodeInput.schema';
import { EdgeCreateOrConnectWithoutTargetNodeInputObjectSchema } from './EdgeCreateOrConnectWithoutTargetNodeInput.schema';
import { EdgeUpsertWithWhereUniqueWithoutTargetNodeInputObjectSchema } from './EdgeUpsertWithWhereUniqueWithoutTargetNodeInput.schema';
import { EdgeCreateManyTargetNodeInputEnvelopeObjectSchema } from './EdgeCreateManyTargetNodeInputEnvelope.schema';
import { EdgeWhereUniqueInputObjectSchema } from './EdgeWhereUniqueInput.schema';
import { EdgeUpdateWithWhereUniqueWithoutTargetNodeInputObjectSchema } from './EdgeUpdateWithWhereUniqueWithoutTargetNodeInput.schema';
import { EdgeUpdateManyWithWhereWithoutTargetNodeInputObjectSchema } from './EdgeUpdateManyWithWhereWithoutTargetNodeInput.schema';
import { EdgeScalarWhereInputObjectSchema } from './EdgeScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => EdgeCreateWithoutTargetNodeInputObjectSchema),
        z.lazy(() => EdgeCreateWithoutTargetNodeInputObjectSchema).array(),
        z.lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputObjectSchema),
        z
          .lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => EdgeCreateOrConnectWithoutTargetNodeInputObjectSchema),
        z
          .lazy(() => EdgeCreateOrConnectWithoutTargetNodeInputObjectSchema)
          .array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(
          () => EdgeUpsertWithWhereUniqueWithoutTargetNodeInputObjectSchema,
        ),
        z
          .lazy(
            () => EdgeUpsertWithWhereUniqueWithoutTargetNodeInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => EdgeCreateManyTargetNodeInputEnvelopeObjectSchema)
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
          () => EdgeUpdateWithWhereUniqueWithoutTargetNodeInputObjectSchema,
        ),
        z
          .lazy(
            () => EdgeUpdateWithWhereUniqueWithoutTargetNodeInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => EdgeUpdateManyWithWhereWithoutTargetNodeInputObjectSchema),
        z
          .lazy(() => EdgeUpdateManyWithWhereWithoutTargetNodeInputObjectSchema)
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

export const EdgeUncheckedUpdateManyWithoutTargetNodeNestedInputObjectSchema =
  Schema;
