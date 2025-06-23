import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutTaxonomiesInputSchema } from './CollectionUpdateWithoutTaxonomiesInputSchema';
import { CollectionUncheckedUpdateWithoutTaxonomiesInputSchema } from './CollectionUncheckedUpdateWithoutTaxonomiesInputSchema';
import { CollectionCreateWithoutTaxonomiesInputSchema } from './CollectionCreateWithoutTaxonomiesInputSchema';
import { CollectionUncheckedCreateWithoutTaxonomiesInputSchema } from './CollectionUncheckedCreateWithoutTaxonomiesInputSchema';

export const CollectionUpsertWithWhereUniqueWithoutTaxonomiesInputSchema: z.ZodType<Prisma.CollectionUpsertWithWhereUniqueWithoutTaxonomiesInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => CollectionUpdateWithoutTaxonomiesInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutTaxonomiesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => CollectionCreateWithoutTaxonomiesInputSchema),
        z.lazy(() => CollectionUncheckedCreateWithoutTaxonomiesInputSchema),
      ]),
    })
    .strict();

export default CollectionUpsertWithWhereUniqueWithoutTaxonomiesInputSchema;
