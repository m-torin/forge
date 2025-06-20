import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryCreateWithoutCollectionsInputSchema } from './ProductCategoryCreateWithoutCollectionsInputSchema';
import { ProductCategoryUncheckedCreateWithoutCollectionsInputSchema } from './ProductCategoryUncheckedCreateWithoutCollectionsInputSchema';

export const ProductCategoryCreateOrConnectWithoutCollectionsInputSchema: z.ZodType<Prisma.ProductCategoryCreateOrConnectWithoutCollectionsInput> = z.object({
  where: z.lazy(() => ProductCategoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCategoryCreateWithoutCollectionsInputSchema),z.lazy(() => ProductCategoryUncheckedCreateWithoutCollectionsInputSchema) ]),
}).strict();

export default ProductCategoryCreateOrConnectWithoutCollectionsInputSchema;
