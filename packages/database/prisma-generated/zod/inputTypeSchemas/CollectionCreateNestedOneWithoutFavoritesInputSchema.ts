import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutFavoritesInputSchema } from './CollectionCreateWithoutFavoritesInputSchema';
import { CollectionUncheckedCreateWithoutFavoritesInputSchema } from './CollectionUncheckedCreateWithoutFavoritesInputSchema';
import { CollectionCreateOrConnectWithoutFavoritesInputSchema } from './CollectionCreateOrConnectWithoutFavoritesInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';

export const CollectionCreateNestedOneWithoutFavoritesInputSchema: z.ZodType<Prisma.CollectionCreateNestedOneWithoutFavoritesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CollectionCreateWithoutFavoritesInputSchema),
          z.lazy(() => CollectionUncheckedCreateWithoutFavoritesInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => CollectionCreateOrConnectWithoutFavoritesInputSchema)
        .optional(),
      connect: z.lazy(() => CollectionWhereUniqueInputSchema).optional(),
    })
    .strict();

export default CollectionCreateNestedOneWithoutFavoritesInputSchema;
