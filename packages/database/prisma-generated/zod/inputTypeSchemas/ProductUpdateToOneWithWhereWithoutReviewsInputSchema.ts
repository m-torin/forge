import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductUpdateWithoutReviewsInputSchema } from './ProductUpdateWithoutReviewsInputSchema';
import { ProductUncheckedUpdateWithoutReviewsInputSchema } from './ProductUncheckedUpdateWithoutReviewsInputSchema';

export const ProductUpdateToOneWithWhereWithoutReviewsInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutReviewsInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => ProductUpdateWithoutReviewsInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutReviewsInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateToOneWithWhereWithoutReviewsInputSchema;
