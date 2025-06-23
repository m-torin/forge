import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ProductCategorySumOrderByAggregateInputSchema: z.ZodType<Prisma.ProductCategorySumOrderByAggregateInput> =
  z
    .object({
      displayOrder: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default ProductCategorySumOrderByAggregateInputSchema;
