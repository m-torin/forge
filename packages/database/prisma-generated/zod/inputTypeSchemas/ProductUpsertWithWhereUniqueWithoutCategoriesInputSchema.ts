import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutCategoriesInputSchema } from './ProductUpdateWithoutCategoriesInputSchema';
import { ProductUncheckedUpdateWithoutCategoriesInputSchema } from './ProductUncheckedUpdateWithoutCategoriesInputSchema';
import { ProductCreateWithoutCategoriesInputSchema } from './ProductCreateWithoutCategoriesInputSchema';
import { ProductUncheckedCreateWithoutCategoriesInputSchema } from './ProductUncheckedCreateWithoutCategoriesInputSchema';

export const ProductUpsertWithWhereUniqueWithoutCategoriesInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutCategoriesInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ProductUpdateWithoutCategoriesInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutCategoriesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutCategoriesInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutCategoriesInputSchema),
      ]),
    })
    .strict();

export default ProductUpsertWithWhereUniqueWithoutCategoriesInputSchema;
