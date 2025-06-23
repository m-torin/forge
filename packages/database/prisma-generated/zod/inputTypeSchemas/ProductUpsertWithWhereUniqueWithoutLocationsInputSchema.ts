import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutLocationsInputSchema } from './ProductUpdateWithoutLocationsInputSchema';
import { ProductUncheckedUpdateWithoutLocationsInputSchema } from './ProductUncheckedUpdateWithoutLocationsInputSchema';
import { ProductCreateWithoutLocationsInputSchema } from './ProductCreateWithoutLocationsInputSchema';
import { ProductUncheckedCreateWithoutLocationsInputSchema } from './ProductUncheckedCreateWithoutLocationsInputSchema';

export const ProductUpsertWithWhereUniqueWithoutLocationsInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutLocationsInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ProductUpdateWithoutLocationsInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutLocationsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutLocationsInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutLocationsInputSchema),
      ]),
    })
    .strict();

export default ProductUpsertWithWhereUniqueWithoutLocationsInputSchema;
