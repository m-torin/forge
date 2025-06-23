import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryUpdateWithoutParentInputSchema } from './ProductCategoryUpdateWithoutParentInputSchema';
import { ProductCategoryUncheckedUpdateWithoutParentInputSchema } from './ProductCategoryUncheckedUpdateWithoutParentInputSchema';
import { ProductCategoryCreateWithoutParentInputSchema } from './ProductCategoryCreateWithoutParentInputSchema';
import { ProductCategoryUncheckedCreateWithoutParentInputSchema } from './ProductCategoryUncheckedCreateWithoutParentInputSchema';

export const ProductCategoryUpsertWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.ProductCategoryUpsertWithWhereUniqueWithoutParentInput> =
  z
    .object({
      where: z.lazy(() => ProductCategoryWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ProductCategoryUpdateWithoutParentInputSchema),
        z.lazy(() => ProductCategoryUncheckedUpdateWithoutParentInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCategoryCreateWithoutParentInputSchema),
        z.lazy(() => ProductCategoryUncheckedCreateWithoutParentInputSchema),
      ]),
    })
    .strict();

export default ProductCategoryUpsertWithWhereUniqueWithoutParentInputSchema;
