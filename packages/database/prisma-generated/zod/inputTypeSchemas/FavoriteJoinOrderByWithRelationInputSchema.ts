import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { ProductOrderByWithRelationInputSchema } from './ProductOrderByWithRelationInputSchema';
import { CollectionOrderByWithRelationInputSchema } from './CollectionOrderByWithRelationInputSchema';

export const FavoriteJoinOrderByWithRelationInputSchema: z.ZodType<Prisma.FavoriteJoinOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      userId: z.lazy(() => SortOrderSchema).optional(),
      productId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      collectionId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
      product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
      collection: z.lazy(() => CollectionOrderByWithRelationInputSchema).optional(),
    })
    .strict();

export default FavoriteJoinOrderByWithRelationInputSchema;
