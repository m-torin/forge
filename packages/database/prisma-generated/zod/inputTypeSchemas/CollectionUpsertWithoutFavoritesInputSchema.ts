import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionUpdateWithoutFavoritesInputSchema } from './CollectionUpdateWithoutFavoritesInputSchema';
import { CollectionUncheckedUpdateWithoutFavoritesInputSchema } from './CollectionUncheckedUpdateWithoutFavoritesInputSchema';
import { CollectionCreateWithoutFavoritesInputSchema } from './CollectionCreateWithoutFavoritesInputSchema';
import { CollectionUncheckedCreateWithoutFavoritesInputSchema } from './CollectionUncheckedCreateWithoutFavoritesInputSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';

export const CollectionUpsertWithoutFavoritesInputSchema: z.ZodType<Prisma.CollectionUpsertWithoutFavoritesInput> = z.object({
  update: z.union([ z.lazy(() => CollectionUpdateWithoutFavoritesInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutFavoritesInputSchema) ]),
  create: z.union([ z.lazy(() => CollectionCreateWithoutFavoritesInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutFavoritesInputSchema) ]),
  where: z.lazy(() => CollectionWhereInputSchema).optional()
}).strict();

export default CollectionUpsertWithoutFavoritesInputSchema;
