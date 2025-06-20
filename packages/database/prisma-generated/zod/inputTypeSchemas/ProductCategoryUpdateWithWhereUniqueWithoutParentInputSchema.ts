import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryUpdateWithoutParentInputSchema } from './ProductCategoryUpdateWithoutParentInputSchema';
import { ProductCategoryUncheckedUpdateWithoutParentInputSchema } from './ProductCategoryUncheckedUpdateWithoutParentInputSchema';

export const ProductCategoryUpdateWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.ProductCategoryUpdateWithWhereUniqueWithoutParentInput> = z.object({
  where: z.lazy(() => ProductCategoryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductCategoryUpdateWithoutParentInputSchema),z.lazy(() => ProductCategoryUncheckedUpdateWithoutParentInputSchema) ]),
}).strict();

export default ProductCategoryUpdateWithWhereUniqueWithoutParentInputSchema;
