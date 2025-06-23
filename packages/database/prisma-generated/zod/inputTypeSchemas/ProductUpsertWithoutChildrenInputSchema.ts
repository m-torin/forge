import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductUpdateWithoutChildrenInputSchema } from './ProductUpdateWithoutChildrenInputSchema';
import { ProductUncheckedUpdateWithoutChildrenInputSchema } from './ProductUncheckedUpdateWithoutChildrenInputSchema';
import { ProductCreateWithoutChildrenInputSchema } from './ProductCreateWithoutChildrenInputSchema';
import { ProductUncheckedCreateWithoutChildrenInputSchema } from './ProductUncheckedCreateWithoutChildrenInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductUpsertWithoutChildrenInputSchema: z.ZodType<Prisma.ProductUpsertWithoutChildrenInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => ProductUpdateWithoutChildrenInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutChildrenInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutChildrenInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutChildrenInputSchema),
      ]),
      where: z.lazy(() => ProductWhereInputSchema).optional(),
    })
    .strict();

export default ProductUpsertWithoutChildrenInputSchema;
