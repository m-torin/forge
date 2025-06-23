import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryUpdateWithoutDeletedByInputSchema } from './ProductCategoryUpdateWithoutDeletedByInputSchema';
import { ProductCategoryUncheckedUpdateWithoutDeletedByInputSchema } from './ProductCategoryUncheckedUpdateWithoutDeletedByInputSchema';

export const ProductCategoryUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.ProductCategoryUpdateWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => ProductCategoryWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => ProductCategoryUpdateWithoutDeletedByInputSchema),
        z.lazy(() => ProductCategoryUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default ProductCategoryUpdateWithWhereUniqueWithoutDeletedByInputSchema;
