import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryUpdateWithoutProductsInputSchema } from './ProductCategoryUpdateWithoutProductsInputSchema';
import { ProductCategoryUncheckedUpdateWithoutProductsInputSchema } from './ProductCategoryUncheckedUpdateWithoutProductsInputSchema';

export const ProductCategoryUpdateWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.ProductCategoryUpdateWithWhereUniqueWithoutProductsInput> = z.object({
  where: z.lazy(() => ProductCategoryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductCategoryUpdateWithoutProductsInputSchema),z.lazy(() => ProductCategoryUncheckedUpdateWithoutProductsInputSchema) ]),
}).strict();

export default ProductCategoryUpdateWithWhereUniqueWithoutProductsInputSchema;
