import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductUpdateWithoutRegistriesInputSchema } from './ProductUpdateWithoutRegistriesInputSchema';
import { ProductUncheckedUpdateWithoutRegistriesInputSchema } from './ProductUncheckedUpdateWithoutRegistriesInputSchema';

export const ProductUpdateToOneWithWhereWithoutRegistriesInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutRegistriesInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => ProductUpdateWithoutRegistriesInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutRegistriesInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateToOneWithWhereWithoutRegistriesInputSchema;
