import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';
import { CollectionUpdateWithoutFavoritesInputSchema } from './CollectionUpdateWithoutFavoritesInputSchema';
import { CollectionUncheckedUpdateWithoutFavoritesInputSchema } from './CollectionUncheckedUpdateWithoutFavoritesInputSchema';

export const CollectionUpdateToOneWithWhereWithoutFavoritesInputSchema: z.ZodType<Prisma.CollectionUpdateToOneWithWhereWithoutFavoritesInput> = z.object({
  where: z.lazy(() => CollectionWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CollectionUpdateWithoutFavoritesInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutFavoritesInputSchema) ]),
}).strict();

export default CollectionUpdateToOneWithWhereWithoutFavoritesInputSchema;
