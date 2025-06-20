import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutFavoritesInputSchema } from './ProductCreateWithoutFavoritesInputSchema';
import { ProductUncheckedCreateWithoutFavoritesInputSchema } from './ProductUncheckedCreateWithoutFavoritesInputSchema';
import { ProductCreateOrConnectWithoutFavoritesInputSchema } from './ProductCreateOrConnectWithoutFavoritesInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedOneWithoutFavoritesInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutFavoritesInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutFavoritesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutFavoritesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutFavoritesInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional()
}).strict();

export default ProductCreateNestedOneWithoutFavoritesInputSchema;
