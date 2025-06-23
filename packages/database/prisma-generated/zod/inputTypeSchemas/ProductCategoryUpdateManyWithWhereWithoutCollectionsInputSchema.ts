import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryScalarWhereInputSchema } from './ProductCategoryScalarWhereInputSchema';
import { ProductCategoryUpdateManyMutationInputSchema } from './ProductCategoryUpdateManyMutationInputSchema';
import { ProductCategoryUncheckedUpdateManyWithoutCollectionsInputSchema } from './ProductCategoryUncheckedUpdateManyWithoutCollectionsInputSchema';

export const ProductCategoryUpdateManyWithWhereWithoutCollectionsInputSchema: z.ZodType<Prisma.ProductCategoryUpdateManyWithWhereWithoutCollectionsInput> =
  z
    .object({
      where: z.lazy(() => ProductCategoryScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => ProductCategoryUpdateManyMutationInputSchema),
        z.lazy(() => ProductCategoryUncheckedUpdateManyWithoutCollectionsInputSchema),
      ]),
    })
    .strict();

export default ProductCategoryUpdateManyWithWhereWithoutCollectionsInputSchema;
