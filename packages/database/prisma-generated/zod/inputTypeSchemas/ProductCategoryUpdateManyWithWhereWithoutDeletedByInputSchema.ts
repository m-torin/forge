import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryScalarWhereInputSchema } from './ProductCategoryScalarWhereInputSchema';
import { ProductCategoryUpdateManyMutationInputSchema } from './ProductCategoryUpdateManyMutationInputSchema';
import { ProductCategoryUncheckedUpdateManyWithoutDeletedByInputSchema } from './ProductCategoryUncheckedUpdateManyWithoutDeletedByInputSchema';

export const ProductCategoryUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.ProductCategoryUpdateManyWithWhereWithoutDeletedByInput> = z.object({
  where: z.lazy(() => ProductCategoryScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductCategoryUpdateManyMutationInputSchema),z.lazy(() => ProductCategoryUncheckedUpdateManyWithoutDeletedByInputSchema) ]),
}).strict();

export default ProductCategoryUpdateManyWithWhereWithoutDeletedByInputSchema;
