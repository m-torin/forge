import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ProductCategoryAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ProductCategoryAvgOrderByAggregateInput> =
  z
    .object({
      displayOrder: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default ProductCategoryAvgOrderByAggregateInputSchema;
