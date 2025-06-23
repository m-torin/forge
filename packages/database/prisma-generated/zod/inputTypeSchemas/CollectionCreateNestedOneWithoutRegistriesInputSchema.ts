import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutRegistriesInputSchema } from './CollectionCreateWithoutRegistriesInputSchema';
import { CollectionUncheckedCreateWithoutRegistriesInputSchema } from './CollectionUncheckedCreateWithoutRegistriesInputSchema';
import { CollectionCreateOrConnectWithoutRegistriesInputSchema } from './CollectionCreateOrConnectWithoutRegistriesInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';

export const CollectionCreateNestedOneWithoutRegistriesInputSchema: z.ZodType<Prisma.CollectionCreateNestedOneWithoutRegistriesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CollectionCreateWithoutRegistriesInputSchema),
          z.lazy(() => CollectionUncheckedCreateWithoutRegistriesInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => CollectionCreateOrConnectWithoutRegistriesInputSchema)
        .optional(),
      connect: z.lazy(() => CollectionWhereUniqueInputSchema).optional(),
    })
    .strict();

export default CollectionCreateNestedOneWithoutRegistriesInputSchema;
