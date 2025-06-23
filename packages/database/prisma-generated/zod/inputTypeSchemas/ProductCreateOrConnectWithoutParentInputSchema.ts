import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutParentInputSchema } from './ProductCreateWithoutParentInputSchema';
import { ProductUncheckedCreateWithoutParentInputSchema } from './ProductUncheckedCreateWithoutParentInputSchema';

export const ProductCreateOrConnectWithoutParentInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutParentInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ProductCreateWithoutParentInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutParentInputSchema),
      ]),
    })
    .strict();

export default ProductCreateOrConnectWithoutParentInputSchema;
