import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryCreateWithoutParentInputSchema } from './ProductCategoryCreateWithoutParentInputSchema';
import { ProductCategoryUncheckedCreateWithoutParentInputSchema } from './ProductCategoryUncheckedCreateWithoutParentInputSchema';

export const ProductCategoryCreateOrConnectWithoutParentInputSchema: z.ZodType<Prisma.ProductCategoryCreateOrConnectWithoutParentInput> = z.object({
  where: z.lazy(() => ProductCategoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCategoryCreateWithoutParentInputSchema),z.lazy(() => ProductCategoryUncheckedCreateWithoutParentInputSchema) ]),
}).strict();

export default ProductCategoryCreateOrConnectWithoutParentInputSchema;
