import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryCreateWithoutProductsInputSchema } from './ProductCategoryCreateWithoutProductsInputSchema';
import { ProductCategoryUncheckedCreateWithoutProductsInputSchema } from './ProductCategoryUncheckedCreateWithoutProductsInputSchema';
import { ProductCategoryCreateOrConnectWithoutProductsInputSchema } from './ProductCategoryCreateOrConnectWithoutProductsInputSchema';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';

export const ProductCategoryUncheckedCreateNestedManyWithoutProductsInputSchema: z.ZodType<Prisma.ProductCategoryUncheckedCreateNestedManyWithoutProductsInput> = z.object({
  create: z.union([ z.lazy(() => ProductCategoryCreateWithoutProductsInputSchema),z.lazy(() => ProductCategoryCreateWithoutProductsInputSchema).array(),z.lazy(() => ProductCategoryUncheckedCreateWithoutProductsInputSchema),z.lazy(() => ProductCategoryUncheckedCreateWithoutProductsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCategoryCreateOrConnectWithoutProductsInputSchema),z.lazy(() => ProductCategoryCreateOrConnectWithoutProductsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductCategoryWhereUniqueInputSchema),z.lazy(() => ProductCategoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ProductCategoryUncheckedCreateNestedManyWithoutProductsInputSchema;
