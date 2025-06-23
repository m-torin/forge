import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ArticleCountOrderByAggregateInputSchema } from './ArticleCountOrderByAggregateInputSchema';
import { ArticleMaxOrderByAggregateInputSchema } from './ArticleMaxOrderByAggregateInputSchema';
import { ArticleMinOrderByAggregateInputSchema } from './ArticleMinOrderByAggregateInputSchema';

export const ArticleOrderByWithAggregationInputSchema: z.ZodType<Prisma.ArticleOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedById: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      title: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
      content: z.lazy(() => SortOrderSchema).optional(),
      status: z.lazy(() => SortOrderSchema).optional(),
      userId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      _count: z.lazy(() => ArticleCountOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => ArticleMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => ArticleMinOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default ArticleOrderByWithAggregationInputSchema;
