import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutParentInputSchema } from './BrandCreateWithoutParentInputSchema';
import { BrandUncheckedCreateWithoutParentInputSchema } from './BrandUncheckedCreateWithoutParentInputSchema';
import { BrandCreateOrConnectWithoutParentInputSchema } from './BrandCreateOrConnectWithoutParentInputSchema';
import { BrandUpsertWithWhereUniqueWithoutParentInputSchema } from './BrandUpsertWithWhereUniqueWithoutParentInputSchema';
import { BrandCreateManyParentInputEnvelopeSchema } from './BrandCreateManyParentInputEnvelopeSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithWhereUniqueWithoutParentInputSchema } from './BrandUpdateWithWhereUniqueWithoutParentInputSchema';
import { BrandUpdateManyWithWhereWithoutParentInputSchema } from './BrandUpdateManyWithWhereWithoutParentInputSchema';
import { BrandScalarWhereInputSchema } from './BrandScalarWhereInputSchema';

export const BrandUpdateManyWithoutParentNestedInputSchema: z.ZodType<Prisma.BrandUpdateManyWithoutParentNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => BrandCreateWithoutParentInputSchema),
          z.lazy(() => BrandCreateWithoutParentInputSchema).array(),
          z.lazy(() => BrandUncheckedCreateWithoutParentInputSchema),
          z.lazy(() => BrandUncheckedCreateWithoutParentInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => BrandCreateOrConnectWithoutParentInputSchema),
          z.lazy(() => BrandCreateOrConnectWithoutParentInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => BrandUpsertWithWhereUniqueWithoutParentInputSchema),
          z.lazy(() => BrandUpsertWithWhereUniqueWithoutParentInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => BrandCreateManyParentInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => BrandWhereUniqueInputSchema),
          z.lazy(() => BrandWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => BrandWhereUniqueInputSchema),
          z.lazy(() => BrandWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => BrandWhereUniqueInputSchema),
          z.lazy(() => BrandWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => BrandWhereUniqueInputSchema),
          z.lazy(() => BrandWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => BrandUpdateWithWhereUniqueWithoutParentInputSchema),
          z.lazy(() => BrandUpdateWithWhereUniqueWithoutParentInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => BrandUpdateManyWithWhereWithoutParentInputSchema),
          z.lazy(() => BrandUpdateManyWithWhereWithoutParentInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => BrandScalarWhereInputSchema),
          z.lazy(() => BrandScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default BrandUpdateManyWithoutParentNestedInputSchema;
