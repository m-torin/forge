import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ProductCategoryCountOrderByAggregateInputSchema } from './ProductCategoryCountOrderByAggregateInputSchema';
import { ProductCategoryAvgOrderByAggregateInputSchema } from './ProductCategoryAvgOrderByAggregateInputSchema';
import { ProductCategoryMaxOrderByAggregateInputSchema } from './ProductCategoryMaxOrderByAggregateInputSchema';
import { ProductCategoryMinOrderByAggregateInputSchema } from './ProductCategoryMinOrderByAggregateInputSchema';
import { ProductCategorySumOrderByAggregateInputSchema } from './ProductCategorySumOrderByAggregateInputSchema';

export const ProductCategoryOrderByWithAggregationInputSchema: z.ZodType<Prisma.ProductCategoryOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
      status: z.lazy(() => SortOrderSchema).optional(),
      copy: z.lazy(() => SortOrderSchema).optional(),
      parentId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      displayOrder: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedById: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      _count: z.lazy(() => ProductCategoryCountOrderByAggregateInputSchema).optional(),
      _avg: z.lazy(() => ProductCategoryAvgOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => ProductCategoryMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => ProductCategoryMinOrderByAggregateInputSchema).optional(),
      _sum: z.lazy(() => ProductCategorySumOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default ProductCategoryOrderByWithAggregationInputSchema;
