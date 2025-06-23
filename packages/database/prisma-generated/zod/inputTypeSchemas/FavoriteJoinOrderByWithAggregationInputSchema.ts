import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { FavoriteJoinCountOrderByAggregateInputSchema } from './FavoriteJoinCountOrderByAggregateInputSchema';
import { FavoriteJoinMaxOrderByAggregateInputSchema } from './FavoriteJoinMaxOrderByAggregateInputSchema';
import { FavoriteJoinMinOrderByAggregateInputSchema } from './FavoriteJoinMinOrderByAggregateInputSchema';

export const FavoriteJoinOrderByWithAggregationInputSchema: z.ZodType<Prisma.FavoriteJoinOrderByWithAggregationInput> =
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
      _count: z.lazy(() => FavoriteJoinCountOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => FavoriteJoinMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => FavoriteJoinMinOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default FavoriteJoinOrderByWithAggregationInputSchema;
