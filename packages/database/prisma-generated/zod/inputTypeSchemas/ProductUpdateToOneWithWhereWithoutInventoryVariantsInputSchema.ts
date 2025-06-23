import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductUpdateWithoutInventoryVariantsInputSchema } from './ProductUpdateWithoutInventoryVariantsInputSchema';
import { ProductUncheckedUpdateWithoutInventoryVariantsInputSchema } from './ProductUncheckedUpdateWithoutInventoryVariantsInputSchema';

export const ProductUpdateToOneWithWhereWithoutInventoryVariantsInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutInventoryVariantsInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => ProductUpdateWithoutInventoryVariantsInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutInventoryVariantsInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateToOneWithWhereWithoutInventoryVariantsInputSchema;
