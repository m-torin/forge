import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryCreateWithoutDeletedByInputSchema } from './ProductCategoryCreateWithoutDeletedByInputSchema';
import { ProductCategoryUncheckedCreateWithoutDeletedByInputSchema } from './ProductCategoryUncheckedCreateWithoutDeletedByInputSchema';

export const ProductCategoryCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.ProductCategoryCreateOrConnectWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => ProductCategoryWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ProductCategoryCreateWithoutDeletedByInputSchema),
        z.lazy(() => ProductCategoryUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default ProductCategoryCreateOrConnectWithoutDeletedByInputSchema;
