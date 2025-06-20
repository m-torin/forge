import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryCreateWithoutProductsInputSchema } from './ProductCategoryCreateWithoutProductsInputSchema';
import { ProductCategoryUncheckedCreateWithoutProductsInputSchema } from './ProductCategoryUncheckedCreateWithoutProductsInputSchema';

export const ProductCategoryCreateOrConnectWithoutProductsInputSchema: z.ZodType<Prisma.ProductCategoryCreateOrConnectWithoutProductsInput> = z.object({
  where: z.lazy(() => ProductCategoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCategoryCreateWithoutProductsInputSchema),z.lazy(() => ProductCategoryUncheckedCreateWithoutProductsInputSchema) ]),
}).strict();

export default ProductCategoryCreateOrConnectWithoutProductsInputSchema;
