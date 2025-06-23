import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutCollectionsInputSchema } from './BrandCreateWithoutCollectionsInputSchema';
import { BrandUncheckedCreateWithoutCollectionsInputSchema } from './BrandUncheckedCreateWithoutCollectionsInputSchema';
import { BrandCreateOrConnectWithoutCollectionsInputSchema } from './BrandCreateOrConnectWithoutCollectionsInputSchema';
import { BrandUpsertWithWhereUniqueWithoutCollectionsInputSchema } from './BrandUpsertWithWhereUniqueWithoutCollectionsInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithWhereUniqueWithoutCollectionsInputSchema } from './BrandUpdateWithWhereUniqueWithoutCollectionsInputSchema';
import { BrandUpdateManyWithWhereWithoutCollectionsInputSchema } from './BrandUpdateManyWithWhereWithoutCollectionsInputSchema';
import { BrandScalarWhereInputSchema } from './BrandScalarWhereInputSchema';

export const BrandUpdateManyWithoutCollectionsNestedInputSchema: z.ZodType<Prisma.BrandUpdateManyWithoutCollectionsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => BrandCreateWithoutCollectionsInputSchema),
          z.lazy(() => BrandCreateWithoutCollectionsInputSchema).array(),
          z.lazy(() => BrandUncheckedCreateWithoutCollectionsInputSchema),
          z.lazy(() => BrandUncheckedCreateWithoutCollectionsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => BrandCreateOrConnectWithoutCollectionsInputSchema),
          z.lazy(() => BrandCreateOrConnectWithoutCollectionsInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => BrandUpsertWithWhereUniqueWithoutCollectionsInputSchema),
          z.lazy(() => BrandUpsertWithWhereUniqueWithoutCollectionsInputSchema).array(),
        ])
        .optional(),
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
          z.lazy(() => BrandUpdateWithWhereUniqueWithoutCollectionsInputSchema),
          z.lazy(() => BrandUpdateWithWhereUniqueWithoutCollectionsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => BrandUpdateManyWithWhereWithoutCollectionsInputSchema),
          z.lazy(() => BrandUpdateManyWithWhereWithoutCollectionsInputSchema).array(),
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

export default BrandUpdateManyWithoutCollectionsNestedInputSchema;
