import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutOrderItemVariantsInputSchema } from './ProductCreateWithoutOrderItemVariantsInputSchema';
import { ProductUncheckedCreateWithoutOrderItemVariantsInputSchema } from './ProductUncheckedCreateWithoutOrderItemVariantsInputSchema';

export const ProductCreateOrConnectWithoutOrderItemVariantsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutOrderItemVariantsInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ProductCreateWithoutOrderItemVariantsInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutOrderItemVariantsInputSchema),
      ]),
    })
    .strict();

export default ProductCreateOrConnectWithoutOrderItemVariantsInputSchema;
