import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ProductSumOrderByAggregateInputSchema: z.ZodType<Prisma.ProductSumOrderByAggregateInput> = z.object({
  price: z.lazy(() => SortOrderSchema).optional(),
  variantPrice: z.lazy(() => SortOrderSchema).optional(),
  compareAtPrice: z.lazy(() => SortOrderSchema).optional(),
  displayOrder: z.lazy(() => SortOrderSchema).optional(),
  aiConfidence: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ProductSumOrderByAggregateInputSchema;
