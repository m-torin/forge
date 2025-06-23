import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionCreateWithoutRegistriesInputSchema } from './CollectionCreateWithoutRegistriesInputSchema';
import { CollectionUncheckedCreateWithoutRegistriesInputSchema } from './CollectionUncheckedCreateWithoutRegistriesInputSchema';

export const CollectionCreateOrConnectWithoutRegistriesInputSchema: z.ZodType<Prisma.CollectionCreateOrConnectWithoutRegistriesInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => CollectionCreateWithoutRegistriesInputSchema),
        z.lazy(() => CollectionUncheckedCreateWithoutRegistriesInputSchema),
      ]),
    })
    .strict();

export default CollectionCreateOrConnectWithoutRegistriesInputSchema;
