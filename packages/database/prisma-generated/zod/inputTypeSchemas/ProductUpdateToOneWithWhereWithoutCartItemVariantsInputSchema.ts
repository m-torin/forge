import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductUpdateWithoutCartItemVariantsInputSchema } from './ProductUpdateWithoutCartItemVariantsInputSchema';
import { ProductUncheckedUpdateWithoutCartItemVariantsInputSchema } from './ProductUncheckedUpdateWithoutCartItemVariantsInputSchema';

export const ProductUpdateToOneWithWhereWithoutCartItemVariantsInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutCartItemVariantsInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => ProductUpdateWithoutCartItemVariantsInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutCartItemVariantsInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateToOneWithWhereWithoutCartItemVariantsInputSchema;
