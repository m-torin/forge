import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutFavoritesInputSchema } from './UserCreateNestedOneWithoutFavoritesInputSchema';
import { ProductCreateNestedOneWithoutFavoritesInputSchema } from './ProductCreateNestedOneWithoutFavoritesInputSchema';

export const FavoriteJoinCreateWithoutCollectionInputSchema: z.ZodType<Prisma.FavoriteJoinCreateWithoutCollectionInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutFavoritesInputSchema),
  product: z.lazy(() => ProductCreateNestedOneWithoutFavoritesInputSchema).optional()
}).strict();

export default FavoriteJoinCreateWithoutCollectionInputSchema;
