import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';
import { CollectionUpdateWithoutRegistriesInputSchema } from './CollectionUpdateWithoutRegistriesInputSchema';
import { CollectionUncheckedUpdateWithoutRegistriesInputSchema } from './CollectionUncheckedUpdateWithoutRegistriesInputSchema';

export const CollectionUpdateToOneWithWhereWithoutRegistriesInputSchema: z.ZodType<Prisma.CollectionUpdateToOneWithWhereWithoutRegistriesInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => CollectionUpdateWithoutRegistriesInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutRegistriesInputSchema),
      ]),
    })
    .strict();

export default CollectionUpdateToOneWithWhereWithoutRegistriesInputSchema;
