import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionUpdateWithoutRegistriesInputSchema } from './CollectionUpdateWithoutRegistriesInputSchema';
import { CollectionUncheckedUpdateWithoutRegistriesInputSchema } from './CollectionUncheckedUpdateWithoutRegistriesInputSchema';
import { CollectionCreateWithoutRegistriesInputSchema } from './CollectionCreateWithoutRegistriesInputSchema';
import { CollectionUncheckedCreateWithoutRegistriesInputSchema } from './CollectionUncheckedCreateWithoutRegistriesInputSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';

export const CollectionUpsertWithoutRegistriesInputSchema: z.ZodType<Prisma.CollectionUpsertWithoutRegistriesInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => CollectionUpdateWithoutRegistriesInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutRegistriesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => CollectionCreateWithoutRegistriesInputSchema),
        z.lazy(() => CollectionUncheckedCreateWithoutRegistriesInputSchema),
      ]),
      where: z.lazy(() => CollectionWhereInputSchema).optional(),
    })
    .strict();

export default CollectionUpsertWithoutRegistriesInputSchema;
