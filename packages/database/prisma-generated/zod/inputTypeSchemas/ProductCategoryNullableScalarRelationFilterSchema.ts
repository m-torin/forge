import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereInputSchema } from './ProductCategoryWhereInputSchema';

export const ProductCategoryNullableScalarRelationFilterSchema: z.ZodType<Prisma.ProductCategoryNullableScalarRelationFilter> =
  z
    .object({
      is: z
        .lazy(() => ProductCategoryWhereInputSchema)
        .optional()
        .nullable(),
      isNot: z
        .lazy(() => ProductCategoryWhereInputSchema)
        .optional()
        .nullable(),
    })
    .strict();

export default ProductCategoryNullableScalarRelationFilterSchema;
