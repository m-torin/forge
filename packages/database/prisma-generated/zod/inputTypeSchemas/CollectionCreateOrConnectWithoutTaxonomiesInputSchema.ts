import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionCreateWithoutTaxonomiesInputSchema } from './CollectionCreateWithoutTaxonomiesInputSchema';
import { CollectionUncheckedCreateWithoutTaxonomiesInputSchema } from './CollectionUncheckedCreateWithoutTaxonomiesInputSchema';

export const CollectionCreateOrConnectWithoutTaxonomiesInputSchema: z.ZodType<Prisma.CollectionCreateOrConnectWithoutTaxonomiesInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => CollectionCreateWithoutTaxonomiesInputSchema),
        z.lazy(() => CollectionUncheckedCreateWithoutTaxonomiesInputSchema),
      ]),
    })
    .strict();

export default CollectionCreateOrConnectWithoutTaxonomiesInputSchema;
