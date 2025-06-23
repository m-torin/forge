import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductUpdateWithoutInventoryVariantsInputSchema } from './ProductUpdateWithoutInventoryVariantsInputSchema';
import { ProductUncheckedUpdateWithoutInventoryVariantsInputSchema } from './ProductUncheckedUpdateWithoutInventoryVariantsInputSchema';
import { ProductCreateWithoutInventoryVariantsInputSchema } from './ProductCreateWithoutInventoryVariantsInputSchema';
import { ProductUncheckedCreateWithoutInventoryVariantsInputSchema } from './ProductUncheckedCreateWithoutInventoryVariantsInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductUpsertWithoutInventoryVariantsInputSchema: z.ZodType<Prisma.ProductUpsertWithoutInventoryVariantsInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => ProductUpdateWithoutInventoryVariantsInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutInventoryVariantsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutInventoryVariantsInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutInventoryVariantsInputSchema),
      ]),
      where: z.lazy(() => ProductWhereInputSchema).optional(),
    })
    .strict();

export default ProductUpsertWithoutInventoryVariantsInputSchema;
