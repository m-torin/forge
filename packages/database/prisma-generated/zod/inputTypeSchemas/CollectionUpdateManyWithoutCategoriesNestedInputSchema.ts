import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutCategoriesInputSchema } from './CollectionCreateWithoutCategoriesInputSchema';
import { CollectionUncheckedCreateWithoutCategoriesInputSchema } from './CollectionUncheckedCreateWithoutCategoriesInputSchema';
import { CollectionCreateOrConnectWithoutCategoriesInputSchema } from './CollectionCreateOrConnectWithoutCategoriesInputSchema';
import { CollectionUpsertWithWhereUniqueWithoutCategoriesInputSchema } from './CollectionUpsertWithWhereUniqueWithoutCategoriesInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithWhereUniqueWithoutCategoriesInputSchema } from './CollectionUpdateWithWhereUniqueWithoutCategoriesInputSchema';
import { CollectionUpdateManyWithWhereWithoutCategoriesInputSchema } from './CollectionUpdateManyWithWhereWithoutCategoriesInputSchema';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';

export const CollectionUpdateManyWithoutCategoriesNestedInputSchema: z.ZodType<Prisma.CollectionUpdateManyWithoutCategoriesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CollectionCreateWithoutCategoriesInputSchema),
          z.lazy(() => CollectionCreateWithoutCategoriesInputSchema).array(),
          z.lazy(() => CollectionUncheckedCreateWithoutCategoriesInputSchema),
          z.lazy(() => CollectionUncheckedCreateWithoutCategoriesInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => CollectionCreateOrConnectWithoutCategoriesInputSchema),
          z.lazy(() => CollectionCreateOrConnectWithoutCategoriesInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => CollectionUpsertWithWhereUniqueWithoutCategoriesInputSchema),
          z.lazy(() => CollectionUpsertWithWhereUniqueWithoutCategoriesInputSchema).array(),
        ])
        .optional(),
      set: z
        .union([
          z.lazy(() => CollectionWhereUniqueInputSchema),
          z.lazy(() => CollectionWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => CollectionWhereUniqueInputSchema),
          z.lazy(() => CollectionWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => CollectionWhereUniqueInputSchema),
          z.lazy(() => CollectionWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => CollectionWhereUniqueInputSchema),
          z.lazy(() => CollectionWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => CollectionUpdateWithWhereUniqueWithoutCategoriesInputSchema),
          z.lazy(() => CollectionUpdateWithWhereUniqueWithoutCategoriesInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => CollectionUpdateManyWithWhereWithoutCategoriesInputSchema),
          z.lazy(() => CollectionUpdateManyWithWhereWithoutCategoriesInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => CollectionScalarWhereInputSchema),
          z.lazy(() => CollectionScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default CollectionUpdateManyWithoutCategoriesNestedInputSchema;
