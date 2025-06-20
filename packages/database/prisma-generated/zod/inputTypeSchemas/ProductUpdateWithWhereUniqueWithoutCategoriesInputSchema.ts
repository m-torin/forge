import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutCategoriesInputSchema } from './ProductUpdateWithoutCategoriesInputSchema';
import { ProductUncheckedUpdateWithoutCategoriesInputSchema } from './ProductUncheckedUpdateWithoutCategoriesInputSchema';

export const ProductUpdateWithWhereUniqueWithoutCategoriesInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutCategoriesInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateWithoutCategoriesInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutCategoriesInputSchema) ]),
}).strict();

export default ProductUpdateWithWhereUniqueWithoutCategoriesInputSchema;
