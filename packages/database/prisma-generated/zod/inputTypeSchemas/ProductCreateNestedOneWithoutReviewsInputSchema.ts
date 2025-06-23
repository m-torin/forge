import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutReviewsInputSchema } from './ProductCreateWithoutReviewsInputSchema';
import { ProductUncheckedCreateWithoutReviewsInputSchema } from './ProductUncheckedCreateWithoutReviewsInputSchema';
import { ProductCreateOrConnectWithoutReviewsInputSchema } from './ProductCreateOrConnectWithoutReviewsInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedOneWithoutReviewsInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutReviewsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutReviewsInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutReviewsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutReviewsInputSchema).optional(),
      connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
    })
    .strict();

export default ProductCreateNestedOneWithoutReviewsInputSchema;
