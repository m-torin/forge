import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutCartItemsInputSchema } from './ProductCreateWithoutCartItemsInputSchema';
import { ProductUncheckedCreateWithoutCartItemsInputSchema } from './ProductUncheckedCreateWithoutCartItemsInputSchema';

export const ProductCreateOrConnectWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutCartItemsInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ProductCreateWithoutCartItemsInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutCartItemsInputSchema),
      ]),
    })
    .strict();

export default ProductCreateOrConnectWithoutCartItemsInputSchema;
