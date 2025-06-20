import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutFavoritesInputSchema } from './ProductCreateWithoutFavoritesInputSchema';
import { ProductUncheckedCreateWithoutFavoritesInputSchema } from './ProductUncheckedCreateWithoutFavoritesInputSchema';

export const ProductCreateOrConnectWithoutFavoritesInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutFavoritesInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutFavoritesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutFavoritesInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutFavoritesInputSchema;
