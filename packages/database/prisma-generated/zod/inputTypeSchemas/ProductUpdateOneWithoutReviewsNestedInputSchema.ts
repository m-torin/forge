import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutReviewsInputSchema } from './ProductCreateWithoutReviewsInputSchema';
import { ProductUncheckedCreateWithoutReviewsInputSchema } from './ProductUncheckedCreateWithoutReviewsInputSchema';
import { ProductCreateOrConnectWithoutReviewsInputSchema } from './ProductCreateOrConnectWithoutReviewsInputSchema';
import { ProductUpsertWithoutReviewsInputSchema } from './ProductUpsertWithoutReviewsInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateToOneWithWhereWithoutReviewsInputSchema } from './ProductUpdateToOneWithWhereWithoutReviewsInputSchema';
import { ProductUpdateWithoutReviewsInputSchema } from './ProductUpdateWithoutReviewsInputSchema';
import { ProductUncheckedUpdateWithoutReviewsInputSchema } from './ProductUncheckedUpdateWithoutReviewsInputSchema';

export const ProductUpdateOneWithoutReviewsNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneWithoutReviewsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutReviewsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutReviewsInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutReviewsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutReviewsInputSchema),z.lazy(() => ProductUpdateWithoutReviewsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutReviewsInputSchema) ]).optional(),
}).strict();

export default ProductUpdateOneWithoutReviewsNestedInputSchema;
