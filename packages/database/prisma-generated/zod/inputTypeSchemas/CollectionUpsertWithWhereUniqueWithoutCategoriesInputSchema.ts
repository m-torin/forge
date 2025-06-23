import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutCategoriesInputSchema } from './CollectionUpdateWithoutCategoriesInputSchema';
import { CollectionUncheckedUpdateWithoutCategoriesInputSchema } from './CollectionUncheckedUpdateWithoutCategoriesInputSchema';
import { CollectionCreateWithoutCategoriesInputSchema } from './CollectionCreateWithoutCategoriesInputSchema';
import { CollectionUncheckedCreateWithoutCategoriesInputSchema } from './CollectionUncheckedCreateWithoutCategoriesInputSchema';

export const CollectionUpsertWithWhereUniqueWithoutCategoriesInputSchema: z.ZodType<Prisma.CollectionUpsertWithWhereUniqueWithoutCategoriesInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => CollectionUpdateWithoutCategoriesInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutCategoriesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => CollectionCreateWithoutCategoriesInputSchema),
        z.lazy(() => CollectionUncheckedCreateWithoutCategoriesInputSchema),
      ]),
    })
    .strict();

export default CollectionUpsertWithWhereUniqueWithoutCategoriesInputSchema;
