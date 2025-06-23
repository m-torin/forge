import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductUpdateWithoutRegistriesInputSchema } from './ProductUpdateWithoutRegistriesInputSchema';
import { ProductUncheckedUpdateWithoutRegistriesInputSchema } from './ProductUncheckedUpdateWithoutRegistriesInputSchema';
import { ProductCreateWithoutRegistriesInputSchema } from './ProductCreateWithoutRegistriesInputSchema';
import { ProductUncheckedCreateWithoutRegistriesInputSchema } from './ProductUncheckedCreateWithoutRegistriesInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductUpsertWithoutRegistriesInputSchema: z.ZodType<Prisma.ProductUpsertWithoutRegistriesInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => ProductUpdateWithoutRegistriesInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutRegistriesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutRegistriesInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutRegistriesInputSchema),
      ]),
      where: z.lazy(() => ProductWhereInputSchema).optional(),
    })
    .strict();

export default ProductUpsertWithoutRegistriesInputSchema;
