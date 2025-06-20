import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutFavoritesInputSchema } from './UserCreateNestedOneWithoutFavoritesInputSchema';
import { ProductCreateNestedOneWithoutFavoritesInputSchema } from './ProductCreateNestedOneWithoutFavoritesInputSchema';
import { CollectionCreateNestedOneWithoutFavoritesInputSchema } from './CollectionCreateNestedOneWithoutFavoritesInputSchema';

export const FavoriteJoinCreateInputSchema: z.ZodType<Prisma.FavoriteJoinCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutFavoritesInputSchema),
  product: z.lazy(() => ProductCreateNestedOneWithoutFavoritesInputSchema).optional(),
  collection: z.lazy(() => CollectionCreateNestedOneWithoutFavoritesInputSchema).optional()
}).strict();

export default FavoriteJoinCreateInputSchema;
