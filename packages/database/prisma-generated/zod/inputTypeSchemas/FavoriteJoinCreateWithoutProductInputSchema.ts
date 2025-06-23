import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutFavoritesInputSchema } from './UserCreateNestedOneWithoutFavoritesInputSchema';
import { CollectionCreateNestedOneWithoutFavoritesInputSchema } from './CollectionCreateNestedOneWithoutFavoritesInputSchema';

export const FavoriteJoinCreateWithoutProductInputSchema: z.ZodType<Prisma.FavoriteJoinCreateWithoutProductInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      user: z.lazy(() => UserCreateNestedOneWithoutFavoritesInputSchema),
      collection: z.lazy(() => CollectionCreateNestedOneWithoutFavoritesInputSchema).optional(),
    })
    .strict();

export default FavoriteJoinCreateWithoutProductInputSchema;
