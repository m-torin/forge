import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductUpdateWithoutSoldByInputSchema } from './ProductUpdateWithoutSoldByInputSchema';
import { ProductUncheckedUpdateWithoutSoldByInputSchema } from './ProductUncheckedUpdateWithoutSoldByInputSchema';
import { ProductCreateWithoutSoldByInputSchema } from './ProductCreateWithoutSoldByInputSchema';
import { ProductUncheckedCreateWithoutSoldByInputSchema } from './ProductUncheckedCreateWithoutSoldByInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductUpsertWithoutSoldByInputSchema: z.ZodType<Prisma.ProductUpsertWithoutSoldByInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => ProductUpdateWithoutSoldByInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutSoldByInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutSoldByInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutSoldByInputSchema),
      ]),
      where: z.lazy(() => ProductWhereInputSchema).optional(),
    })
    .strict();

export default ProductUpsertWithoutSoldByInputSchema;
