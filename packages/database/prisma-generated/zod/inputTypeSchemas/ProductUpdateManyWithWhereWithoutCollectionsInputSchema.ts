import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';
import { ProductUpdateManyMutationInputSchema } from './ProductUpdateManyMutationInputSchema';
import { ProductUncheckedUpdateManyWithoutCollectionsInputSchema } from './ProductUncheckedUpdateManyWithoutCollectionsInputSchema';

export const ProductUpdateManyWithWhereWithoutCollectionsInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutCollectionsInput> =
  z
    .object({
      where: z.lazy(() => ProductScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => ProductUpdateManyMutationInputSchema),
        z.lazy(() => ProductUncheckedUpdateManyWithoutCollectionsInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateManyWithWhereWithoutCollectionsInputSchema;
