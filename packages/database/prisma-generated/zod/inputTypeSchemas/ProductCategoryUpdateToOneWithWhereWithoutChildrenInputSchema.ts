import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereInputSchema } from './ProductCategoryWhereInputSchema';
import { ProductCategoryUpdateWithoutChildrenInputSchema } from './ProductCategoryUpdateWithoutChildrenInputSchema';
import { ProductCategoryUncheckedUpdateWithoutChildrenInputSchema } from './ProductCategoryUncheckedUpdateWithoutChildrenInputSchema';

export const ProductCategoryUpdateToOneWithWhereWithoutChildrenInputSchema: z.ZodType<Prisma.ProductCategoryUpdateToOneWithWhereWithoutChildrenInput> =
  z
    .object({
      where: z.lazy(() => ProductCategoryWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => ProductCategoryUpdateWithoutChildrenInputSchema),
        z.lazy(() => ProductCategoryUncheckedUpdateWithoutChildrenInputSchema),
      ]),
    })
    .strict();

export default ProductCategoryUpdateToOneWithWhereWithoutChildrenInputSchema;
