import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereInputSchema } from './ProductCategoryWhereInputSchema';

export const ProductCategoryListRelationFilterSchema: z.ZodType<Prisma.ProductCategoryListRelationFilter> = z.object({
  every: z.lazy(() => ProductCategoryWhereInputSchema).optional(),
  some: z.lazy(() => ProductCategoryWhereInputSchema).optional(),
  none: z.lazy(() => ProductCategoryWhereInputSchema).optional()
}).strict();

export default ProductCategoryListRelationFilterSchema;
