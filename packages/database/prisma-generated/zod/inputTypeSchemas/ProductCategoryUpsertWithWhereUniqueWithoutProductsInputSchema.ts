import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryUpdateWithoutProductsInputSchema } from './ProductCategoryUpdateWithoutProductsInputSchema';
import { ProductCategoryUncheckedUpdateWithoutProductsInputSchema } from './ProductCategoryUncheckedUpdateWithoutProductsInputSchema';
import { ProductCategoryCreateWithoutProductsInputSchema } from './ProductCategoryCreateWithoutProductsInputSchema';
import { ProductCategoryUncheckedCreateWithoutProductsInputSchema } from './ProductCategoryUncheckedCreateWithoutProductsInputSchema';

export const ProductCategoryUpsertWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.ProductCategoryUpsertWithWhereUniqueWithoutProductsInput> = z.object({
  where: z.lazy(() => ProductCategoryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProductCategoryUpdateWithoutProductsInputSchema),z.lazy(() => ProductCategoryUncheckedUpdateWithoutProductsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCategoryCreateWithoutProductsInputSchema),z.lazy(() => ProductCategoryUncheckedCreateWithoutProductsInputSchema) ]),
}).strict();

export default ProductCategoryUpsertWithWhereUniqueWithoutProductsInputSchema;
