import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutReviewsInputSchema } from './ProductCreateWithoutReviewsInputSchema';
import { ProductUncheckedCreateWithoutReviewsInputSchema } from './ProductUncheckedCreateWithoutReviewsInputSchema';

export const ProductCreateOrConnectWithoutReviewsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutReviewsInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutReviewsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutReviewsInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutReviewsInputSchema;
