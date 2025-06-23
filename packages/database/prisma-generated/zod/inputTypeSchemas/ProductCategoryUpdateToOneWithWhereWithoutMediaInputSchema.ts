import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereInputSchema } from './ProductCategoryWhereInputSchema';
import { ProductCategoryUpdateWithoutMediaInputSchema } from './ProductCategoryUpdateWithoutMediaInputSchema';
import { ProductCategoryUncheckedUpdateWithoutMediaInputSchema } from './ProductCategoryUncheckedUpdateWithoutMediaInputSchema';

export const ProductCategoryUpdateToOneWithWhereWithoutMediaInputSchema: z.ZodType<Prisma.ProductCategoryUpdateToOneWithWhereWithoutMediaInput> =
  z
    .object({
      where: z.lazy(() => ProductCategoryWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => ProductCategoryUpdateWithoutMediaInputSchema),
        z.lazy(() => ProductCategoryUncheckedUpdateWithoutMediaInputSchema),
      ]),
    })
    .strict();

export default ProductCategoryUpdateToOneWithWhereWithoutMediaInputSchema;
