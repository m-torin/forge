import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductScalarRelationFilterSchema: z.ZodType<Prisma.ProductScalarRelationFilter> = z
  .object({
    is: z.lazy(() => ProductWhereInputSchema).optional(),
    isNot: z.lazy(() => ProductWhereInputSchema).optional(),
  })
  .strict();

export default ProductScalarRelationFilterSchema;
