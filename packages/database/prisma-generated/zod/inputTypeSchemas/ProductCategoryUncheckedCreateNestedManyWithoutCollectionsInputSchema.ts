import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryCreateWithoutCollectionsInputSchema } from './ProductCategoryCreateWithoutCollectionsInputSchema';
import { ProductCategoryUncheckedCreateWithoutCollectionsInputSchema } from './ProductCategoryUncheckedCreateWithoutCollectionsInputSchema';
import { ProductCategoryCreateOrConnectWithoutCollectionsInputSchema } from './ProductCategoryCreateOrConnectWithoutCollectionsInputSchema';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';

export const ProductCategoryUncheckedCreateNestedManyWithoutCollectionsInputSchema: z.ZodType<Prisma.ProductCategoryUncheckedCreateNestedManyWithoutCollectionsInput> = z.object({
  create: z.union([ z.lazy(() => ProductCategoryCreateWithoutCollectionsInputSchema),z.lazy(() => ProductCategoryCreateWithoutCollectionsInputSchema).array(),z.lazy(() => ProductCategoryUncheckedCreateWithoutCollectionsInputSchema),z.lazy(() => ProductCategoryUncheckedCreateWithoutCollectionsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCategoryCreateOrConnectWithoutCollectionsInputSchema),z.lazy(() => ProductCategoryCreateOrConnectWithoutCollectionsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductCategoryWhereUniqueInputSchema),z.lazy(() => ProductCategoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ProductCategoryUncheckedCreateNestedManyWithoutCollectionsInputSchema;
