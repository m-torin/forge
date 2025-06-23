import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryUpdateWithoutChildrenInputSchema } from './ProductCategoryUpdateWithoutChildrenInputSchema';
import { ProductCategoryUncheckedUpdateWithoutChildrenInputSchema } from './ProductCategoryUncheckedUpdateWithoutChildrenInputSchema';
import { ProductCategoryCreateWithoutChildrenInputSchema } from './ProductCategoryCreateWithoutChildrenInputSchema';
import { ProductCategoryUncheckedCreateWithoutChildrenInputSchema } from './ProductCategoryUncheckedCreateWithoutChildrenInputSchema';
import { ProductCategoryWhereInputSchema } from './ProductCategoryWhereInputSchema';

export const ProductCategoryUpsertWithoutChildrenInputSchema: z.ZodType<Prisma.ProductCategoryUpsertWithoutChildrenInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => ProductCategoryUpdateWithoutChildrenInputSchema),
        z.lazy(() => ProductCategoryUncheckedUpdateWithoutChildrenInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCategoryCreateWithoutChildrenInputSchema),
        z.lazy(() => ProductCategoryUncheckedCreateWithoutChildrenInputSchema),
      ]),
      where: z.lazy(() => ProductCategoryWhereInputSchema).optional(),
    })
    .strict();

export default ProductCategoryUpsertWithoutChildrenInputSchema;
