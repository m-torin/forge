import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutCategoriesInputSchema } from './ProductCreateWithoutCategoriesInputSchema';
import { ProductUncheckedCreateWithoutCategoriesInputSchema } from './ProductUncheckedCreateWithoutCategoriesInputSchema';

export const ProductCreateOrConnectWithoutCategoriesInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutCategoriesInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutCategoriesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutCategoriesInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutCategoriesInputSchema;
