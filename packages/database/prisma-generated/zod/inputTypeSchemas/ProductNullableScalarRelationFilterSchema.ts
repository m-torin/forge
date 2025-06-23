import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductNullableScalarRelationFilterSchema: z.ZodType<Prisma.ProductNullableScalarRelationFilter> =
  z
    .object({
      is: z
        .lazy(() => ProductWhereInputSchema)
        .optional()
        .nullable(),
      isNot: z
        .lazy(() => ProductWhereInputSchema)
        .optional()
        .nullable(),
    })
    .strict();

export default ProductNullableScalarRelationFilterSchema;
