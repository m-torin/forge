import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductUpdateWithoutReviewsInputSchema } from './ProductUpdateWithoutReviewsInputSchema';
import { ProductUncheckedUpdateWithoutReviewsInputSchema } from './ProductUncheckedUpdateWithoutReviewsInputSchema';
import { ProductCreateWithoutReviewsInputSchema } from './ProductCreateWithoutReviewsInputSchema';
import { ProductUncheckedCreateWithoutReviewsInputSchema } from './ProductUncheckedCreateWithoutReviewsInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductUpsertWithoutReviewsInputSchema: z.ZodType<Prisma.ProductUpsertWithoutReviewsInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => ProductUpdateWithoutReviewsInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutReviewsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutReviewsInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutReviewsInputSchema),
      ]),
      where: z.lazy(() => ProductWhereInputSchema).optional(),
    })
    .strict();

export default ProductUpsertWithoutReviewsInputSchema;
