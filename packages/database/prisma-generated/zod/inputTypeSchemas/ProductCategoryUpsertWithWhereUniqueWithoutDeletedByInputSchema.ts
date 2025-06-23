import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryUpdateWithoutDeletedByInputSchema } from './ProductCategoryUpdateWithoutDeletedByInputSchema';
import { ProductCategoryUncheckedUpdateWithoutDeletedByInputSchema } from './ProductCategoryUncheckedUpdateWithoutDeletedByInputSchema';
import { ProductCategoryCreateWithoutDeletedByInputSchema } from './ProductCategoryCreateWithoutDeletedByInputSchema';
import { ProductCategoryUncheckedCreateWithoutDeletedByInputSchema } from './ProductCategoryUncheckedCreateWithoutDeletedByInputSchema';

export const ProductCategoryUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.ProductCategoryUpsertWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => ProductCategoryWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ProductCategoryUpdateWithoutDeletedByInputSchema),
        z.lazy(() => ProductCategoryUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCategoryCreateWithoutDeletedByInputSchema),
        z.lazy(() => ProductCategoryUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default ProductCategoryUpsertWithWhereUniqueWithoutDeletedByInputSchema;
