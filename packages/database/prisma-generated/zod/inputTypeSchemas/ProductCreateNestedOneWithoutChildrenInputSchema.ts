import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutChildrenInputSchema } from './ProductCreateWithoutChildrenInputSchema';
import { ProductUncheckedCreateWithoutChildrenInputSchema } from './ProductUncheckedCreateWithoutChildrenInputSchema';
import { ProductCreateOrConnectWithoutChildrenInputSchema } from './ProductCreateOrConnectWithoutChildrenInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedOneWithoutChildrenInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutChildrenInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutChildrenInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutChildrenInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutChildrenInputSchema).optional(),
      connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
    })
    .strict();

export default ProductCreateNestedOneWithoutChildrenInputSchema;
