import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductUpdateWithoutFavoritesInputSchema } from './ProductUpdateWithoutFavoritesInputSchema';
import { ProductUncheckedUpdateWithoutFavoritesInputSchema } from './ProductUncheckedUpdateWithoutFavoritesInputSchema';
import { ProductCreateWithoutFavoritesInputSchema } from './ProductCreateWithoutFavoritesInputSchema';
import { ProductUncheckedCreateWithoutFavoritesInputSchema } from './ProductUncheckedCreateWithoutFavoritesInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductUpsertWithoutFavoritesInputSchema: z.ZodType<Prisma.ProductUpsertWithoutFavoritesInput> = z.object({
  update: z.union([ z.lazy(() => ProductUpdateWithoutFavoritesInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutFavoritesInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutFavoritesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutFavoritesInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional()
}).strict();

export default ProductUpsertWithoutFavoritesInputSchema;
