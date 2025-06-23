import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductUpdateWithoutChildrenInputSchema } from './ProductUpdateWithoutChildrenInputSchema';
import { ProductUncheckedUpdateWithoutChildrenInputSchema } from './ProductUncheckedUpdateWithoutChildrenInputSchema';

export const ProductUpdateToOneWithWhereWithoutChildrenInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutChildrenInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => ProductUpdateWithoutChildrenInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutChildrenInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateToOneWithWhereWithoutChildrenInputSchema;
