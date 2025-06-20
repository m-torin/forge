import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutCategoriesInputSchema } from './ProductCreateWithoutCategoriesInputSchema';
import { ProductUncheckedCreateWithoutCategoriesInputSchema } from './ProductUncheckedCreateWithoutCategoriesInputSchema';
import { ProductCreateOrConnectWithoutCategoriesInputSchema } from './ProductCreateOrConnectWithoutCategoriesInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedManyWithoutCategoriesInputSchema: z.ZodType<Prisma.ProductCreateNestedManyWithoutCategoriesInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutCategoriesInputSchema),z.lazy(() => ProductCreateWithoutCategoriesInputSchema).array(),z.lazy(() => ProductUncheckedCreateWithoutCategoriesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutCategoriesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutCategoriesInputSchema),z.lazy(() => ProductCreateOrConnectWithoutCategoriesInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ProductCreateNestedManyWithoutCategoriesInputSchema;
