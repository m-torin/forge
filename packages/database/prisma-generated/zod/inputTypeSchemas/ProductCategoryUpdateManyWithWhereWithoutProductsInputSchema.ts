import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryScalarWhereInputSchema } from './ProductCategoryScalarWhereInputSchema';
import { ProductCategoryUpdateManyMutationInputSchema } from './ProductCategoryUpdateManyMutationInputSchema';
import { ProductCategoryUncheckedUpdateManyWithoutProductsInputSchema } from './ProductCategoryUncheckedUpdateManyWithoutProductsInputSchema';

export const ProductCategoryUpdateManyWithWhereWithoutProductsInputSchema: z.ZodType<Prisma.ProductCategoryUpdateManyWithWhereWithoutProductsInput> = z.object({
  where: z.lazy(() => ProductCategoryScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductCategoryUpdateManyMutationInputSchema),z.lazy(() => ProductCategoryUncheckedUpdateManyWithoutProductsInputSchema) ]),
}).strict();

export default ProductCategoryUpdateManyWithWhereWithoutProductsInputSchema;
