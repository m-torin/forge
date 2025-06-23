import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const MediaMaxOrderByAggregateInputSchema: z.ZodType<Prisma.MediaMaxOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      url: z.lazy(() => SortOrderSchema).optional(),
      altText: z.lazy(() => SortOrderSchema).optional(),
      type: z.lazy(() => SortOrderSchema).optional(),
      width: z.lazy(() => SortOrderSchema).optional(),
      height: z.lazy(() => SortOrderSchema).optional(),
      size: z.lazy(() => SortOrderSchema).optional(),
      mimeType: z.lazy(() => SortOrderSchema).optional(),
      sortOrder: z.lazy(() => SortOrderSchema).optional(),
      userId: z.lazy(() => SortOrderSchema).optional(),
      articleId: z.lazy(() => SortOrderSchema).optional(),
      brandId: z.lazy(() => SortOrderSchema).optional(),
      collectionId: z.lazy(() => SortOrderSchema).optional(),
      productId: z.lazy(() => SortOrderSchema).optional(),
      taxonomyId: z.lazy(() => SortOrderSchema).optional(),
      categoryId: z.lazy(() => SortOrderSchema).optional(),
      pdpJoinId: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedById: z.lazy(() => SortOrderSchema).optional(),
      reviewId: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default MediaMaxOrderByAggregateInputSchema;
