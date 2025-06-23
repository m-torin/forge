import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductUpdateWithoutFavoritesInputSchema } from './ProductUpdateWithoutFavoritesInputSchema';
import { ProductUncheckedUpdateWithoutFavoritesInputSchema } from './ProductUncheckedUpdateWithoutFavoritesInputSchema';

export const ProductUpdateToOneWithWhereWithoutFavoritesInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutFavoritesInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => ProductUpdateWithoutFavoritesInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutFavoritesInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateToOneWithWhereWithoutFavoritesInputSchema;
