import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryUpdateWithoutCollectionsInputSchema } from './ProductCategoryUpdateWithoutCollectionsInputSchema';
import { ProductCategoryUncheckedUpdateWithoutCollectionsInputSchema } from './ProductCategoryUncheckedUpdateWithoutCollectionsInputSchema';

export const ProductCategoryUpdateWithWhereUniqueWithoutCollectionsInputSchema: z.ZodType<Prisma.ProductCategoryUpdateWithWhereUniqueWithoutCollectionsInput> = z.object({
  where: z.lazy(() => ProductCategoryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductCategoryUpdateWithoutCollectionsInputSchema),z.lazy(() => ProductCategoryUncheckedUpdateWithoutCollectionsInputSchema) ]),
}).strict();

export default ProductCategoryUpdateWithWhereUniqueWithoutCollectionsInputSchema;
