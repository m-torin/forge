import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutInventoryVariantsInputSchema } from './ProductCreateWithoutInventoryVariantsInputSchema';
import { ProductUncheckedCreateWithoutInventoryVariantsInputSchema } from './ProductUncheckedCreateWithoutInventoryVariantsInputSchema';

export const ProductCreateOrConnectWithoutInventoryVariantsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutInventoryVariantsInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ProductCreateWithoutInventoryVariantsInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutInventoryVariantsInputSchema),
      ]),
    })
    .strict();

export default ProductCreateOrConnectWithoutInventoryVariantsInputSchema;
