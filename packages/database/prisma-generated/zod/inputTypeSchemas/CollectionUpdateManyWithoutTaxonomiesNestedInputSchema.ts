import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutTaxonomiesInputSchema } from './CollectionCreateWithoutTaxonomiesInputSchema';
import { CollectionUncheckedCreateWithoutTaxonomiesInputSchema } from './CollectionUncheckedCreateWithoutTaxonomiesInputSchema';
import { CollectionCreateOrConnectWithoutTaxonomiesInputSchema } from './CollectionCreateOrConnectWithoutTaxonomiesInputSchema';
import { CollectionUpsertWithWhereUniqueWithoutTaxonomiesInputSchema } from './CollectionUpsertWithWhereUniqueWithoutTaxonomiesInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithWhereUniqueWithoutTaxonomiesInputSchema } from './CollectionUpdateWithWhereUniqueWithoutTaxonomiesInputSchema';
import { CollectionUpdateManyWithWhereWithoutTaxonomiesInputSchema } from './CollectionUpdateManyWithWhereWithoutTaxonomiesInputSchema';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';

export const CollectionUpdateManyWithoutTaxonomiesNestedInputSchema: z.ZodType<Prisma.CollectionUpdateManyWithoutTaxonomiesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CollectionCreateWithoutTaxonomiesInputSchema),
          z.lazy(() => CollectionCreateWithoutTaxonomiesInputSchema).array(),
          z.lazy(() => CollectionUncheckedCreateWithoutTaxonomiesInputSchema),
          z.lazy(() => CollectionUncheckedCreateWithoutTaxonomiesInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => CollectionCreateOrConnectWithoutTaxonomiesInputSchema),
          z.lazy(() => CollectionCreateOrConnectWithoutTaxonomiesInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => CollectionUpsertWithWhereUniqueWithoutTaxonomiesInputSchema),
          z.lazy(() => CollectionUpsertWithWhereUniqueWithoutTaxonomiesInputSchema).array(),
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
          z.lazy(() => CollectionUpdateWithWhereUniqueWithoutTaxonomiesInputSchema),
          z.lazy(() => CollectionUpdateWithWhereUniqueWithoutTaxonomiesInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => CollectionUpdateManyWithWhereWithoutTaxonomiesInputSchema),
          z.lazy(() => CollectionUpdateManyWithWhereWithoutTaxonomiesInputSchema).array(),
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

export default CollectionUpdateManyWithoutTaxonomiesNestedInputSchema;
