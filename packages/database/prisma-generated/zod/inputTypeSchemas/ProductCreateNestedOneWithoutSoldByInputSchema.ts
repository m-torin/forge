import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutSoldByInputSchema } from './ProductCreateWithoutSoldByInputSchema';
import { ProductUncheckedCreateWithoutSoldByInputSchema } from './ProductUncheckedCreateWithoutSoldByInputSchema';
import { ProductCreateOrConnectWithoutSoldByInputSchema } from './ProductCreateOrConnectWithoutSoldByInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedOneWithoutSoldByInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutSoldByInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutSoldByInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutSoldByInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutSoldByInputSchema).optional(),
      connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
    })
    .strict();

export default ProductCreateNestedOneWithoutSoldByInputSchema;
