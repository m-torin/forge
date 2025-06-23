import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutFandomsInputSchema } from './ProductCreateWithoutFandomsInputSchema';
import { ProductUncheckedCreateWithoutFandomsInputSchema } from './ProductUncheckedCreateWithoutFandomsInputSchema';

export const ProductCreateOrConnectWithoutFandomsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutFandomsInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ProductCreateWithoutFandomsInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutFandomsInputSchema),
      ]),
    })
    .strict();

export default ProductCreateOrConnectWithoutFandomsInputSchema;
