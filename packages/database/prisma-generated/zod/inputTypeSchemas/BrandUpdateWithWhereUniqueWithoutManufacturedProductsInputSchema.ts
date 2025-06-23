import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithoutManufacturedProductsInputSchema } from './BrandUpdateWithoutManufacturedProductsInputSchema';
import { BrandUncheckedUpdateWithoutManufacturedProductsInputSchema } from './BrandUncheckedUpdateWithoutManufacturedProductsInputSchema';

export const BrandUpdateWithWhereUniqueWithoutManufacturedProductsInputSchema: z.ZodType<Prisma.BrandUpdateWithWhereUniqueWithoutManufacturedProductsInput> =
  z
    .object({
      where: z.lazy(() => BrandWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => BrandUpdateWithoutManufacturedProductsInputSchema),
        z.lazy(() => BrandUncheckedUpdateWithoutManufacturedProductsInputSchema),
      ]),
    })
    .strict();

export default BrandUpdateWithWhereUniqueWithoutManufacturedProductsInputSchema;
