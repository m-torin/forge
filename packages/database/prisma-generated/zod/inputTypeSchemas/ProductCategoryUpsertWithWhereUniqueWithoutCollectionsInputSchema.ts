import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryUpdateWithoutCollectionsInputSchema } from './ProductCategoryUpdateWithoutCollectionsInputSchema';
import { ProductCategoryUncheckedUpdateWithoutCollectionsInputSchema } from './ProductCategoryUncheckedUpdateWithoutCollectionsInputSchema';
import { ProductCategoryCreateWithoutCollectionsInputSchema } from './ProductCategoryCreateWithoutCollectionsInputSchema';
import { ProductCategoryUncheckedCreateWithoutCollectionsInputSchema } from './ProductCategoryUncheckedCreateWithoutCollectionsInputSchema';

export const ProductCategoryUpsertWithWhereUniqueWithoutCollectionsInputSchema: z.ZodType<Prisma.ProductCategoryUpsertWithWhereUniqueWithoutCollectionsInput> =
  z
    .object({
      where: z.lazy(() => ProductCategoryWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ProductCategoryUpdateWithoutCollectionsInputSchema),
        z.lazy(() => ProductCategoryUncheckedUpdateWithoutCollectionsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCategoryCreateWithoutCollectionsInputSchema),
        z.lazy(() => ProductCategoryUncheckedCreateWithoutCollectionsInputSchema),
      ]),
    })
    .strict();

export default ProductCategoryUpsertWithWhereUniqueWithoutCollectionsInputSchema;
