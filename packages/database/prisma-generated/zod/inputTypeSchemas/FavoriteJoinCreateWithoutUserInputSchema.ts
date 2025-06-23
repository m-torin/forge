import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateNestedOneWithoutFavoritesInputSchema } from './ProductCreateNestedOneWithoutFavoritesInputSchema';
import { CollectionCreateNestedOneWithoutFavoritesInputSchema } from './CollectionCreateNestedOneWithoutFavoritesInputSchema';

export const FavoriteJoinCreateWithoutUserInputSchema: z.ZodType<Prisma.FavoriteJoinCreateWithoutUserInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      product: z.lazy(() => ProductCreateNestedOneWithoutFavoritesInputSchema).optional(),
      collection: z.lazy(() => CollectionCreateNestedOneWithoutFavoritesInputSchema).optional(),
    })
    .strict();

export default FavoriteJoinCreateWithoutUserInputSchema;
