import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryScalarWhereInputSchema } from './ProductCategoryScalarWhereInputSchema';
import { ProductCategoryUpdateManyMutationInputSchema } from './ProductCategoryUpdateManyMutationInputSchema';
import { ProductCategoryUncheckedUpdateManyWithoutParentInputSchema } from './ProductCategoryUncheckedUpdateManyWithoutParentInputSchema';

export const ProductCategoryUpdateManyWithWhereWithoutParentInputSchema: z.ZodType<Prisma.ProductCategoryUpdateManyWithWhereWithoutParentInput> =
  z
    .object({
      where: z.lazy(() => ProductCategoryScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => ProductCategoryUpdateManyMutationInputSchema),
        z.lazy(() => ProductCategoryUncheckedUpdateManyWithoutParentInputSchema),
      ]),
    })
    .strict();

export default ProductCategoryUpdateManyWithWhereWithoutParentInputSchema;
