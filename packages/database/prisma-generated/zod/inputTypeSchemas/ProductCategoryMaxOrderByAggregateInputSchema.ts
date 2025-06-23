import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ProductCategoryMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProductCategoryMaxOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
      status: z.lazy(() => SortOrderSchema).optional(),
      parentId: z.lazy(() => SortOrderSchema).optional(),
      displayOrder: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedById: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default ProductCategoryMaxOrderByAggregateInputSchema;
