import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutRegistriesInputSchema } from './ProductCreateWithoutRegistriesInputSchema';
import { ProductUncheckedCreateWithoutRegistriesInputSchema } from './ProductUncheckedCreateWithoutRegistriesInputSchema';

export const ProductCreateOrConnectWithoutRegistriesInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutRegistriesInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ProductCreateWithoutRegistriesInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutRegistriesInputSchema),
      ]),
    })
    .strict();

export default ProductCreateOrConnectWithoutRegistriesInputSchema;
