import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionCreateWithoutFavoritesInputSchema } from './CollectionCreateWithoutFavoritesInputSchema';
import { CollectionUncheckedCreateWithoutFavoritesInputSchema } from './CollectionUncheckedCreateWithoutFavoritesInputSchema';

export const CollectionCreateOrConnectWithoutFavoritesInputSchema: z.ZodType<Prisma.CollectionCreateOrConnectWithoutFavoritesInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CollectionCreateWithoutFavoritesInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutFavoritesInputSchema) ]),
}).strict();

export default CollectionCreateOrConnectWithoutFavoritesInputSchema;
