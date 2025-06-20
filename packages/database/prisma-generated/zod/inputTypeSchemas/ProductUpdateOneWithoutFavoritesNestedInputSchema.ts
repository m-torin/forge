import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutFavoritesInputSchema } from './ProductCreateWithoutFavoritesInputSchema';
import { ProductUncheckedCreateWithoutFavoritesInputSchema } from './ProductUncheckedCreateWithoutFavoritesInputSchema';
import { ProductCreateOrConnectWithoutFavoritesInputSchema } from './ProductCreateOrConnectWithoutFavoritesInputSchema';
import { ProductUpsertWithoutFavoritesInputSchema } from './ProductUpsertWithoutFavoritesInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateToOneWithWhereWithoutFavoritesInputSchema } from './ProductUpdateToOneWithWhereWithoutFavoritesInputSchema';
import { ProductUpdateWithoutFavoritesInputSchema } from './ProductUpdateWithoutFavoritesInputSchema';
import { ProductUncheckedUpdateWithoutFavoritesInputSchema } from './ProductUncheckedUpdateWithoutFavoritesInputSchema';

export const ProductUpdateOneWithoutFavoritesNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneWithoutFavoritesNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutFavoritesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutFavoritesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutFavoritesInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutFavoritesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutFavoritesInputSchema),z.lazy(() => ProductUpdateWithoutFavoritesInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutFavoritesInputSchema) ]).optional(),
}).strict();

export default ProductUpdateOneWithoutFavoritesNestedInputSchema;
