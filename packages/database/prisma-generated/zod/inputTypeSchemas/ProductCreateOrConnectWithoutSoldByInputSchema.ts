import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutSoldByInputSchema } from './ProductCreateWithoutSoldByInputSchema';
import { ProductUncheckedCreateWithoutSoldByInputSchema } from './ProductUncheckedCreateWithoutSoldByInputSchema';

export const ProductCreateOrConnectWithoutSoldByInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutSoldByInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ProductCreateWithoutSoldByInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutSoldByInputSchema),
      ]),
    })
    .strict();

export default ProductCreateOrConnectWithoutSoldByInputSchema;
