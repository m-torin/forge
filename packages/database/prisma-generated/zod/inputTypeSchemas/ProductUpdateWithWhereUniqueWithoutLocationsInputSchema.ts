import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutLocationsInputSchema } from './ProductUpdateWithoutLocationsInputSchema';
import { ProductUncheckedUpdateWithoutLocationsInputSchema } from './ProductUncheckedUpdateWithoutLocationsInputSchema';

export const ProductUpdateWithWhereUniqueWithoutLocationsInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutLocationsInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => ProductUpdateWithoutLocationsInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutLocationsInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateWithWhereUniqueWithoutLocationsInputSchema;
