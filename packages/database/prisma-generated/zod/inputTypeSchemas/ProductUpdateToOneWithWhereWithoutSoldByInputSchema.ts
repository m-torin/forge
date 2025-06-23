import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductUpdateWithoutSoldByInputSchema } from './ProductUpdateWithoutSoldByInputSchema';
import { ProductUncheckedUpdateWithoutSoldByInputSchema } from './ProductUncheckedUpdateWithoutSoldByInputSchema';

export const ProductUpdateToOneWithWhereWithoutSoldByInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutSoldByInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => ProductUpdateWithoutSoldByInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutSoldByInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateToOneWithWhereWithoutSoldByInputSchema;
