import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutDeletedByInputSchema } from './BrandCreateWithoutDeletedByInputSchema';
import { BrandUncheckedCreateWithoutDeletedByInputSchema } from './BrandUncheckedCreateWithoutDeletedByInputSchema';
import { BrandCreateOrConnectWithoutDeletedByInputSchema } from './BrandCreateOrConnectWithoutDeletedByInputSchema';
import { BrandUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './BrandUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { BrandCreateManyDeletedByInputEnvelopeSchema } from './BrandCreateManyDeletedByInputEnvelopeSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './BrandUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { BrandUpdateManyWithWhereWithoutDeletedByInputSchema } from './BrandUpdateManyWithWhereWithoutDeletedByInputSchema';
import { BrandScalarWhereInputSchema } from './BrandScalarWhereInputSchema';

export const BrandUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.BrandUpdateManyWithoutDeletedByNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => BrandCreateWithoutDeletedByInputSchema),
          z.lazy(() => BrandCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => BrandUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => BrandUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => BrandCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => BrandCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => BrandUpsertWithWhereUniqueWithoutDeletedByInputSchema),
          z.lazy(() => BrandUpsertWithWhereUniqueWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => BrandCreateManyDeletedByInputEnvelopeSchema).optional(),
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
          z.lazy(() => BrandUpdateWithWhereUniqueWithoutDeletedByInputSchema),
          z.lazy(() => BrandUpdateWithWhereUniqueWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => BrandUpdateManyWithWhereWithoutDeletedByInputSchema),
          z.lazy(() => BrandUpdateManyWithWhereWithoutDeletedByInputSchema).array(),
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

export default BrandUpdateManyWithoutDeletedByNestedInputSchema;
