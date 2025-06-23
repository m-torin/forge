import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutTaxonomiesInputSchema } from './CollectionUpdateWithoutTaxonomiesInputSchema';
import { CollectionUncheckedUpdateWithoutTaxonomiesInputSchema } from './CollectionUncheckedUpdateWithoutTaxonomiesInputSchema';

export const CollectionUpdateWithWhereUniqueWithoutTaxonomiesInputSchema: z.ZodType<Prisma.CollectionUpdateWithWhereUniqueWithoutTaxonomiesInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => CollectionUpdateWithoutTaxonomiesInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutTaxonomiesInputSchema),
      ]),
    })
    .strict();

export default CollectionUpdateWithWhereUniqueWithoutTaxonomiesInputSchema;
