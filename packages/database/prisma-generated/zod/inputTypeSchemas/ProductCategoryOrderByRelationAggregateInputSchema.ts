import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ProductCategoryOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ProductCategoryOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ProductCategoryOrderByRelationAggregateInputSchema;
