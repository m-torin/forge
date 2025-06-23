import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutOrderItemsInputSchema } from './ProductCreateWithoutOrderItemsInputSchema';
import { ProductUncheckedCreateWithoutOrderItemsInputSchema } from './ProductUncheckedCreateWithoutOrderItemsInputSchema';
import { ProductCreateOrConnectWithoutOrderItemsInputSchema } from './ProductCreateOrConnectWithoutOrderItemsInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedOneWithoutOrderItemsInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutOrderItemsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutOrderItemsInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutOrderItemsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutOrderItemsInputSchema).optional(),
      connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
    })
    .strict();

export default ProductCreateNestedOneWithoutOrderItemsInputSchema;
