import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutDeletedByInputSchema } from './ProductCreateWithoutDeletedByInputSchema';
import { ProductUncheckedCreateWithoutDeletedByInputSchema } from './ProductUncheckedCreateWithoutDeletedByInputSchema';

export const ProductCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ProductCreateWithoutDeletedByInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default ProductCreateOrConnectWithoutDeletedByInputSchema;
