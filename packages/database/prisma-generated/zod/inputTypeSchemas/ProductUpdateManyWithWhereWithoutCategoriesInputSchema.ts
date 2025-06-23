import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';
import { ProductUpdateManyMutationInputSchema } from './ProductUpdateManyMutationInputSchema';
import { ProductUncheckedUpdateManyWithoutCategoriesInputSchema } from './ProductUncheckedUpdateManyWithoutCategoriesInputSchema';

export const ProductUpdateManyWithWhereWithoutCategoriesInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutCategoriesInput> =
  z
    .object({
      where: z.lazy(() => ProductScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => ProductUpdateManyMutationInputSchema),
        z.lazy(() => ProductUncheckedUpdateManyWithoutCategoriesInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateManyWithWhereWithoutCategoriesInputSchema;
