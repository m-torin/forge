import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutFavoritesInputSchema } from './CollectionCreateWithoutFavoritesInputSchema';
import { CollectionUncheckedCreateWithoutFavoritesInputSchema } from './CollectionUncheckedCreateWithoutFavoritesInputSchema';
import { CollectionCreateOrConnectWithoutFavoritesInputSchema } from './CollectionCreateOrConnectWithoutFavoritesInputSchema';
import { CollectionUpsertWithoutFavoritesInputSchema } from './CollectionUpsertWithoutFavoritesInputSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateToOneWithWhereWithoutFavoritesInputSchema } from './CollectionUpdateToOneWithWhereWithoutFavoritesInputSchema';
import { CollectionUpdateWithoutFavoritesInputSchema } from './CollectionUpdateWithoutFavoritesInputSchema';
import { CollectionUncheckedUpdateWithoutFavoritesInputSchema } from './CollectionUncheckedUpdateWithoutFavoritesInputSchema';

export const CollectionUpdateOneWithoutFavoritesNestedInputSchema: z.ZodType<Prisma.CollectionUpdateOneWithoutFavoritesNestedInput> =
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
      upsert: z.lazy(() => CollectionUpsertWithoutFavoritesInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => CollectionWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => CollectionWhereInputSchema)]).optional(),
      connect: z.lazy(() => CollectionWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => CollectionUpdateToOneWithWhereWithoutFavoritesInputSchema),
          z.lazy(() => CollectionUpdateWithoutFavoritesInputSchema),
          z.lazy(() => CollectionUncheckedUpdateWithoutFavoritesInputSchema),
        ])
        .optional(),
    })
    .strict();

export default CollectionUpdateOneWithoutFavoritesNestedInputSchema;
